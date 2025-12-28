<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">Bandeja de Área</h1>
      <p class="text-gray-600 mt-1">Gestiona las solicitudes asignadas a tu área</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow-sm p-6">
        <p class="text-sm text-gray-600 mb-1">Pendientes</p>
        <p class="text-3xl font-bold text-orange-600">{{ pendingCount }}</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm p-6">
        <p class="text-sm text-gray-600 mb-1">En Progreso</p>
        <p class="text-3xl font-bold text-blue-600">{{ inProgressCount }}</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm p-6">
        <p class="text-sm text-gray-600 mb-1">Resueltas Hoy</p>
        <p class="text-3xl font-bold text-green-600">{{ resolvedTodayCount }}</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm p-6">
        <p class="text-sm text-gray-600 mb-1">Alta Prioridad</p>
        <p class="text-3xl font-bold text-red-600">{{ highPriorityCount }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        <!-- Search -->
        <div class="relative flex-1 max-w-md">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Buscar por número o asunto..."
            class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
          />
        </div>

        <!-- Filters -->
        <div class="flex gap-3">
          <select
            v-model="statusFilter"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
          >
            <option value="all">Todos los estados</option>
            <option value="open">Abierto</option>
            <option value="in-progress">En progreso</option>
            <option value="resolved">Resuelto</option>
          </select>

          <select
            v-model="priorityFilter"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
          >
            <option value="all">Todas las prioridades</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>

          <select
            v-model="assignedFilter"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
          >
            <option value="all">Todos</option>
            <option value="assigned">Asignadas a mí</option>
            <option value="unassigned">Sin asignar</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Requests List -->
    <div class="space-y-4">
      <div
        v-for="request in filteredRequests"
        :key="request.id"
        class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <span class="text-sm font-medium text-gray-500">{{ request.number }}</span>
              <span
                :class="[
                  'px-2 py-1 text-xs font-medium rounded-full border',
                  getPriorityColor(request.priority)
                ]"
              >
                {{ getPriorityLabel(request.priority) }}
              </span>
              <span
                :class="[
                  'px-2 py-1 text-xs font-medium rounded-full',
                  getStatusColor(request.status)
                ]"
              >
                {{ getStatusLabel(request.status) }}
              </span>
              <span v-if="request.assignedTo" class="text-xs text-gray-500">
                👤 {{ request.assignedTo }}
              </span>
              <span v-else class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                Sin asignar
              </span>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-1">{{ request.subject }}</h3>
            <p class="text-sm text-gray-600 mb-2">{{ request.description }}</p>
            <div class="flex items-center gap-4 text-sm text-gray-500">
              <span>📅 {{ formatDate(request.date) }}</span>
              <span>👤 {{ request.requester }}</span>
              <span v-if="request.dueDate" :class="isDueSoon(request.dueDate) ? 'text-red-600 font-medium' : ''">
                ⏰ Vence: {{ formatDate(request.dueDate) }}
              </span>
            </div>
          </div>
          <div class="flex flex-col gap-2 ml-4">
            <button
              @click="router.push(`/dashboard/request-detail/${request.id}`)"
              class="inline-flex items-center gap-2 px-4 py-2 text-[#0f3a72] hover:bg-gray-50 rounded-md transition-colors text-sm"
            >
              <Eye class="w-4 h-4" />
              Ver Detalles
            </button>
            <button
              v-if="!request.assignedTo"
              @click="assignToMe(request.id)"
              class="inline-flex items-center gap-2 px-4 py-2 bg-[#0f3a72] text-white hover:bg-[#0d3260] rounded-md transition-colors text-sm"
            >
              <User class="w-4 h-4" />
              Asignarme
            </button>
            <button
              v-if="request.status === 'open' && request.assignedTo"
              @click="startWork(request.id)"
              class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors text-sm"
            >
              ▶️ Iniciar
            </button>
            <button
              v-if="request.status === 'in-progress'"
              @click="resolveRequest(request.id)"
              class="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-md transition-colors text-sm"
            >
              ✓ Resolver
            </button>
          </div>
        </div>
      </div>

      <div v-if="filteredRequests.length === 0" class="text-center py-12 bg-white rounded-lg">
        <p class="text-gray-500">No se encontraron solicitudes</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Eye, User } from 'lucide-vue-next'

interface Request {
  id: string
  number: string
  subject: string
  description: string
  priority: 'high' | 'medium' | 'low'
  status: 'open' | 'in-progress' | 'resolved'
  date: string
  dueDate?: string
  requester: string
  assignedTo?: string
}

const router = useRouter()

const searchTerm = ref('')
const statusFilter = ref('all')
const priorityFilter = ref('all')
const assignedFilter = ref('all')

const areaRequests: Request[] = [
  {
    id: '1',
    number: 'REQ-2024-010',
    subject: 'Error en sistema de nómina',
    description: 'El sistema no calcula correctamente las horas extras',
    priority: 'high',
    status: 'open',
    date: '2024-12-17',
    dueDate: '2024-12-18',
    requester: 'Ana Martínez',
  },
  {
    id: '2',
    number: 'REQ-2024-011',
    subject: 'Instalación de software',
    description: 'Necesito instalación de Adobe Creative Suite',
    priority: 'medium',
    status: 'in-progress',
    date: '2024-12-16',
    dueDate: '2024-12-20',
    requester: 'Carlos López',
    assignedTo: 'Yo',
  },
  {
    id: '3',
    number: 'REQ-2024-012',
    subject: 'Recuperación de archivos',
    description: 'Archivos borrados accidentalmente de carpeta compartida',
    priority: 'high',
    status: 'open',
    date: '2024-12-17',
    dueDate: '2024-12-17',
    requester: 'María García',
  },
  {
    id: '4',
    number: 'REQ-2024-013',
    subject: 'Solicitud de acceso VPN',
    description: 'Necesito acceso remoto para trabajar desde casa',
    priority: 'medium',
    status: 'open',
    date: '2024-12-15',
    requester: 'Juan Pérez',
    assignedTo: 'Pedro Gómez',
  },
  {
    id: '5',
    number: 'REQ-2024-014',
    subject: 'Problema con impresora',
    description: 'La impresora del piso 3 no imprime en color',
    priority: 'low',
    status: 'in-progress',
    date: '2024-12-14',
    requester: 'Laura Silva',
    assignedTo: 'Yo',
  },
]

const filteredRequests = computed(() => {
  return areaRequests.filter((request) => {
    const matchesSearch =
      request.subject.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      request.number.toLowerCase().includes(searchTerm.value.toLowerCase())
    const matchesStatus = statusFilter.value === 'all' || request.status === statusFilter.value
    const matchesPriority = priorityFilter.value === 'all' || request.priority === priorityFilter.value
    const matchesAssigned = 
      assignedFilter.value === 'all' ||
      (assignedFilter.value === 'assigned' && request.assignedTo === 'Yo') ||
      (assignedFilter.value === 'unassigned' && !request.assignedTo)
    return matchesSearch && matchesStatus && matchesPriority && matchesAssigned
  })
})

const pendingCount = computed(() => areaRequests.filter(r => r.status === 'open').length)
const inProgressCount = computed(() => areaRequests.filter(r => r.status === 'in-progress').length)
const resolvedTodayCount = computed(() => 3) // Simulado
const highPriorityCount = computed(() => areaRequests.filter(r => r.priority === 'high').length)

const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-700 border-red-200'
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    case 'low':
      return 'bg-green-100 text-green-700 border-green-200'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'open':
      return 'bg-blue-100 text-blue-700'
    case 'in-progress':
      return 'bg-purple-100 text-purple-700'
    case 'resolved':
      return 'bg-green-100 text-green-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const getPriorityLabel = (priority: string): string => {
  const labels: Record<string, string> = {
    high: 'Alta',
    medium: 'Media',
    low: 'Baja'
  }
  return labels[priority] || priority
}

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    open: 'Abierto',
    'in-progress': 'En progreso',
    resolved: 'Resuelto'
  }
  return labels[status] || status
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
}

const isDueSoon = (dueDate: string): boolean => {
  const due = new Date(dueDate)
  const now = new Date()
  const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60)
  return diffHours < 24
}

const assignToMe = (id: string) => {
  alert(`Solicitud ${id} asignada a ti`)
}

const startWork = (id: string) => {
  alert(`Trabajo iniciado en solicitud ${id}`)
}

const resolveRequest = (id: string) => {
  alert(`Solicitud ${id} marcada como resuelta`)
}
</script>
