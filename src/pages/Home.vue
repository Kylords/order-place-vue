<template>
  <div>
    <h1>Products</h1>

    <div v-if="user?.role === 'admin'" class="create-products">
      <h2>Add Products</h2>

      <div v-for="(p, index) in newProducts" :key="index" class="product-form">
        <input v-model="p.name" placeholder="Name" />
        <input v-model="p.code" placeholder="Code" />
        <input v-model.number="p.price" placeholder="Price" type="number" />

        <button @click="removeProduct(index)" :disabled="newProducts.length === 1">
          Remove
        </button>
      </div>

      <button @click="addProduct">Add Another Product</button>
      <button @click="submitProducts">Submit All</button>
    </div>

    <div class="filter">
      <label for="status">Filter by status:</label>
      <select v-model="statusFilter" @change="applyFilter">
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="created">Created</option>
      </select>
    </div>

    <div v-if="user?.role === 'admin' && selectedProducts.length">
      <button @click="activateSelected">
        Activate Selected ({{ selectedProducts.length }})
      </button>
    </div>

    <div class="products">
      <div v-for="product in products" :key="product.id" class="product-card">
        <div v-if="user?.role === 'admin' && product.status === 'C'">
          <input
            type="checkbox"
            :value="product.code"
            v-model="selectedProducts"
          />
        </div>

        <div v-if="editingProductId === product.id">
          <input v-model="editableProduct.name" placeholder="Name" />
          <input v-model="editableProduct.code" placeholder="Code" />
          <input v-model.number="editableProduct.price" placeholder="Price" type="number" />
          <select v-model="editableProduct.status">
            <option value="A">Active</option>
            <option value="C">Created</option>
          </select>
    
          <button @click="saveProduct(product.id)">Save</button>
          <button @click="cancelEdit">Cancel</button>
        </div>
        <div v-else>
          <h2>{{ product.name }}</h2>
          <p>Code: {{ product.code }}</p>
          <p>₱ {{ product.price }}</p>
          <p v-if="user?.role === 'admin'">Status: {{ product.status }}</p>
    
          <button @click="addToCart(product.id)" :disabled="user?.role === 'admin'">Add to Cart</button>
          <button v-if="user?.role === 'admin'" @click="editProduct(product)">Edit</button>
        </div>
      </div>
    </div>

    <div class="pagination" v-if="totalPages > 1">
      <button :disabled="page <= 1" @click="fetchProducts(page - 1)">Previous</button>
      <span>Page {{ page }} of {{ totalPages }}</span>
      <button :disabled="page >= totalPages" @click="fetchProducts(page + 1)">Next</button>
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
      products: [],
      newProducts: [{ name: '', code: '', price: 0 }],
      editingProductId: null,
      editableProduct: {},
      
      page: 1,
      perPage: 2,
      totalPages: 1,
      statusFilter: 'all',
      loading: false,

      selectedProducts: []
    }
  },
  mounted() {
    this.fetchProducts()
  },
  methods: {
    async fetchProducts(page = this.page) {
      this.loading = true
      try {
        const url = new URL('http://localhost:3000/api/v1/products')
        url.searchParams.append('page', page)
        url.searchParams.append('per_page', this.perPage)
        url.searchParams.append('status', this.statusFilter)

        const response = await fetch(url)
        const data = await response.json()

        this.products = data.products || []
        this.page = data.meta?.page || page
        this.totalPages = data.meta?.total_pages || 1
      } catch (err) {
        console.error(err)
        new window.Notyf().error('Failed to fetch products')
      } finally {
        this.loading = false
      }
    },
    applyFilter() {
      this.page = 1
      this.fetchProducts()
    },
    editProduct(product) {
      this.editingProductId = product.id
      this.editableProduct = { ...product }
    },
    cancelEdit() {
      this.editingProductId = null
      this.editableProduct = {}
    },
    async saveProduct(productId) {
      try {
        const response = await fetch(`http://localhost:3000/api/v1/products/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: this.editableProduct.name,
            code: this.editableProduct.code,
            price: this.editableProduct.price,
            status: this.editableProduct.status,
          })
        })

        const data = await response.json()
        if (!response.ok) {
          new window.Notyf().error(data.errors.join(', ') || 'Something went wrong')
        } else {
          this.fetchProducts()
          this.cancelEdit()
        }
      } catch (err) {
        console.error(err)
      }
    },
    addProduct() {
      this.newProducts.push({ name: '', code: '', price: 0 })
    },
    removeProduct(index) {
      this.newProducts.splice(index, 1)
    },
    submitProducts() {
      const payloadData = this.newProducts.filter(p => p.name && p.code)
    
      if (!payloadData.length) return new window.Notyf().error('Please fill in at least one product')
    
      const payload = {
        status: 'C',
        data: payloadData
      }
    
      fetch('http://localhost:3000/api/v1/products/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(res => res.json())
        .then(data => {
          if (data.errors) {
            new window.Notyf().error(data.errors.join(', ') || 'Something went wrong')
          } else {
            this.newProducts = [{ name: '', code: '', price: 0 }]
            this.fetchProducts()
          }
        })
        .catch(err => console.error(err))
    },
    async addToCart(productId) {
      const token = localStorage.getItem('token')

      if (!token) {
        new window.Notyf().error('Please login first')
        return
      }

      try {
        const response = await fetch('http://localhost:3000/api/v1/cart/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            product_id: productId,
            quantity: 1
          })
        })

        const data = await response.json()
  
        if (!response.ok) {
          new window.Notyf().error(data.error)
        } else {
          this.$emit('update-cart-count', data.cart_count)
  
          if (window.Notyf) {
            new window.Notyf().success('Added to cart')
          }
        }

      } catch (err) {
        console.error('err', err)
      }
    },
    async activateSelected() {
      if (!this.selectedProducts.length) return

      const payload = {
        status: 'A',
        data: this.selectedProducts.map(code => ({ code }))
      }

      try {
        const response = await fetch('http://localhost:3000/api/v1/products/batch', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })

        const data = await response.json()

        if (!response.ok) {
          new window.Notyf().error(data.errors?.join(', ') || 'Something went wrong')
        } else {
          new window.Notyf().success(`Activated ${data.updated_count} products`)
          this.selectedProducts = []
          this.fetchProducts()
        }
      } catch (err) {
        console.error(err)
      }
    }
  }
}
</script>

<style scoped>
.create-products {
  margin-bottom: 40px;
  border: 1px solid #ccc;
  padding: 16px;
  border-radius: 8px;
}

.product-form {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.product-form input,
.product-form select {
  padding: 4px 8px;
}

.products {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.product-card {
  border: 1px solid #ddd;
  padding: 16px;
  border-radius: 8px;
}
</style>