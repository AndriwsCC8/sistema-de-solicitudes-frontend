<template>
  <div class="min-h-screen bg-gradient-to-br from-[#0f3a72] to-[#1a4d8f] flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Círculos decorativos animados en el fondo -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl floating"></div>
      <div class="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl floating-delayed"></div>
      <div class="absolute top-1/2 left-1/3 w-64 h-64 bg-white/8 rounded-full blur-2xl floating-slow"></div>
    </div>

    <!-- Formulario con animación de entrada -->
    <div class="w-full max-w-md p-8 shadow-2xl bg-white rounded-lg relative z-10 card-enter">
      <!-- Logo y título -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-[#0f3a72] rounded-2xl mb-4 shadow-lg logo-scale">
          <Settings class="w-9 h-9 text-white" />
        </div>
        <h1 class="text-2xl font-semibold text-gray-900 mb-1">
          Mesa de Servicios
        </h1>
        <p class="text-gray-600">Sistema de Solicitudes Internas</p>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div class="space-y-2">
          <label for="email" class="text-sm font-medium">Usuario</label>
          <div class="relative group">
            <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#0f3a72] transition-colors" />
            <input
              id="email"
              v-model="email"
              type="text"
              placeholder="superadmin"
              class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72] focus:border-transparent transition-all"
              required
            />
          </div>
        </div>

        <div class="space-y-2">
          <label for="password" class="text-sm font-medium">Contraseña</label>
          <div class="relative group">
            <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#0f3a72] transition-colors" />
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="Ingresa tu contraseña"
              class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72] focus:border-transparent transition-all"
              required
            />
          </div>
        </div>

        <!-- Mensaje de error -->
        <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-200 rounded-lg error-shake">
          <p class="text-sm text-red-600 text-center">{{ errorMessage }}</p>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-[#0f3a72] hover:bg-[#0d3260] text-white font-medium py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <span v-if="loading" class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Iniciando sesión...
          </span>
          <span v-else>Iniciar Sesión</span>
        </button>
      </form>

      <!-- Info adicional -->
      <div class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <p class="text-xs text-gray-600 text-center flex items-center justify-center gap-2">
          <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Tus datos están protegidos con encriptación de nivel empresarial
        </p>
      </div>

      <!-- Footer decorativo -->
      <div class="mt-8 pt-6 border-t border-gray-200">
        <div class="text-center text-xs text-gray-500">
          <span>© 2026 Mesa de Servicios by Andriws Castillo</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Settings, Lock, Mail } from 'lucide-vue-next'
import { useAuthStore } from '../../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

const handleSubmit = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await authStore.login(email.value, password.value)
    
    // Verificar que el login fue exitoso y el usuario tiene rol
    if (!response.user || typeof response.user.rol !== 'number') {
      throw new Error('Error en los datos del usuario')
    }

    // Log para debugging (remover en producción)
    console.log('Login exitoso:', {
      nombre: response.user.nombre,
      rol: response.user.rol,
      email: response.user.email
    })

    // Navegar al dashboard
    router.push('/dashboard')
  } catch (error: any) {
    console.error('Error en login:', error)
    errorMessage.value = error.response?.data?.message || error.message || 'Error al iniciar sesión. Verifica tus credenciales.'
    
    // Limpiar campos en caso de error
    password.value = ''
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Animaciones de flotación simplificadas */
@keyframes floating {
  0% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(-20px, -30px);
  }
  100% {
    transform: translate(0, 0);
  }
}

@keyframes floating-delayed {
  0% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(20px, 25px);
  }
  100% {
    transform: translate(0, 0);
  }
}

@keyframes floating-slow {
  0% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(30px, -25px) scale(1.05);
  }
  100% {
    transform: translate(0, 0) scale(1);
  }
}

.floating {
  animation: floating 6s ease-in-out infinite;
}

.floating-delayed {
  animation: floating-delayed 8s ease-in-out infinite;
}

.floating-slow {
  animation: floating-slow 10s ease-in-out infinite;
}

/* Animación de entrada del formulario */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-enter {
  animation: fade-in-up 0.6s ease-out;
}

/* Animación del logo */
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.logo-scale {
  animation: scale-in 0.5s ease-out 0.2s both;
}

/* Animación de error */
@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
}

.error-shake {
  animation: shake 0.5s ease-in-out;
}
</style>
