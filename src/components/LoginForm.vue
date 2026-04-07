<template>
  <form @submit.prevent="handleLogin">
    <h2>Login</h2>

    <div>
      <label for="email">Email</label>
      <input type="email" id="email" class="input" v-model="loginForm.email" required />
    </div>

    <div>
      <label for="password">Password</label>
      <input type="password" id="password" class="input" v-model="loginForm.password" required />
    </div>

    <button type="submit" :disabled="loading">Login</button>
  </form>
</template>

<script>
export default {
  name: 'LoginForm',
  props: ['user'],
  data() {
    return {
      loginForm: {
        email: '',
        password: ''
      },
      errors: [],
      loading: false,
      notyf: new window.Notyf()
    }
  },
  methods: {
    async handleLogin() {
      this.errors = []
      this.loading = true

      try {
        const response = await fetch('http://localhost:3000/api/v1/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.loginForm)
        })

        let data = {}
        try {
          data = await response.json()
        } catch (err) {
          new window.Notyf().error('Server did not return JSON', err)
        }

        if (!response.ok) {
          if (data.errors) {
            this.errors = data.errors
            this.notyf.error(data.errors.join('\n'))
          } else {
            this.notyf.error('Login failed')
          }
        } else {
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))

          this.$emit('login-success', data.user, data.token)
        }
      } catch (err) {
        this.notyf.error('Error fetching user:', err)
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