<template>
  <div>
    <h1>Cart</h1>
    <table v-if="cart.items.length > 0" class="table table-striped">
      <thead>
      <tr>
        <th>Product</th>
        <th>Quantity</th>
        <th>Price</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="item in cart.items" :key="item.id">
        <td>{{item.product.name}}</td>
        <td>
          {{item.quantity}}&nbsp;
          <button class="btn btn-success"
                  @click="incProdQty({product: item.product, quantity: 1})"
                  :disabled="item.product.inStock == 0">+
          </button>
          <button class="btn btn-danger"
                  @click="decProdQty({product: item.product, quantity: 1})">-
          </button>
        </td>
        <td>{{item.quantity * item.product.price | currency}}</td>
      </tr>
      <tr>
        <td class="text-right" colspan="2">
          <strong>Subtotal</strong>
        </td>
        <td>{{cartTotal | currency}}</td>
      </tr>
      <tr>
        <td class="text-right" colspan="2">
          <strong>Taxes</strong>
        </td>
        <td>{{taxAmount(8.25) | currency}}</td>
      </tr>
      <tr>
        <td class="text-right" colspan="2">
          <strong>Coupon code</strong>
        </td>
        <td>
          <input type="text" class="form-control"
                 placeholder="Enter coupon code here"
                 v-model="couponCode">
        </td>
      </tr>
      <tr>
        <td class="text-right" colspan="2">
          <strong>Grand total</strong>
        </td>
        <td>{{cartTotal + taxAmount(8.25) | currency}}</td>
      </tr>
      <tr>
        <td colspan="2">
          <span v-if="couponCode">
            <em>Your coupon code is: {{couponCode}}</em>
          </span>
        </td>
        <td><button class="btn btn-success" @click="checkout">Checkout</button></td>
      </tr>
      </tbody>
    </table>
    <p v-else>Your cart is currently empty.</p>
  </div>
</template>

<script>
  import {mapGetters, mapMutations, mapActions} from 'vuex';
  import {CHECKOUT, UPDATE_COUPON_CODE,
          INCREASE_PROD_QTY, DECREASE_PROD_QTY} from './mutation-types.js';
  // import CartMixin from './mixins/cart';

  export default {
    // mixins: [CartMixin],
    computed: {
      ...mapGetters([
        'cartTotal',
        'taxAmount',
      ]),
      cart() {return this.$store.state.cart;},
      couponCode: {
        get() {return this.$store.state.couponCode;},
        set(value) {this.$store.commit(UPDATE_COUPON_CODE, value);},
      },
    },
    methods: {
      ...mapMutations([CHECKOUT]),
      ...mapActions([INCREASE_PROD_QTY, DECREASE_PROD_QTY]),
    },
    beforeRouteLeave(to, from, next) {
      if (this.cart.items.length > 0) {
        if (!confirm('Are you sure?')) return next(false);
      }
      next();
    },
  };
</script>
