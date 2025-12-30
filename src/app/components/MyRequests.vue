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
            <option value="Nueva">Nueva</option>
            <option value="Asignado">Asignado</option>
            <option value="Resuelta">Resuelta</option>
            <option value="Cerrada">Cerrada</option>
            <option value="Cancelada">Cancelada</option>
            <option value="Rechazada">Rechazada</option>
          </select>

          <select
            v-model="priorityFilter"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
          >
            <option value="all">Todas las prioridades</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
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

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12 bg-white rounded-lg">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f3a72]"></div>
      <p class="text-gray-500 mt-3">Cargando solicitudes...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12 bg-white rounded-lg border border-red-200">
      <p class="text-red-600 mb-2">{{ error }}</p>
      <button
        @click="cargarSolicitudes"
        class="px-4 py-2 text-[#0f3a72] hover:bg-gray-50 rounded-md transition-colors"
      >
        Intentar nuevamente
      </button>
    </div>

    <!-- Requests List -->
    <div v-else class="space-y-4">
      <div
        v-for="request in filteredRequests"
        :key="request.id"
        class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <span class="text-sm font-medium text-gray-500">{{ request.numeroSolicitud }}</span>
              <span
                :class="[
                  'px-2 py-1 text-xs font-medium rounded-full border',
                  getPriorityColor(request.prioridad)
                ]"
              >
                {{ getPriorityLabel(request.prioridad) }}
              </span>
              <span
                :class="[
                  'px-2 py-1 text-xs font-medium rounded-full',
                  getStatusColor(request.estado)
                ]"
              >
                {{ getStatusLabel(request.estado) }}
              </span>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-1">{{ request.titulo }}</h3>
            <p class="text-sm text-gray-600">{{ request.areaNombre }} • {{ formatDate(request.fechaCreacion) }}</p>
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

      <div v-if="filteredRequests.length === 0 && solicitudes.length === 0" class="text-center py-12 bg-white rounded-lg">
        <p class="text-gray-500">No tienes solicitudes registradas</p>
      </div>

      <div v-else-if="filteredRequests.length === 0" class="text-center py-12 bg-white rounded-lg">
        <p class="text-gray-500">No se encontraron solicitudes con los filtros aplicados</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Search, Eye } from 'lucide-vue-next'
import solicitudesService, { type Solicitud } from '../../services/solicitudesService'
import { useAuthStore } from '../../stores/authStore'
import { ROLES } from '../../constants/roles'

interface RequestDisplay extends Solicitud {
  numeroSolicitud: string
  areaNombre: string
}

const router = useRouter()
const authStore = useAuthStore()

const searchTerm = ref('')
const statusFilter = ref('all')
const priorityFilter = ref('all')

// Estados reactivos
const solicitudes = ref<RequestDisplay[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Cargar solicitudes desde el backend según el rol
const cargarSolicitudes = async () => {
  loading.value = true
  error.value = null
  
  try {
    const userRole = authStore.userRole
    const userAreaId = authStore.user?.areaId
    
    console.log('[MyRequests] Cargando solicitudes - Rol:', userRole)
    
    let data: Solicitud[] = []
    
    // Determinar qué endpoint llamar según el rol
    if (userRole === ROLES.USUARIO) {
      data = await solicitudesService.obtenerMisSolicitudes()
    } else if (userRole === ROLES.AGENTE) {
      if (!userAreaId) {
        throw new Error('El agente no tiene un área asignada')
      }
      data = await solicitudesService.obtenerSolicitudesPorArea(userAreaId)
    } else if (userRole === ROLES.ADMIN || userRole === ROLES.SUPER_ADMIN) {
      data = await solicitudesService.obtenerTodas()
    } else {
      throw new Error(`Rol desconocido: ${userRole}`)
    }
    
    console.log('[MyRequests] ✅ Solicitudes cargadas:', data.length, '| IDs:', data.map(s => s.id).join(', '))
    
    // Normalizar datos del backend
    solicitudes.value = data.map((sol: any) => {
      // El backend envía "asunto" o "Asunto" como título
      const titulo = sol.asunto || sol.Asunto || sol.titulo || 'Sin título'
      
      // El backend envía "area" como string directamente
      const areaNombre = sol.area || sol.tipoSolicitud || 'Sin área'
      
      const normalized: RequestDisplay = {
        ...sol,
        id: sol.id || 0,
        titulo,
        descripcion: sol.descripcion || sol.Descripcion || '',
        categoria: sol.categoria || sol.tipoSolicitud || '',
        prioridad: sol.prioridad || 'media',
        estado: sol.estado || 'pendiente',
        fechaCreacion: sol.fechaCreacion || new Date().toISOString(),
        fechaActualizacion: sol.fechaActualizacion || new Date().toISOString(),
        numeroSolicitud: sol.numero || sol.numeroSolicitud || `SOL-${String(sol.id || 0).padStart(4, '0')}`,
        areaNombre: areaNombre,
        solicitante: sol.solicitante || sol.usuarioCreador || { id: 0, nombre: 'Desconocido', email: '' },
        area: sol.area || 'Sin área'
      }
      
      return normalized
    })
    
    // Solicitudes listas para mostrar
  } catch (err: any) {
    console.error('[MyRequests] Error al cargar solicitudes:', err.message)
    error.value = err.response?.data?.message || err.message || 'Error al cargar las solicitudes. Por favor, intenta nuevamente.'
  } finally {
    loading.value = false
  }
}

// Cargar datos al montar el componente
onMounted(() => {
  cargarSolicitudes()
})

// Recargar cuando el componente se activa (útil con keep-alive o navegación)
onActivated(() => {
  cargarSolicitudes()
})

const filteredRequests = computed(() => {
  return solicitudes.value.filter((request) => {
    // Búsqueda por texto (asunto y número de solicitud)
    const asunto = (request.asunto || '').toLowerCase()
    const numeroSolicitud = (request.numeroSolicitud || '').toLowerCase()
    const searchValue = (searchTerm.value || '').toLowerCase()
    
    const matchesSearch = asunto.includes(searchValue) || numeroSolicitud.includes(searchValue)
    
    // Normalizar estado: EnProceso → Asignado
    let estadoRequest = String(request.estado || '')
    if (estadoRequest === 'EnProceso') {
      estadoRequest = 'Asignado'
    }
    
    // Filtro por estado (comparar strings)
    const matchesStatus = statusFilter.value === 'all' || estadoRequest === statusFilter.value
    
    // Filtro por prioridad (comparar strings)
    const prioridadRequest = String(request.prioridad || '')
    const matchesPriority = priorityFilter.value === 'all' || prioridadRequest === priorityFilter.value
    
    return matchesSearch && matchesStatus && matchesPriority
  })
})

const getPriorityColor = (priority: string): string => {
  const colores: Record<string, string> = {
    'Alta': 'border-red-500 text-red-700 bg-red-50',
    'Media': 'border-yellow-500 text-yellow-700 bg-yellow-50',
    'Baja': 'border-green-500 text-green-700 bg-green-50'
  }
  return colores[priority] || 'border-gray-500 text-gray-700 bg-gray-50'
}

const getStatusColor = (status: string): string => {
  // Normalizar EnProceso a Asignado
  const estadoNormalizado = status === 'EnProceso' ? 'Asignado' : status
  
  const colores: Record<string, string> = {
    'Nueva': 'bg-blue-100 text-blue-800',
    'Asignado': 'bg-purple-100 text-purple-800',
    'EnProceso': 'bg-purple-100 text-purple-800', // Por si acaso
    'Resuelta': 'bg-green-100 text-green-800',
    'Cerrada': 'bg-gray-100 text-gray-800',
    'Cancelada': 'bg-red-100 text-red-800',
    'Rechazada': 'bg-orange-100 text-orange-800'
  }
  return colores[estadoNormalizado] || 'bg-gray-100 text-gray-700'
}

const getPriorityLabel = (priority: string): string => {
  return priority || 'Sin prioridad'
}

const getStatusLabel = (status: string): string => {
  // Normalizar EnProceso a Asignado para display
  if (status === 'EnProceso') {
    return 'Asignado'
  }
  return status || 'Sin estado'
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return 'Fecha no disponible'
  
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return 'Fecha inválida'
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch (error) {
    console.error('Error al formatear fecha:', dateStr, error)
    return 'Fecha inválida'
  }
}
</script>
