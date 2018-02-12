import Vue from 'vue';

import Vuex from 'vuex';
import {ADD_PRODUCT_TO_CART, CHECKOUT, INCREASE_PROD_QTY,
        DECREASE_PROD_QTY, UPDATE_COUPON_CODE} from './mutation-types.js';

import VueResource from 'vue-resource';
import VueRouter from 'vue-router';

import App from './App.vue';
import {routes} from './routes';

Vue.use(Vuex);
Vue.use(VueResource);
Vue.use(VueRouter);

const store = new Vuex.Store({
  state: {
    cart: {items: []},
    couponCode: '',
  },
  getters: {
    cartTotal: (state) => {
      let total = 0;
      state.cart.items.forEach((item) => total += item.product.price * item.quantity);
      return total;
    },
    taxAmount: (state, getters) => (pct) => getters.cartTotal * pct / 100,
    getCartItem: (state) => (product) => {
      for(let i=0; i<state.cart.items.length; i++) {
        if(state.cart.items[i].product.id === product.id) return state.cart.items[i];
      }
      return null;
    },
  },
  actions: {
    [ADD_PRODUCT_TO_CART]({commit, getters}, payload) {
      return new Promise((resolve, reject) => {
        let itemInCart = getters.getCartItem(payload.product);
        payload.cartItem = itemInCart;
        if(!itemInCart) {
          let requestUrl = 'cart/add/{productId}/{quantity}';
          Vue.http.post(requestUrl, {}, {params: {productId: payload.product.id,
                                                  quantity: payload.quantity}})
                  .then((response) => {
                          commit(ADD_PRODUCT_TO_CART, payload);
                          resolve();
                        },
                        (response) => {
                          alert('Could not add product to cart.');
                          reject();
                        });
        } else {
          let requestUrl = 'cart/increase-quantity/{productId}';
          Vue.http.post(requestUrl, {}, {params: {productId: payload.product.id}})
                  .then((response) => {
                          commit(INCREASE_PROD_QTY, payload);
                          resolve();
                        },
                        (response) => {
                          alert('Could not increase product quantity.');
                          reject();
                        });
        }
      });
    },
    [INCREASE_PROD_QTY]({commit, getters}, payload) {
      let itemInCart = getters.getCartItem(payload.product);
      payload.cartItem = itemInCart;
      commit(INCREASE_PROD_QTY, payload);
    },
    [DECREASE_PROD_QTY]({commit, getters}, payload) {
      let itemInCart = getters.getCartItem(payload.product);
      payload.cartItem = itemInCart;
      commit(DECREASE_PROD_QTY, payload);
    },
  },
  mutations: {
    [ADD_PRODUCT_TO_CART](state, payload) {
      state.cart.items.push({
        product: payload.product,
        quantity: payload.quantity,
      });
      payload.product.inStock -= payload.quantity;
    },
    [CHECKOUT](state) {
      state.cart.items.forEach((item) => item.product.inStock += item.quantity);
      state.cart.items = [];
      state.couponCode = '';
    },
    [INCREASE_PROD_QTY](state, payload) {
      payload.cartItem.quantity += payload.quantity;
      payload.product.inStock -= payload.quantity;
    },
    [DECREASE_PROD_QTY](state, payload) {
      if(payload.cartItem.quantity > 1) payload.cartItem.quantity -= payload.quantity;
      else state.cart.items.pop(payload.cartItem);
      payload.product.inStock += payload.quantity;
    },
    [UPDATE_COUPON_CODE](state, payload) {
      state.couponCode = payload;
    },
  },
});

Vue.filter('currency', function(value) {
  let formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  });
  return formatter.format(value);
});

const router = new VueRouter({
  routes,
  mode: 'history',
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        selector: to.hash,
      };
    }
    if (savedPosition) {
      return savedPosition;
    }
    return { x: 0, y: 0 };
  }
});

Vue.http.options.root = 'http://localhost:3000';

new Vue({
  el: '#app',
  render: h => h(App),
  router,
  store,
});
