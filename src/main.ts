import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './app/App.vue'
import './styles/index.css'
import { useAuthStore } from './stores/authStore'

// Importar utilidades de debug en desarrollo
if (import.meta.env.DEV) {
  import('./utils/authDebug')
}

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Inicializar el store de autenticación
const authStore = useAuthStore()
authStore.initialize()

app.mount('#app')
