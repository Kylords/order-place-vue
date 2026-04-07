<template>
  <form @submit.prevent="handleRegister">
    <h2>Register</h2>

    <div>
      <label for="name">Name</label>
      <input type="text" id="name" class="input" v-model="registerForm.name" required />
    </div>

    <div>
      <label for="email">Email</label>
      <input type="email" id="email" class="input" v-model="registerForm.email" required />
    </div>

    <div>
      <label for="password">Password</label>
      <input type="password" id="password" class="input" v-model="registerForm.password" required />
    </div>

    <div>
      <label for="password_confirmation">Confirm Password</label>
      <input
        type="password"
        id="password_confirmation"
        class="input"
        v-model="registerForm.password_confirmation"
        required
      />
    </div>

    <button type="submit" :disabled="loading">Register</button>
  </form>
</template>

<script>
export default {
  name: 'RegisterForm',
  data() {
    return {
      registerForm: {
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
      },
      errors: [],
      loading: false,
      notyf: new window.Notyf()
    }
  },
  methods: {
    async handleRegister() {
      this.errors = []
      this.loading = true

      try {
        const response = await fetch('http://localhost:3000/api/v1/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.registerForm)
        })

        let data = {}
        try {
          data = await response.json()
        } catch (err) {
          console.warn('Server did not return JSON', err)
        }

        if (!response.ok) {
          if (data.errors) {
            this.errors = data.errors
            this.notyf.error(data.errors.join('\n'))
          } else {
            this.notyf.error('Registration failed')
          }
        } else {
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))

          this.$emit('login-success', data.user, data.token)
        }
      } catch (err) {
        console.error(err)
        this.notyf.error('Network error')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
form { max-width: 300px; margin: auto; }
div { margin-bottom: 10px; }
label { display: block; margin-bottom: 4px; }
input { width: 100%; padding: 6px; }
button { padding: 8px 16px; }
</style>