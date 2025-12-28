<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">Panel de Administración</h1>
      <p class="text-gray-600 mt-1">Gestión y configuración del sistema</p>
    </div>

    <!-- Tabs -->
    <div class="bg-white rounded-lg shadow-sm mb-6">
      <div class="border-b border-gray-200">
        <nav class="flex -mb-px">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-6 py-4 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab.id
                ? 'border-[#0f3a72] text-[#0f3a72]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>
    </div>

    <!-- Users Management -->
    <div v-if="activeTab === 'users'" class="space-y-6">
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold text-gray-900">Gestión de Usuarios</h2>
          <button 
            @click="showNewUserModal = true"
            class="px-4 py-2 bg-[#0f3a72] text-white rounded-md hover:bg-[#0d3260] transition-colors"
          >
            + Agregar Usuario
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Área</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in users" :key="user.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-10 h-10 rounded-full bg-[#0f3a72] flex items-center justify-center text-white font-medium">
                      {{ user.name.charAt(0) }}
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.email }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getRoleBadgeClass(user.role)">
                    {{ getRoleLabel(user.role) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.area }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="user.active ? 'px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700' : 'px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700'">
                    {{ user.active ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <button class="text-[#0f3a72] hover:text-[#0d3260] mr-3">Editar</button>
                  <button class="text-red-600 hover:text-red-800">Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Areas Management -->
    <div v-if="activeTab === 'areas'" class="space-y-6">
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold text-gray-900">Gestión de Áreas</h2>
          <button class="px-4 py-2 bg-[#0f3a72] text-white rounded-md hover:bg-[#0d3260] transition-colors">
            + Agregar Área
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="area in areas" :key="area.id" class="border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">{{ area.name }}</h3>
              <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                {{ area.agentCount }} agentes
              </span>
            </div>
            <p class="text-sm text-gray-600 mb-4">{{ area.description }}</p>
            <div class="flex gap-2">
              <button class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                Editar
              </button>
              <button class="px-3 py-2 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Categories Management -->
    <div v-if="activeTab === 'categories'" class="space-y-6">
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold text-gray-900">Categorías de Solicitudes</h2>
          <button class="px-4 py-2 bg-[#0f3a72] text-white rounded-md hover:bg-[#0d3260] transition-colors">
            + Agregar Categoría
          </button>
        </div>

        <div class="space-y-4">
          <div v-for="category in categories" :key="category.id" class="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50">
            <div class="flex-1">
              <h3 class="text-base font-medium text-gray-900">{{ category.name }}</h3>
              <p class="text-sm text-gray-600">{{ category.description }}</p>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-sm text-gray-500">{{ category.requestCount }} solicitudes</span>
              <button class="text-[#0f3a72] hover:text-[#0d3260] text-sm">Editar</button>
              <button class="text-red-600 hover:text-red-800 text-sm">Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Settings -->
    <div v-if="activeTab === 'settings'" class="space-y-6">
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Configuración del Sistema</h2>
        
        <div class="space-y-6">
          <div>
            <label class="text-sm font-medium text-gray-700 mb-2 block">Nombre de la Organización</label>
            <input 
              type="text" 
              value="Mesa de Servicios"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
            />
          </div>

          <div>
            <label class="text-sm font-medium text-gray-700 mb-2 block">Email de Notificaciones</label>
            <input 
              type="email" 
              value="notificaciones@empresa.com"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
            />
          </div>

          <div>
            <label class="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked class="w-4 h-4 text-[#0f3a72] focus:ring-[#0f3a72] rounded" />
              <span class="text-sm text-gray-700">Permitir auto-registro de usuarios</span>
            </label>
          </div>

          <div>
            <label class="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked class="w-4 h-4 text-[#0f3a72] focus:ring-[#0f3a72] rounded" />
              <span class="text-sm text-gray-700">Enviar notificaciones por email</span>
            </label>
          </div>

          <div class="pt-4">
            <button class="px-6 py-2 bg-[#0f3a72] text-white rounded-md hover:bg-[#0d3260] transition-colors">
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Reports -->
    <div v-if="activeTab === 'reports'" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <p class="text-sm text-gray-600 mb-1">Total Solicitudes</p>
          <p class="text-3xl font-bold text-gray-900">247</p>
          <p class="text-xs text-green-600 mt-2">↑ 12% vs mes anterior</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6">
          <p class="text-sm text-gray-600 mb-1">En Progreso</p>
          <p class="text-3xl font-bold text-blue-600">45</p>
          <p class="text-xs text-gray-500 mt-2">18% del total</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6">
          <p class="text-sm text-gray-600 mb-1">Resueltas</p>
          <p class="text-3xl font-bold text-green-600">189</p>
          <p class="text-xs text-gray-500 mt-2">77% del total</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6">
          <p class="text-sm text-gray-600 mb-1">Tiempo Promedio</p>
          <p class="text-3xl font-bold text-gray-900">2.3h</p>
          <p class="text-xs text-red-600 mt-2">↓ 5% vs mes anterior</p>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Reportes Disponibles</h2>
        <div class="space-y-3">
          <button class="w-full text-left px-4 py-3 border rounded-lg hover:bg-gray-50 transition-colors">
            📊 Reporte de Solicitudes por Área
          </button>
          <button class="w-full text-left px-4 py-3 border rounded-lg hover:bg-gray-50 transition-colors">
            📈 Reporte de Desempeño de Agentes
          </button>
          <button class="w-full text-left px-4 py-3 border rounded-lg hover:bg-gray-50 transition-colors">
            ⏱️ Reporte de Tiempos de Respuesta
          </button>
          <button class="w-full text-left px-4 py-3 border rounded-lg hover:bg-gray-50 transition-colors">
            📋 Reporte Mensual Consolidado
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Nuevo Usuario -->
    <div v-if="showNewUserModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div class="flex justify-between items-center p-6 border-b">
          <h3 class="text-xl font-semibold text-gray-900">Crear Nuevo Usuario</h3>
          <button 
            @click="showNewUserModal = false"
            class="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
              <input 
                type="text" 
                v-model="newUser.name"
                placeholder="Juan Pérez"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input 
                type="email" 
                v-model="newUser.email"
                placeholder="juan.perez@empresa.com"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Rol</label>
              <select 
                v-model.number="newUser.role"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
              >
                <option :value="1">Usuario</option>
                <option :value="4">Agente de Área</option>
                <option :value="2">Administrador</option>
                <option :value="3">Super Administrador</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Área</label>
              <select 
                v-model="newUser.area"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
              >
                <option value="">Seleccionar área</option>
                <option v-for="area in areas" :key="area.id" :value="area.name">
                  {{ area.name }}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Contraseña Temporal</label>
            <input 
              type="password" 
              v-model="newUser.password"
              placeholder="Mínimo 8 caracteres"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
            />
          </div>

          <div>
            <label class="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                v-model="newUser.active"
                class="w-4 h-4 text-[#0f3a72] focus:ring-[#0f3a72] rounded" 
              />
              <span class="text-sm text-gray-700">Usuario activo</span>
            </label>
          </div>
        </div>

        <div class="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button 
            @click="showNewUserModal = false"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button 
            @click="createUser"
            class="px-4 py-2 bg-[#0f3a72] text-white rounded-md hover:bg-[#0d3260] transition-colors"
          >
            Crear Usuario
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { ROLES, hasMinRole } from '../../constants/roles'

const authStore = useAuthStore()
// Usar el getter del store para el rol
const userRole = computed(() => authStore.userRole)

const activeTab = ref(userRole.value === ROLES.SUPER_ADMIN ? 'users' : 'areas')

const tabs = computed(() => {
  const allTabs = [
    { id: 'users', label: 'Usuarios', minRole: ROLES.SUPER_ADMIN },
    { id: 'areas', label: 'Áreas', minRole: ROLES.ADMIN },
    { id: 'categories', label: 'Categorías', minRole: ROLES.ADMIN },
    { id: 'settings', label: 'Configuración', minRole: ROLES.ADMIN },
    { id: 'reports', label: 'Reportes', minRole: ROLES.ADMIN }
  ]
  return allTabs.filter(tab => hasMinRole(userRole.value, tab.minRole))
})

const showNewUserModal = ref(false)

const users = [
  { id: 1, name: 'Juan Pérez', email: 'juan.perez@empresa.com', role: 4, area: 'Soporte TI', active: true },      // Agente
  { id: 2, name: 'María García', email: 'maria.garcia@empresa.com', role: 2, area: 'Administración', active: true }, // Admin
  { id: 3, name: 'Carlos López', email: 'carlos.lopez@empresa.com', role: 1, area: 'Ventas', active: true },         // Usuario
  { id: 4, name: 'Ana Martínez', email: 'ana.martinez@empresa.com', role: 4, area: 'Recursos Humanos', active: false }, // Agente
]

const areas = [
  { id: 1, name: 'Soporte TI', description: 'Soporte técnico y sistemas', agentCount: 5 },
  { id: 2, name: 'Recursos Humanos', description: 'Gestión de personal', agentCount: 3 },
  { id: 3, name: 'Administración', description: 'Gestión administrativa', agentCount: 4 },
  { id: 4, name: 'Instalaciones', description: 'Mantenimiento de oficinas', agentCount: 2 },
]

const categories = [
  { id: 1, name: 'Incidente', description: 'Problema que requiere resolución inmediata', requestCount: 45 },
  { id: 2, name: 'Solicitud de Servicio', description: 'Petición de un servicio estándar', requestCount: 78 },
  { id: 3, name: 'Solicitud de Acceso', description: 'Permisos y accesos', requestCount: 32 },
  { id: 4, name: 'Solicitud de Información', description: 'Consultas generales', requestCount: 21 },
]

const getRoleBadgeClass = (role: number): string => {
  const classes: Record<number, string> = {
    3: 'px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700',      // Super Admin (3)
    2: 'px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700', // Admin (2)
    4: 'px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700',     // Agente (4)
    1: 'px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700'      // Usuario (1)
  }
  return classes[role] || classes[1]
}

import { getRoleName } from '../../constants/roles'

const getRoleLabel = getRoleName

const newUser = ref({
  name: '',
  email: '',
  role: 1, // Usuario por defecto
  area: '',
  password: '',
  active: true
})

const createUser = () => {
  // Validación básica
  if (!newUser.value.name || !newUser.value.email || !newUser.value.password) {
    alert('Por favor complete todos los campos obligatorios')
    return
  }

  if (newUser.value.password.length < 8) {
    alert('La contraseña debe tener al menos 8 caracteres')
    return
  }

  // Aquí se agregaría la lógica para crear el usuario en el backend
  const newUserId = users.length + 1
  users.push({
    id: newUserId,
    name: newUser.value.name,
    email: newUser.value.email,
    role: newUser.value.role,
    area: newUser.value.area,
    active: newUser.value.active
  })

  // Resetear formulario y cerrar modal
  newUser.value = {
    name: '',
    email: '',
    role: 1, // Usuario por defecto
    area: '',
    password: '',
    active: true
  }
  showNewUserModal.value = false
  alert('Usuario creado exitosamente')
}
</script>
