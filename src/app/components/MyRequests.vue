<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">Mis Solicitudes</h1>
      <p class="text-gray-600 mt-1">Gestiona y consulta el estado de tus solicitudes</p>
    </div>

    <!-- Actions Bar -->
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
            <option value="closed">Cerrado</option>
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

          <button
            @click="router.push('/dashboard/new-request')"
            class="inline-flex items-center gap-2 px-4 py-2 bg-[#0f3a72] text-white rounded-md hover:bg-[#0d3260] transition-colors"
          >
            <Plus class="w-5 h-5" />
            Nueva Solicitud
          </button>
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
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-1">{{ request.subject }}</h3>
            <p class="text-sm text-gray-600">{{ request.area }} • {{ formatDate(request.date) }}</p>
          </div>
          <button
            @click="router.push(`/dashboard/request-detail/${request.id}`)"
            class="inline-flex items-center gap-2 px-4 py-2 text-[#0f3a72] hover:bg-gray-50 rounded-md transition-colors"
          >
            <Eye class="w-4 h-4" />
            Ver Detalles
          </button>
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
import { Plus, Search, Eye } from 'lucide-vue-next'

interface Request {
  id: string
  number: string
  subject: string
  area: string
  priority: 'high' | 'medium' | 'low'
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  date: string
}

const router = useRouter()

const searchTerm = ref('')
const statusFilter = ref('all')
const priorityFilter = ref('all')

const mockRequests: Request[] = [
  {
    id: '1',
    number: 'REQ-2024-001',
    subject: 'Acceso a carpeta compartida',
    area: 'Soporte TI',
    priority: 'high',
    status: 'in-progress',
    date: '2024-12-15',
  },
  {
    id: '2',
    number: 'REQ-2024-002',
    subject: 'Solicitud de nueva laptop',
    area: 'Soporte TI',
    priority: 'medium',
    status: 'open',
    date: '2024-12-14',
  },
  {
    id: '3',
    number: 'REQ-2024-003',
    subject: 'Suministros de oficina',
    area: 'Administración',
    priority: 'low',
    status: 'resolved',
    date: '2024-12-10',
  },
]

const filteredRequests = computed(() => {
  return mockRequests.filter((request) => {
    const matchesSearch =
      request.subject.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      request.number.toLowerCase().includes(searchTerm.value.toLowerCase())
    const matchesStatus = statusFilter.value === 'all' || request.status === statusFilter.value
    const matchesPriority = priorityFilter.value === 'all' || request.priority === priorityFilter.value
    return matchesSearch && matchesStatus && matchesPriority
  })
})

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
    case 'closed':
      return 'bg-gray-100 text-gray-700'
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
    resolved: 'Resuelto',
    closed: 'Cerrado'
  }
  return labels[status] || status
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
}
</script>
