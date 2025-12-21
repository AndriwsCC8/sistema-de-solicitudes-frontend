<template>
  <div class="min-h-screen bg-gradient-to-br from-[#0f3a72] to-[#1a4d8f] flex items-center justify-center p-4">
    <div class="w-full max-w-md p-8 shadow-2xl bg-white rounded-lg">
      <!-- Logo y título -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-[#0f3a72] rounded-2xl mb-4">
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
          <label for="email" class="text-sm font-medium">Correo Electrónico</label>
          <div class="relative">
            <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="usuario@empresa.com"
              class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
              required
            />
          </div>
        </div>

        <div class="space-y-2">
          <label for="password" class="text-sm font-medium">Contraseña</label>
          <div class="relative">
            <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="Ingresa tu contraseña"
              class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
              required
            />
          </div>
        </div>

        <div class="space-y-2">
          <label for="role" class="text-sm font-medium">Tipo de Usuario (Demo)</label>
          <div class="relative">
            <User class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
            <select
              id="role"
              v-model="role"
              class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72] appearance-none bg-white"
            >
              <option value="user">👤 Usuario Normal</option>
              <option value="agent">👨‍💼 Agente de Área</option>
              <option value="admin">⚙️ Administrador</option>
              <option value="super-admin">👑 Super Administrador</option>
            </select>
          </div>
        </div>

        <div class="flex items-center justify-between text-sm">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              v-model="rememberMe"
              type="checkbox"
              class="w-4 h-4 rounded border-gray-300 text-[#0f3a72] focus:ring-[#0f3a72]"
            />
            <span class="text-gray-600">Recordarme</span>
          </label>
          <a href="#" class="text-[#0f3a72] hover:text-[#0d3260] font-medium">
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        <button
          type="submit"
          class="w-full bg-[#0f3a72] hover:bg-[#0d3260] text-white font-medium py-3 rounded-lg transition-colors"
        >
          Iniciar Sesión
        </button>

        <div class="text-center text-sm text-gray-600">
          <p>¿No tienes una cuenta? <a href="#" class="text-[#0f3a72] hover:text-[#0d3260] font-medium">Solicitar acceso</a></p>
        </div>
      </form>

      <!-- Info adicional -->
      <div class="mt-6 p-4 bg-blue-50 rounded-lg">
        <p class="text-xs text-gray-600 text-center">
          🔒 Tus datos están protegidos con encriptación de nivel empresarial
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Settings, Lock, Mail, User } from 'lucide-vue-next'

interface LoginEmits {
  (e: 'login', role: string): void
}

const emit = defineEmits<LoginEmits>()

const email = ref('')
const password = ref('')
const role = ref('user')
const rememberMe = ref(false)

const handleSubmit = () => {
  // Aquí normalmente validarías las credenciales
  emit('login', role.value)
}
</script>
