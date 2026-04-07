<template>
  <div id="app">
    <Navbar
      :user="currentUser"
      :active-tab.sync="activeTab"
      :cart-count="cartCount"
      @logout="handleLogout"
      @update:activeTab="activeTab = $event"
    />

    <router-view
      :user="currentUser"
      :active-tab.sync="activeTab"
      @login-success="handleLogin"
      @update-cart-count="cartCount = $event"
    />
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue'

export default {
  name: 'App',
  components: { Navbar },
  data() {
    return {
      currentUser: null,
      activeTab: 'signin',
      cartCount: 0
    }
  },
  mounted() {
    this.fetchCurrentUser()
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      const parsedUser = JSON.parse(storedUser)
      user.value = parsedUser
      notifCount.value = parsedUser.unreadNotificationsCount || 0
    } else {
      this.$router.push({ name: 'Login' });
    }
  },
  methods: {
    async fetchCurrentUser() {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      const user_id = JSON.parse(user)?.id

      if (!token) return

      try {
        const response = await fetch(`http://localhost:3000/api/v1/users/${user_id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })

        const data = await response.json()

        if (!response.ok) {
          new window.Notyf().error('Failed to fetch user', data)
          return
        }

        this.currentUser = data
        this.cartCount = data.cart_count

      } catch (error) {
        new window.Notyf().error('Error fetching user:', error)
      }
    },
    handleLogout() {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      this.currentUser = null
      this.cartCount = 0
      this.$router.push({ name: 'Login' });
    },
    handleLogin(loggedInUser, token) {
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      console.log('user', loggedInUser)
      localStorage.setItem('token', token);
      this.currentUser = loggedInUser
      this.cartCount = loggedInUser.cart_count
      this.$router.push({ name: 'Home' });
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #2c3e50;
  margin: 0;
  padding: 0;
}
</style>