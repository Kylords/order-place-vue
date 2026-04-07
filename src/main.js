import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'

import Home from './pages/Home.vue'
import Login from './pages/Login.vue'
import Cart from './pages/Cart.vue'
import Order from './pages/Order.vue'

Vue.use(VueRouter)

const routes = [
    { path: '/', name: 'Home', component: Home, props: true },
    { path: '/login', name: 'Login', component: Login, props: true  },
    { path: '/cart', name: 'Cart', component: Cart, props: true  },
    { path: '/order', name: 'Order', component: Order, props: true  },
  ]

const router = new VueRouter({
  mode: 'history',
  routes
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')