<template>
  <div class="form-container">
    <LoginForm v-if="activeTab === 'signin'" @login-success="emitLogin" />
    <RegisterForm v-else @login-success="emitLogin" />
  </div>
</template>

<script>
import LoginForm from '../components/LoginForm.vue'
import RegisterForm from '../components/RegisterForm.vue'

export default {
  name: 'AuthForm',
  components: {
    LoginForm,
    RegisterForm
  },
  props: {
    activeTab: {
      type: String,
      default: 'signin'
    }
  },
  emits: ['update:activeTab', 'login-success'],
  mounted() {
    const storedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (storedUser && token) {
      this.$router.push({ name: 'Home' })
    }
  },
  methods: {
    emitLogin(user, token) {
      this.$emit('login-success', user, token)
    }
  }
}
</script>

<style scoped>
.form-container {
  max-width: 400px;
  margin: auto;
  padding: 20px;
}
</style>