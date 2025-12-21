<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <button
        @click="emit('navigate', 'my-requests')"
        class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft class="w-4 h-4" />
        Volver
      </button>
      <div class="flex items-start justify-between">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <h1 class="text-2xl font-semibold text-gray-900">{{ request.number }}</h1>
            <span
              :class="[
                'px-3 py-1 text-sm font-medium rounded-full border',
                getPriorityColor(request.priority)
              ]"
            >
              {{ getPriorityLabel(request.priority) }}
            </span>
            <span
              :class="[
                'px-3 py-1 text-sm font-medium rounded-full',
                getStatusColor(request.status)
              ]"
            >
              {{ getStatusLabel(request.status) }}
            </span>
          </div>
          <h2 class="text-xl text-gray-700">{{ request.subject }}</h2>
        </div>
        <button class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
          Editar
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Description -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Descripción</h3>
          <p class="text-gray-700 whitespace-pre-line">{{ request.description }}</p>
        </div>

        <!-- Attachments -->
        <div v-if="request.attachments && request.attachments.length > 0" class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Archivos Adjuntos</h3>
          <div class="space-y-2">
            <div
              v-for="file in request.attachments"
              :key="file.name"
              class="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
            >
              <File class="w-5 h-5 text-gray-400" />
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">{{ file.name }}</p>
                <p class="text-xs text-gray-500">{{ file.size }}</p>
              </div>
              <button class="text-[#0f3a72] hover:text-[#0d3260] text-sm">Descargar</button>
            </div>
          </div>
        </div>

        <!-- Comments/Activity -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Actividad</h3>
          <div class="space-y-4">
            <div v-for="activity in request.activity" :key="activity.id" class="flex gap-4">
              <div class="w-10 h-10 rounded-full bg-[#0f3a72] flex items-center justify-center text-white font-medium flex-shrink-0">
                {{ activity.user.charAt(0) }}
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-medium text-gray-900">{{ activity.user }}</span>
                  <span class="text-sm text-gray-500">{{ formatDateTime(activity.date) }}</span>
                </div>
                <div class="bg-gray-50 rounded-lg p-3">
                  <p class="text-sm text-gray-700">{{ activity.comment }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Add Comment -->
          <div class="mt-6 pt-6 border-t">
            <textarea
              v-model="newComment"
              placeholder="Agregar un comentario..."
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72] resize-none"
            ></textarea>
            <div class="flex justify-end gap-2 mt-3">
              <button
                @click="newComment = ''"
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                @click="addComment"
                class="px-4 py-2 bg-[#0f3a72] text-white rounded-md hover:bg-[#0d3260] transition-colors"
              >
                Comentar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Details -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Detalles</h3>
          <div class="space-y-4">
            <div>
              <p class="text-sm text-gray-500 mb-1">Solicitante</p>
              <p class="text-sm font-medium text-gray-900">{{ request.requester }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-1">Área</p>
              <p class="text-sm font-medium text-gray-900">{{ request.area }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-1">Asignado a</p>
              <p class="text-sm font-medium text-gray-900">{{ request.assignedTo || 'Sin asignar' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-1">Fecha de creación</p>
              <p class="text-sm font-medium text-gray-900">{{ formatDateTime(request.createdAt) }}</p>
            </div>
            <div v-if="request.dueDate">
              <p class="text-sm text-gray-500 mb-1">Fecha límite</p>
              <p class="text-sm font-medium text-gray-900">{{ formatDateTime(request.dueDate) }}</p>
            </div>
            <div v-if="request.resolvedAt">
              <p class="text-sm text-gray-500 mb-1">Fecha de resolución</p>
              <p class="text-sm font-medium text-gray-900">{{ formatDateTime(request.resolvedAt) }}</p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Acciones</h3>
          <div class="space-y-2">
            <button
              v-if="request.status === 'open'"
              class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Tomar solicitud
            </button>
            <button
              v-if="request.status === 'in-progress'"
              class="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Marcar como resuelta
            </button>
            <button class="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
              Reasignar
            </button>
            <button class="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
              Cambiar prioridad
            </button>
            <button class="w-full px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors">
              Cerrar solicitud
            </button>
          </div>
        </div>

        <!-- Timeline -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Historial</h3>
          <div class="space-y-3">
            <div v-for="event in request.timeline" :key="event.id" class="flex gap-3 text-sm">
              <div class="w-2 h-2 rounded-full bg-[#0f3a72] mt-1.5 flex-shrink-0"></div>
              <div>
                <p class="text-gray-900">{{ event.action }}</p>
                <p class="text-gray-500 text-xs">{{ formatDateTime(event.date) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ArrowLeft, File } from 'lucide-vue-next'

interface RequestDetailProps {
  requestId?: string
}

interface RequestDetailEmits {
  (e: 'navigate', page: string): void
}

const props = defineProps<RequestDetailProps>()
const emit = defineEmits<RequestDetailEmits>()

const newComment = ref('')

// Mock data - en producción esto vendría de una API
const request = {
  id: props.requestId || '1',
  number: 'REQ-2024-001',
  subject: 'Acceso a carpeta compartida',
  description: 'Necesito acceso de lectura y escritura a la carpeta compartida del departamento de ventas para poder colaborar en los reportes mensuales.\n\nLa carpeta está ubicada en: \\\\servidor\\ventas\\reportes\n\nMi usuario de red es: juan.perez',
  priority: 'high' as const,
  status: 'in-progress' as const,
  area: 'Soporte TI',
  requester: 'Juan Pérez',
  assignedTo: 'María García',
  createdAt: '2024-12-15T10:30:00',
  dueDate: '2024-12-18T17:00:00',
  resolvedAt: null,
  attachments: [
    { name: 'solicitud_acceso.pdf', size: '245 KB' },
    { name: 'captura_error.png', size: '1.2 MB' }
  ],
  activity: [
    {
      id: 1,
      user: 'Juan Pérez',
      comment: 'Solicitud creada. Necesito acceso urgente para terminar el reporte del mes.',
      date: '2024-12-15T10:30:00'
    },
    {
      id: 2,
      user: 'María García',
      comment: 'Solicitud recibida. Estoy verificando los permisos actuales en el servidor.',
      date: '2024-12-15T11:15:00'
    },
    {
      id: 3,
      user: 'María García',
      comment: 'He agregado los permisos de lectura. Los permisos de escritura requieren aprobación del jefe de departamento.',
      date: '2024-12-15T14:20:00'
    }
  ],
  timeline: [
    { id: 1, action: 'Solicitud creada', date: '2024-12-15T10:30:00' },
    { id: 2, action: 'Asignada a María García', date: '2024-12-15T10:35:00' },
    { id: 3, action: 'Cambiada a "En progreso"', date: '2024-12-15T11:15:00' },
    { id: 4, action: 'Prioridad actualizada a Alta', date: '2024-12-15T11:16:00' }
  ]
}

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

const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleString('es-ES', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const addComment = () => {
  if (newComment.value.trim()) {
    alert(`Comentario agregado: ${newComment.value}`)
    newComment.value = ''
  }
}
</script>
