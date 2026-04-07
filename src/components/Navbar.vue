<template>
  <div class="navbar">
    <div class="logo" @click="toHomePage">MyShop</div>

    <div v-if="!user" class="nav-buttons">
      <button
        :class="{ active: activeTab === 'signin' }"
        @click="$emit('update:activeTab', 'signin')"
      >
        Sign In
      </button>

      <button
        :class="{ active: activeTab === 'register' }"
        @click="$emit('update:activeTab', 'register')"
      >
        Register
      </button>
    </div>

    <div v-else class="user-nav">
      <button class="logout" @click="$emit('logout')">Logout</button>

      <div class="cart-wrapper" @click="goToCart">
        <svg :width="28" :height="28" viewBox="0 0 24 24" fill="white">
          <path :d="mdiCart" />
        </svg>

        <span v-if="cartCount > 0" class="badge">
          {{ cartCount }}
        </span>
      </div>

      <button @click="goToOrders">
        Orders
      </button>
    </div>
  </div>
</template>

<script>
import { mdiCart } from '@mdi/js'

export default {
  props: {
    user: Object,
    activeTab: String,
    cartCount: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      mdiCart
    }
  },
  methods: {
    toHomePage() {
      this.$router.push({ name: 'Home' });
    },
    goToCart() {
      if (this.user?.role === 'admin') {
        new window.Notyf().error("Admins are not allowed to access the cart")
        return
      }
      this.$router.push({ name: 'Cart' });
    },
    goToOrders() {
      this.$router.push({ name: 'Order' });
    }
  }
}
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #222;
  padding: 0 16px;
  height: 60px;
  color: white;
}

.logo {
  font-weight: bold;
  font-size: 20px;
  cursor: pointer;
}

.nav-buttons button {
  margin-left: 12px;
  background: none;
  border: 1px solid white;
  color: white;
  padding: 6px 12px;
  cursor: pointer;
}

.nav-buttons button.active {
  background-color: white;
  color: #222;
}

.user-nav {
  display: flex;
  align-items: center;
}

.user-nav .logout {
  background: none;
  border: 1px solid white;
  color: white;
  padding: 6px 12px;
  cursor: pointer;
  margin-right: 12px;
}

.cart-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background-color: red;
  color: white;
  font-size: 12px;
  font-weight: bold;
  border-radius: 50%;
  padding: 2px 6px;
}
</style>