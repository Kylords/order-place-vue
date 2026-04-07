<template>
  <div class="orders-page">
    <h1>My Orders</h1>

    <div v-if="loading">Loading orders...</div>
    <div v-else-if="orders.length === 0">You have no orders yet.</div>

    <div v-else class="orders-list">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <h2>Order #{{ order.id }}</h2>
        <p>Total Amount: ₱ {{ order.total_amount }}</p>
        <p>Status: {{ order.status }}</p>
      
        <h3>Items:</h3>
        <ul>
          <li v-for="item in order.order_items" :key="item.id">
            {{ item.quantity }} × {{ item.product.name }} (₱{{ item.price }})
          </li>
        </ul>

        <button 
          v-if="order.status !== 'completed' && user?.role === 'admin'"
          @click="markAsCompleted(order.id)"
        >
          Mark as Completed
        </button>
      </div>
    </div>

    <div class="pagination" v-if="totalPages > 1">
      <button 
        :disabled="page <= 1" 
        @click="fetchOrders(page - 1)">
        Previous
      </button>

      <span>Page {{ page }} of {{ totalPages }}</span>

      <button 
        :disabled="page >= totalPages" 
        @click="fetchOrders(page + 1)">
        Next
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    user: Object,
  },
  data() {
    return {
      orders: [],
      loading: false,
      page: 1,
      perPage: 2,
      totalPages: 1
    }
  },
  mounted() {
    this.fetchOrders()
  },
  methods: {
    async fetchOrders(page = this.page) {
      this.loading = true
      const token = localStorage.getItem('token')
      if (!token) {
        new window.Notyf().error('Please login first')
        this.$router.push({ name: 'login' })
        return
      }

      try {
        const response = await fetch(`http://localhost:3000/api/v1/orders?page=${page}&per_page=${this.perPage}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })

        const data = await response.json()

        if (!response.ok) {
          new window.Notyf().error('Failed to fetch orders')
          return
        }

        this.orders = data.orders || []
        this.page = data.meta?.page || page
        this.totalPages = data.meta?.total_pages || 1
      } catch (err) {
        console.error(err)
        new window.Notyf().error('Network error')
      } finally {
        this.loading = false
      }
    },
    async markAsCompleted(orderId) {
      const token = localStorage.getItem('token')
      if (!token) {
        new window.Notyf().error('Please login first')
        return
      }

      try {
        const response = await fetch(`http://localhost:3000/api/v1/orders/${orderId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'completed' })
        })

        const data = await response.json()

        if (!response.ok) {
          new window.Notyf().error(data.error || 'Failed to update order status')
        } else {
          this.fetchOrders()
          if (window.Notyf) {
            new window.Notyf().success('Order marked as completed')
          }
        }
      } catch (err) {
        console.error(err)
        new window.Notyf().error('Network error')
      }
    }
  }
}
</script>

<style scoped>
.orders-page {
  max-width: 800px;
  margin: auto;
  padding: 16px;
}

.order-card {
  border: 1px solid #ddd;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.order-card ul {
  padding-left: 16px;
}
</style>