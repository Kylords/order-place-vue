<template>
  <div class="cart-page">
    <h1>Your Cart</h1>

    <div v-if="cartItems.length === 0">
      <p>Your cart is empty</p>
    </div>

    <div v-else>
      <div v-for="item in cartItems" :key="item.id" class="cart-item">
        <div class="info">
          <h3>{{ item.product.name }}</h3>
          <p>₱ {{ item.product.price }}</p>
        </div>

        <div class="quantity">
           <button @click="updateQuantity(item, -1)" :disabled="item.quantity === 1">-</button>
          <span>{{ item.quantity }}</span>
          <button @click="updateQuantity(item, 1)">+</button>
        </div>

        <div class="subtotal">
          ₱ {{ item.product.price * item.quantity }}
        </div>

        <button class="remove" @click="removeItem(item.product_id)">
          Remove
        </button>
      </div>

      <div class="cart-summary">
        <h2>Total: ₱ {{ totalAmount }}</h2>
        <button class="checkout" @click="checkout" :disabled="cartItems.length === 0">
          Checkout
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    user: Object,
  },
  name: 'CartPage',
  data() {
    return {
      cartItems: [],
      totalAmount: 0
    }
  },
  mounted() {
    if (this.user?.role === 'admin') {
      new window.Notyf().error("Admins are not allowed to access the cart")
      this.$router.push({ name: 'Home' })
    }
    this.fetchCart()
  },
  methods: {
    async fetchCart() {
      const token = localStorage.getItem('token')

      try {
        const response = await fetch('http://localhost:3000/api/v1/cart', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        const data = await response.json()

        this.cartItems = data.cart_items || data.cart.cart_items
        this.totalAmount = data.total_amount || data.cart.total_amount

      } catch (err) {
        console.error(err)
      }
    },

    async updateQuantity(item, change) {
      const token = localStorage.getItem('token')

      const newQty = item.quantity + change
      if (newQty <= 0) return

      try {
        const response = await fetch('http://localhost:3000/api/v1/cart/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            product_id: item.product_id,
            quantity: newQty
          })
        })

        const data = await response.json()

        this.cartItems = data.cart.cart_items
        this.totalAmount = data.cart.total_amount

        this.$emit('update-cart-count', data.cart_count)

      } catch (err) {
        console.error(err)
      }
    },

    async removeItem(productId) {
      const token = localStorage.getItem('token')

      try {
        const response = await fetch('http://localhost:3000/api/v1/cart/remove', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            product_id: productId
          })
        })

        const data = await response.json()

        this.cartItems = data.cart.cart_items
        this.totalAmount = data.cart.total_amount

        this.$emit('update-cart-count', data.cart_count)

      } catch (err) {
        console.error(err)
      }
    },

    async checkout() {
      const token = localStorage.getItem('token')

      if (!token) {
        new window.Notyf().error('Please login first')
        return
      }

      try {
        const response = await fetch('http://localhost:3000/api/v1/cart/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })

        const data = await response.json()

        if (!response.ok) {
          new window.Notyf().error(data.errors?.join(', ') || 'Checkout failed')
          return
        }

        if (window.Notyf) {
          new window.Notyf().success('Checkout successful!')
        }

        this.cartItems = []
        this.totalAmount = 0

        this.$emit('update-cart-count', 0)

        this.$router.push({ name: 'Home' })

      } catch (err) {
        console.error(err)
        new window.Notyf().error(err || 'Network error')
      }
    }
  }
}
</script>

<style scoped>
.cart-page {
  max-width: 800px;
  margin: auto;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #ddd;
  padding: 12px;
  margin-bottom: 10px;
}

.quantity button {
  padding: 4px 8px;
}

.subtotal {
  font-weight: bold;
}

.remove {
  background: red;
  color: white;
}

.cart-summary {
  margin-top: 20px;
  text-align: right;
}
</style>