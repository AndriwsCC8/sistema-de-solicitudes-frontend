<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">Bandeja de Área</h1>
      <p class="text-gray-600 mt-1">Gestiona las solicitudes asignadas a tu área</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f3a72]"></div>
      <p class="text-gray-500 mt-3">Cargando solicitudes...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <p class="text-red-800">{{ error }}</p>
      <button
        @click="cargarSolicitudes"
        class="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
      >
        Reintentar
      </button>
    </div>

    <!-- Feedback Message -->
    <div
      v-if="feedback"
      :class="[
        'rounded-lg p-4 mb-6',
        feedback.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
      ]"
    >
      <p :class="feedback.type === 'success' ? 'text-green-800' : 'text-red-800'">
        {{ feedback.message }}
      </p>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <p class="text-sm text-gray-600 mb-1">Nuevas</p>
          <p class="text-3xl font-bold text-blue-600">{{ nuevasCount }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6">
          <p class="text-sm text-gray-600 mb-1">Asignadas</p>
          <p class="text-3xl font-bold text-purple-600">{{ asignadasCount }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6">
          <p class="text-sm text-gray-600 mb-1">Resueltas</p>
          <p class="text-3xl font-bold text-green-600">{{ resueltasCount }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6">
          <p class="text-sm text-gray-600 mb-1">Alta Prioridad</p>
          <p class="text-3xl font-bold text-red-600">{{ altaPrioridadCount }}</p>
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
              placeholder="Buscar por código o asunto..."
              class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
            />
          </div>

          <!-- Filters -->
          <div class="flex gap-3">
            <select
              v-model="estadoFilter"
              class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
            >
              <option value="">Todos los estados</option>
              <option value="Nueva">Nueva</option>
              <option value="EnProceso">Asignada / En Proceso</option>
              <option value="Resuelta">Resuelta</option>
              <option value="Cerrada">Cerrada</option>
              <option value="Rechazada">Rechazada</option>
              <option value="Cancelada">Cancelada</option>
            </select>

            <select
              v-model="prioridadFilter"
              class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
            >
              <option value="">Todas las prioridades</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Requests List -->
      <div v-if="filteredSolicitudes.length === 0" class="bg-white rounded-lg shadow-sm p-12 text-center">
        <p class="text-gray-500">No hay solicitudes que coincidan con los filtros</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="solicitud in filteredSolicitudes"
          :key="solicitud.id"
          class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
          @click="$router.push(`/dashboard/request-detail/${solicitud.id}`)"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <span class="text-sm font-medium text-gray-500">{{ solicitud.numero }}</span>
                <span
                  :class="['px-2 py-1 text-xs font-medium rounded-full border', getPrioridadColor(solicitud.prioridad)]"
                >
                  {{ solicitud.prioridad }}
                </span>
                <span
                  :class="['px-2 py-1 text-xs font-medium rounded-full', getEstadoColor(solicitud.estado)]"
                >
                  {{ solicitud.estado }}
                </span>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ solicitud.asunto }}</h3>
              <div class="flex items-center gap-4 text-sm text-gray-600">
                <span>Solicitante: {{ solicitud.solicitante }}</span>
                <span>•</span>
                <span>Fecha: {{ formatDate(solicitud.fechaCreacion) }}</span>
                <span v-if="solicitud.gestorAsignado">•</span>
                <span v-if="solicitud.gestorAsignado">Asignado a: {{ solicitud.gestorAsignado }}</span>
              </div>
            </div>
            <div class="flex gap-2 ml-4">
              <!-- Botón Asignarme: Gestor, si NO está asignada -->
              <button
                v-if="puedeAsignarseSolicitud(solicitud)"
                @click.stop="asignarmeaSolicitud(solicitud.id)"
                :disabled="procesandoSolicitud === solicitud.id"
                class="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-[#0f3a72] rounded-md hover:bg-[#0a2a52] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg v-if="procesandoSolicitud === solicitud.id" class="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Asignarme</span>
              </button>
              
              <!-- Botón Asignar/Reasignar a Gestor: Admin, si NO está resuelta ni rechazada -->
              <button
                v-if="puedeAsignarAGestor(solicitud)"
                @click.stop="abrirModalAsignacion(solicitud)"
                class="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-[#0f3a72] rounded-md hover:bg-[#0a2a52] transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>{{ esReasignacion(solicitud) ? 'Reasignar' : 'Asignar' }}</span>
              </button>
              
              <!-- Botón Resolver: quien tiene la solicitud asignada -->
              <button
                v-if="puedeResolverSolicitud(solicitud)"
                @click.stop="resolverSolicitud(solicitud.id)"
                :disabled="procesandoSolicitud === solicitud.id"
                class="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg v-if="procesandoSolicitud === solicitud.id" class="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Resolver</span>
              </button>
              
              <!-- Botón Ver Detalles: siempre visible -->
              <button
                @click.stop="verDetalle(solicitud.id)"
                class="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-[#0f3a72] border border-[#0f3a72] rounded-md hover:bg-[#0f3a72] hover:text-white transition-colors"
              >
                <Eye class="w-4 h-4" />
                Ver Detalles
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Asignación -->
    <div
      v-if="mostrarModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="cerrarModal"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">{{ esReasignacion(solicitudSeleccionada) ? 'Reasignar Solicitud' : 'Asignar Solicitud' }}</h3>
          <button @click="cerrarModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto px-6 py-4">
          <!-- Loading -->
          <div v-if="cargandoGestores" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f3a72]"></div>
            <p class="text-gray-500 mt-3 text-sm">Cargando gestores...</p>
          </div>

          <!-- Error -->
          <div v-else-if="errorGestores" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-red-800 text-sm">{{ errorGestores }}</p>
          </div>

          <!-- Lista de Gestores -->
          <div v-else-if="gestoresDisponibles.length > 0" class="space-y-2">
            <p class="text-sm text-gray-600 mb-3">Selecciona un gestor para {{ esReasignacion(solicitudSeleccionada) ? 'reasignar' : 'asignar' }} esta solicitud:</p>
            <button
              v-for="gestor in gestoresDisponibles"
              :key="gestor.id"
              @click="asignarAGestor(gestor.id)"
              :disabled="asignando"
              class="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-[#0f3a72] hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div class="flex items-center gap-3">
                <div class="flex-shrink-0 w-10 h-10 rounded-full bg-[#0f3a72] flex items-center justify-center text-white font-semibold">
                  {{ getInitials(gestor.nombre) }}
                </div>
                <div class="flex-1">
                  <p class="font-medium text-gray-900">{{ gestor.nombre }}</p>
                  <p class="text-sm text-gray-600">{{ gestor.email }}</p>
                  <p v-if="gestor.departamento" class="text-xs text-gray-500 mt-0.5">{{ gestor.departamento }}</p>
                </div>
              </div>
            </button>
          </div>

          <!-- Sin Gestores -->
          <div v-else class="text-center py-8">
            <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p class="text-gray-500 text-sm">No hay gestores disponibles en esta área</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-gray-200">
          <button
            @click="cerrarModal"
            :disabled="asignando"
            class="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Eye } from 'lucide-vue-next'
import solicitudesService from '../../services/solicitudesService'
import catalogosService, { type Gestor } from '../../services/catalogosService'
import { useAuthStore } from '../../stores/authStore'
import { ROLES } from '../../constants/roles'
import api from '../../services/api'

const router = useRouter()
const authStore = useAuthStore()

// Estados
const loading = ref(true)
const error = ref<string | null>(null)
const solicitudes = ref<any[]>([])
const procesandoSolicitud = ref<number | null>(null)
const feedback = ref<{ type: 'success' | 'error', message: string } | null>(null)

// Estados para modal de asignación
const mostrarModal = ref(false)
const solicitudSeleccionada = ref<any>(null)
const gestoresDisponibles = ref<Gestor[]>([])
const cargandoGestores = ref(false)
const errorGestores = ref<string | null>(null)
const asignando = ref(false)

// Filtros
const searchTerm = ref('')
const estadoFilter = ref('')
const prioridadFilter = ref('')

// Cargar solicitudes
const cargarSolicitudes = async () => {
  loading.value = true
  error.value = null
  
  try {
    console.log('[AreaInbox] Cargando solicitudes del área...')
    const data = await solicitudesService.obtenerSolicitudesArea()
    solicitudes.value = data
    console.log('[AreaInbox] ✅ Solicitudes cargadas:', data.length)
    
    // Log de la primera solicitud para verificar estructura
    if (data.length > 0) {
      console.log('[AreaInbox] 📋 Ejemplo de solicitud:', data[0])
      console.log('[AreaInbox] 🔑 Campos clave:', {
        id: data[0].id,
        areaId: data[0].areaId,
        gestorAsignadoId: data[0].gestorAsignadoId,
        estado: data[0].estado
      })
    }
  } catch (err: any) {
    console.error('[AreaInbox] Error al cargar solicitudes:', err)
    error.value = err.response?.data?.message || err.message || 'Error al cargar las solicitudes'
  } finally {
    loading.value = false
  }
}

// Solicitudes filtradas
const filteredSolicitudes = computed(() => {
  return solicitudes.value.filter((solicitud) => {
    const matchesSearch =
      solicitud.asunto?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      solicitud.numero?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      solicitud.solicitante?.toLowerCase().includes(searchTerm.value.toLowerCase())
    
    const matchesEstado = !estadoFilter.value || solicitud.estado === estadoFilter.value
    const matchesPrioridad = !prioridadFilter.value || solicitud.prioridad === prioridadFilter.value
    
    return matchesSearch && matchesEstado && matchesPrioridad
  })
})

// Contadores
const nuevasCount = computed(() => solicitudes.value.filter(s => s.estado === 'Nueva').length)
const asignadasCount = computed(() => solicitudes.value.filter(s => s.estado === 'Asignado' || s.estado === 'EnProceso').length)
const resueltasCount = computed(() => solicitudes.value.filter(s => s.estado === 'Resuelta').length)
const altaPrioridadCount = computed(() => solicitudes.value.filter(s => s.prioridad === 'Alta').length)

// Helpers
const getPrioridadColor = (prioridad: string): string => {
  const colores: Record<string, string> = {
    'Alta': 'border-red-500 text-red-700 bg-red-50',
    'Media': 'border-yellow-500 text-yellow-700 bg-yellow-50',
    'Baja': 'border-green-500 text-green-700 bg-green-50'
  }
  return colores[prioridad] || 'border-gray-500 text-gray-700 bg-gray-50'
}

const getEstadoColor = (estado: string): string => {
  const colores: Record<string, string> = {
    'Nueva': 'bg-blue-100 text-blue-800',
    'Asignado': 'bg-purple-100 text-purple-800',
    'EnProceso': 'bg-purple-100 text-purple-800',
    'Resuelta': 'bg-green-100 text-green-800',
    'Cerrada': 'bg-gray-200 text-gray-800',
    'Cancelada': 'bg-red-100 text-red-800',
    'Rechazada': 'bg-orange-100 text-orange-800'
  }
  return colores[estado] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
}

const verDetalle = (id: number) => {
  router.push(`/dashboard/request-detail/${id}`)
}

// Helper para obtener iniciales
const getInitials = (nombre: string): string => {
  if (!nombre) return '?'
  const words = nombre.trim().split(' ')
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

// PERMISOS Y VALIDACIONES

// Gestor puede asignarse una solicitud si NO está asignada
const puedeAsignarseSolicitud = (solicitud: any): boolean => {
  const esGestor = authStore.userRole === ROLES.AGENTE
  const noAsignada = !solicitud.gestorAsignadoId && solicitud.estado === 'Nueva'
  return esGestor && noAsignada
}

// Admin puede asignar/reasignar a cualquier gestor si NO está resuelta ni rechazada
const puedeAsignarAGestor = (solicitud: any): boolean => {
  const esAdmin = authStore.userRole === ROLES.ADMIN || authStore.userRole === ROLES.SUPER_ADMIN
  const estadosNoPermitidos = ['Resuelta', 'Rechazada']
  const estadoPermitido = !estadosNoPermitidos.includes(solicitud.estado)
  return esAdmin && estadoPermitido
}

// Verificar si es una reasignación (ya tiene gestor asignado)
const esReasignacion = (solicitud: any): boolean => {
  return !!solicitud.gestorAsignadoId
}

// Puede resolver si está asignada a él y el estado es Asignado
const puedeResolverSolicitud = (solicitud: any): boolean => {
  const usuarioId = authStore.user?.id
  const estaAsignadoAMi = solicitud.gestorAsignadoId === usuarioId
  const estadoPermitido = solicitud.estado === 'Asignado' || solicitud.estado === 'EnProceso'
  return estaAsignadoAMi && estadoPermitido
}

// ACCIONES

// Gestor se asigna la solicitud a sí mismo
const asignarmeaSolicitud = async (id: number) => {
  procesandoSolicitud.value = id
  feedback.value = null
  
  try {
    console.log('[AreaInbox] Asignándome solicitud:', id)
    await solicitudesService.tomarSolicitud(id)
    
    feedback.value = {
      type: 'success',
      message: '✓ Te has asignado la solicitud exitosamente'
    }
    
    await cargarSolicitudes()
    
    setTimeout(() => {
      feedback.value = null
    }, 3000)
  } catch (err: any) {
    console.error('[AreaInbox] Error al asignarme solicitud:', err)
    feedback.value = {
      type: 'error',
      message: err.response?.data?.message || err.message || 'Error al asignarte la solicitud'
    }
    
    setTimeout(() => {
      feedback.value = null
    }, 5000)
  } finally {
    procesandoSolicitud.value = null
  }
}

// Admin abre modal para asignar a un gestor
const abrirModalAsignacion = async (solicitud: any) => {
  solicitudSeleccionada.value = solicitud
  mostrarModal.value = true
  cargandoGestores.value = true
  errorGestores.value = null
  gestoresDisponibles.value = []

  try {
    // El backend retorna areaId directamente en la solicitud
    const areaId = solicitud.areaId || solicitud.tipoSolicitudAreaId
    
    // Para solicitudes tipo "Otro" (sin área)
    if (!areaId) {
      console.log('[AreaInbox] Solicitud sin área (tipo Otro), gestorAsignadoId:', solicitud.gestorAsignadoId)
      console.log('[AreaInbox] Usuario actual ID:', authStore.user?.id)
      
      // Si ya está asignada al agente actual, permitir que continúe (para ver detalles)
      if (solicitud.gestorAsignadoId === authStore.user?.id) {
        console.log('[AreaInbox] Solicitud ya asignada al agente actual, permitir acceso')
        mostrarModal.value = false
        return
      }
      
      // Si NO está asignada a nadie, bloquear (debe asignarse desde Administración)
      if (!solicitud.gestorAsignadoId) {
        errorGestores.value = 'Las solicitudes tipo "Otro" deben ser asignadas inicialmente desde Administración → Sin Asignar'
        cargandoGestores.value = false
        return
      }
      
      // Si está asignada a otro agente, bloquear (las reasignaciones de tipo Otro solo desde Administración)
      errorGestores.value = 'Las solicitudes tipo "Otro" solo pueden ser reasignadas desde Administración'
      cargandoGestores.value = false
      return
    }
    
    console.log('[AreaInbox] Cargando gestores del área:', areaId)
    console.log('[AreaInbox] Solicitud completa:', solicitud)
    const gestores = await catalogosService.obtenerGestoresPorArea(areaId)
    gestoresDisponibles.value = gestores
    console.log('[AreaInbox] Gestores cargados:', gestores.length)
  } catch (err: any) {
    console.error('[AreaInbox] Error al cargar gestores:', err)
    errorGestores.value = err.response?.data?.message || err.message || 'Error al cargar gestores'
  } finally {
    cargandoGestores.value = false
  }
}

const cerrarModal = () => {
  if (asignando.value) return
  mostrarModal.value = false
  solicitudSeleccionada.value = null
  gestoresDisponibles.value = []
  errorGestores.value = null
}

const asignarAGestor = async (gestorId: number) => {
  if (!solicitudSeleccionada.value) return

  asignando.value = true
  
  try {
    console.log('[AreaInbox] Asignando solicitud a gestor:', gestorId)
    await solicitudesService.asignarSolicitud(solicitudSeleccionada.value.id, gestorId)
    
    const esReasig = esReasignacion(solicitudSeleccionada.value)
    feedback.value = {
      type: 'success',
      message: esReasig ? '✓ Solicitud reasignada exitosamente' : '✓ Solicitud asignada exitosamente'
    }
    
    mostrarModal.value = false
    await cargarSolicitudes()
    
    setTimeout(() => {
      feedback.value = null
    }, 3000)
  } catch (err: any) {
    console.error('[AreaInbox] Error al asignar solicitud:', err)
    feedback.value = {
      type: 'error',
      message: err.response?.data?.message || err.message || 'Error al asignar la solicitud'
    }
    
    setTimeout(() => {
      feedback.value = null
    }, 5000)
  } finally {
    asignando.value = false
    solicitudSeleccionada.value = null
  }
}

// Resolver solicitud (cambiar estado a Resuelta)
const resolverSolicitud = async (id: number) => {
  procesandoSolicitud.value = id
  feedback.value = null
  
  try {
    console.log('[AreaInbox] Resolviendo solicitud:', id)
    
    // Cambiar estado a Resuelta (3)
    await api.put('/solicitudes/cambiar-estado', {
      solicitudId: id,
      nuevoEstado: 3 // 3 = Resuelta
    })
    
    feedback.value = {
      type: 'success',
      message: '✓ Solicitud marcada como resuelta'
    }
    
    await cargarSolicitudes()
    
    setTimeout(() => {
      feedback.value = null
    }, 3000)
  } catch (err: any) {
    console.error('[AreaInbox] Error al resolver solicitud:', err)
    feedback.value = {
      type: 'error',
      message: err.response?.data?.message || err.message || 'Error al resolver la solicitud'
    }
    
    setTimeout(() => {
      feedback.value = null
    }, 5000)
  } finally {
    procesandoSolicitud.value = null
  }
}

// Cargar al montar
onMounted(() => {
  cargarSolicitudes()
})
</script>
