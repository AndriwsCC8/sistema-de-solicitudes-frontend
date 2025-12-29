<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f3a72]"></div>
      <p class="text-gray-500 mt-3">Cargando solicitud...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-600 mb-4">{{ error }}</p>
      <button
        @click="cargarSolicitud"
        class="px-4 py-2 text-[#0f3a72] hover:bg-gray-50 rounded-md transition-colors"
      >
        Intentar nuevamente
      </button>
      <button
        @click="router.push('/dashboard')"
        class="ml-3 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
      >
        Volver
      </button>
    </div>

    <!-- Content -->
    <div v-else-if="solicitud">
      <!-- Header -->
      <div class="mb-6">
        <button
          @click="router.push('/dashboard')"
          class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft class="w-4 h-4" />
          Volver
        </button>
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <h1 class="text-2xl font-semibold text-gray-900">{{ numeroSolicitud }}</h1>
              <span :class="['px-3 py-1 text-sm font-medium rounded-full border', getPrioridadColor(prioridadTexto)]">
                {{ prioridadTexto }}
              </span>
              <span :class="['px-3 py-1 text-sm font-medium rounded-full', getEstadoColor(estadoTexto)]">
                {{ estadoTexto }}
              </span>
            </div>
            <h2 class="text-xl text-gray-700">{{ solicitud.asunto }}</h2>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Description -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Descripción</h3>
            <p v-if="solicitud.descripcion" class="text-gray-700 whitespace-pre-line">{{ solicitud.descripcion }}</p>
            <p v-else class="text-gray-400 italic">Sin descripción</p>
          </div>

          <!-- Comments/Activity -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Comentarios y Cronología</h3>
            
            <!-- Comentarios existentes -->
            <div v-if="solicitud.comentarios && solicitud.comentarios.length > 0" class="space-y-4 mb-6">
              <div 
                v-for="comentario in solicitud.comentarios" 
                :key="comentario.id"
                class="border-l-4 border-blue-500 pl-4 py-2"
              >
                <div class="flex items-start gap-3">
                  <div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                    {{ getInitials(getNombreUsuarioComentario(comentario)) }}
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="font-semibold text-gray-900">{{ getNombreUsuarioComentario(comentario) }}</span>
                      <span class="text-sm text-gray-500">{{ formatDateTime(comentario.fechaCreacion) }}</span>
                    </div>
                    <p class="text-gray-700 whitespace-pre-line">{{ comentario.contenido }}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Sin comentarios -->
            <div v-else class="text-center py-8 text-gray-500">
              <p>No hay comentarios aún</p>
              <p class="text-sm mt-1">Sé el primero en comentar esta solicitud</p>
            </div>
            
            <!-- Agregar comentario -->
            <div class="mt-6 border-t pt-6">
              <textarea
                v-model="nuevoComentario"
                placeholder="Escribe tu comentario aquí..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72] focus:border-transparent resize-none"
                rows="3"
              ></textarea>
              <button
                @click="agregarComentario"
                :disabled="!nuevoComentario.trim()"
                class="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-[#0f3a72] text-white rounded-md hover:bg-[#0a2850] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Agregar Comentario
              </button>
            </div>
          </div>
          
          <!-- Archivos Adjuntos -->
          <div v-if="solicitud.archivosAdjuntos && solicitud.archivosAdjuntos.length > 0" class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Archivos Adjuntos</h3>
            <div class="space-y-2">
              <div 
                v-for="archivo in solicitud.archivosAdjuntos" 
                :key="archivo.id"
                class="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
              >
                <div class="flex items-center gap-3">
                  <FileText class="w-5 h-5 text-gray-400" />
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ archivo.nombreArchivo }}</p>
                    <p class="text-xs text-gray-500">{{ formatFileSize(archivo.tamanoBytes) }}</p>
                  </div>
                </div>
                <button
                  @click="descargarArchivo(archivo.id)"
                  class="text-[#0f3a72] hover:text-[#0a2850]"
                >
                  <Download class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Solicitante -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Solicitante</h3>
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-12 h-12 rounded-full bg-[#0f3a72] flex items-center justify-center text-white font-bold text-lg">
                {{ getInitials(solicitanteNombre) }}
              </div>
              <div class="flex-1">
                <p class="font-semibold text-gray-900 text-base">{{ solicitanteNombre }}</p>
                <p class="text-sm text-gray-600">{{ solicitanteEmail }}</p>
              </div>
            </div>
          </div>

          <!-- Información General -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Información General</h3>
            <div class="space-y-3">
              <div>
                <p class="text-xs text-gray-500 mb-1">Número de Solicitud</p>
                <p class="text-sm font-medium text-gray-900">{{ numeroSolicitud }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Área</p>
                <p class="text-sm font-medium text-gray-900">{{ areaNombre }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Tipo de Solicitud</p>
                <p class="text-sm font-medium text-gray-900">{{ tipoSolicitudNombre }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Prioridad</p>
                <span :class="['inline-block px-2 py-1 text-xs font-medium rounded border', getPrioridadColor(prioridadTexto)]">
                  {{ prioridadTexto }}
                </span>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Estado</p>
                <span :class="['inline-block px-2 py-1 text-xs font-medium rounded', getEstadoColor(estadoTexto)]">
                  {{ estadoTexto }}
                </span>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Fecha de creación</p>
                <p class="text-sm font-medium text-gray-900">{{ formatDateTime(solicitud.fechaCreacion) }}</p>
              </div>
              <div v-if="solicitud.fechaActualizacion && solicitud.fechaActualizacion !== solicitud.fechaCreacion">
                <p class="text-xs text-gray-500 mb-1">Última actualización</p>
                <p class="text-sm font-medium text-gray-900">{{ formatDateTime(solicitud.fechaActualizacion) }}</p>
              </div>
            </div>
          </div>
          
          <!-- Agente Asignado (si existe) -->
          <div v-if="gestorNombre" class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Agente Asignado</h3>
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                {{ getInitials(gestorNombre) }}
              </div>
              <div class="flex-1">
                <p class="font-semibold text-gray-900">{{ gestorNombre }}</p>
                <p class="text-sm text-gray-600">{{ gestorEmail }}</p>
              </div>
            </div>
          </div>
          
          <!-- Detalles (Solo para referencia) - DEPRECATED, datos ahora en Información General -->
          <!--
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Detalles</h3>
            ... contenido antiguo ...
          </div>
          -->

          <!-- Actualizar Estado (Admin y SuperAdmin) -->
          <div v-if="canManage" class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Actualizar Estado</h3>
            <div class="space-y-3">
              <select 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72] focus:border-transparent"
                :value="estadoTexto"
                @change="actualizarEstado($event)"
              >
                <option value="Nueva">Nueva</option>
                <option value="Asignado">Asignado</option>
                <option value="Resuelta">Resuelta</option>
                <option value="Cerrada">Cerrada</option>
                <option value="Cancelada">Cancelada</option>
                <option value="Rechazada">Rechazada</option>
              </select>
              <button
                class="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#0f3a72] text-white rounded-md hover:bg-[#0a2850] transition-colors"
                @click="guardarCambios"
              >
                <Save class="w-4 h-4" />
                Guardar Cambios
              </button>
            </div>
          </div>

          <!-- Acciones Rápidas (Admin y SuperAdmin) -->
          <div v-if="canManage" class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
            <div class="space-y-2">
              <button
                class="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                @click="exportarPDF"
                :disabled="downloadingPDF"
              >
                <div v-if="downloadingPDF" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
                <FileText v-else class="w-4 h-4" />
                {{ downloadingPDF ? 'Descargando...' : 'Descargar PDF' }}
              </button>
              <button
                class="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                @click="exportarPNG"
                :disabled="downloadingPNG"
              >
                <div v-if="downloadingPNG" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
                <Download v-else class="w-4 h-4" />
                {{ downloadingPNG ? 'Descargando...' : 'Descargar PNG' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Download, FileText, Save } from 'lucide-vue-next'
import solicitudesService from '../../services/solicitudesService'
import { useAuthStore } from '../../stores/authStore'
import { ROLES, hasMinRole } from '../../constants/roles'
import api from '../../services/api'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Control de roles
const userRole = computed(() => authStore.user?.rol || 0)
// Admin (2), SuperAdmin (3) y Agente (4) pueden gestionar solicitudes
const canManage = computed(() => hasMinRole(userRole.value, ROLES.ADMIN) || userRole.value === ROLES.AGENTE)

// Interface para la solicitud (debe coincidir con el DTO del backend)
interface SolicitudDisplay {
  id: number
  numeroSolicitud?: string
  asunto: string
  descripcion: string
  prioridad: number  // 1=Baja, 2=Media, 3=Alta
  estado: number  // 1=Nueva, 2=Asignado, 3=Resuelto, 4=Cerrado, 5=Cancelado
  fechaCreacion: string
  fechaActualizacion?: string
  usuarioCreadorId: number
  usuarioCreador?: {
    id: number
    nombre: string
    email: string
  }
  tipoSolicitudId: number
  tipoSolicitud?: {
    id: number
    nombre: string
    areaId: number
    area?: {
      id: number
      nombre: string
    }
  }
  agenteAsignadoId?: number
  agenteAsignado?: {
    id: number
    nombre: string
    email: string
    area?: string
  }
  archivosAdjuntos?: Array<{
    id: number
    nombreArchivo: string
    rutaArchivo: string
    tamanoBytes: number
    fechaSubida: string
  }>
  comentarios?: Array<{
    id: number
    contenido: string
    fechaCreacion: string
    usuarioId: number
    usuario: {
      id: number
      nombre: string
      email: string
    }
  }>
}

// Estados reactivos
const solicitud = ref<SolicitudDisplay | null>(null)
const loading = ref<boolean>(false)
const error = ref<string | null>(null)
const downloadingPDF = ref<boolean>(false)
const downloadingPNG = ref<boolean>(false)
const nuevoComentario = ref<string>('')

// Computed properties para acceder a los datos planos del backend
const solicitudData = computed(() => solicitud.value as any)
const numeroSolicitud = computed(() => solicitudData.value?.numero || `#${solicitud.value?.id || ''}`)
const solicitanteNombre = computed(() => solicitudData.value?.solicitante || '-')
const solicitanteEmail = computed(() => solicitudData.value?.solicitanteEmail || '-')
const areaNombre = computed(() => solicitudData.value?.area || '-')
const tipoSolicitudNombre = computed(() => solicitudData.value?.tipoSolicitud || '-')
const prioridadTexto = computed(() => solicitudData.value?.prioridad || '-')
const estadoTexto = computed(() => normalizarEstado(solicitudData.value?.estado || '-'))
const gestorNombre = computed(() => solicitudData.value?.gestorAsignado)
const gestorEmail = computed(() => solicitudData.value?.gestorAsignadoEmail || '-')

// Helper para obtener nombre de usuario de comentario
const getNombreUsuarioComentario = (comentario: any): string => {
  return comentario?.nombreUsuario || comentario?.usuario?.nombre || 'Usuario'
}

// Cargar solicitud desde el backend
const cargarSolicitud = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Obtener el ID de la ruta
    const id = route.params.id as string
    
    if (!id) {
      throw new Error('ID de solicitud no proporcionado')
    }
    
    console.log('[RequestDetail] Cargando solicitud ID:', id)
    
    // Consumir el endpoint GET /api/solicitudes/{id}
    const data = await solicitudesService.obtenerPorId(Number(id))
    
    // 🔍 LOGS DE DEPURACIÓN
    console.log('🔍 [DEBUG] Respuesta completa del backend:', JSON.stringify(data, null, 2))
    console.log('🔍 [DEBUG] usuarioCreador:', data.usuarioCreador)
    console.log('🔍 [DEBUG] tipoSolicitud:', data.tipoSolicitud)
    console.log('🔍 [DEBUG] agenteAsignado:', data.agenteAsignado)
    
    // Usar datos reales del backend sin fallbacks falsos
    solicitud.value = data as SolicitudDisplay
    
    console.log('[RequestDetail] Solicitud cargada:', solicitud.value)
  } catch (err: any) {
    console.error('[RequestDetail] Error al cargar solicitud:', err.message)
    
    if (err.response?.status === 404) {
      error.value = 'Solicitud no encontrada'
    } else if (err.response?.status === 403) {
      error.value = 'No tienes permiso para ver esta solicitud'
    } else {
      error.value = err.response?.data?.message || err.message || 'Error al cargar la solicitud'
    }
  } finally {
    loading.value = false
  }
}

// Acciones para SuperAdmin
const estadoTemp = ref<string | undefined>(undefined)

const actualizarEstado = (event: Event) => {
  const target = event.target as HTMLSelectElement
  estadoTemp.value = target.value
  console.log('[RequestDetail] Estado temporal actualizado:', estadoTemp.value)
}

// Mapeo de estados de texto a números para el backend
const estadoANumero = (estadoTexto: string): number => {
  const mapeo: Record<string, number> = {
    'Nueva': 1,
    'Asignado': 2,
    'Resuelta': 3,
    'Cerrada': 4,
    'Rechazada': 5,  // Backend usa 5 para Rechazada
    'Cancelada': 6,  // Asumiendo que backend usa 6 para Cancelada
    'Cancelado': 6
  }
  console.log(`[RequestDetail] 🔄 Mapeando estado "${estadoTexto}" a número:`, mapeo[estadoTexto] || 1)
  return mapeo[estadoTexto] || 1
}

// Normalizar el estado para mostrar consistentemente
const normalizarEstado = (estado: string): string => {
  if (estado === '5' || estado === 'Rechazado') return 'Rechazada'
  if (estado === '6' || estado === 'Cancelado') return 'Cancelada'
  if (estado === 'Resuelta' || estado === 'Resuelto') return 'Resuelta'
  return estado
}

const guardarCambios = async () => {
  if (!solicitud.value || estadoTemp.value === undefined) {
    console.log('[RequestDetail] No hay cambios para guardar')
    return
  }

  if (estadoTemp.value === estadoTexto.value) {
    console.log('[RequestDetail] El estado no ha cambiado')
    estadoTemp.value = undefined
    return
  }

  try {
    const nuevoEstadoNumero = estadoANumero(estadoTemp.value)
    const payload = {
      solicitudId: solicitud.value.id,
      nuevoEstado: nuevoEstadoNumero
    }
    
    console.log('[RequestDetail] 🚀 Enviando cambio de estado:', payload)
    console.log('[RequestDetail] 📊 Solicitud actual:', solicitud.value.id)
    console.log('[RequestDetail] 📊 Estado actual (texto):', estadoTexto.value)
    console.log('[RequestDetail] 📊 Nuevo estado (texto):', estadoTemp.value)
    console.log('[RequestDetail] 📊 Nuevo estado (número):', nuevoEstadoNumero)
    
    // Llamar al endpoint del backend
    const response = await api.put('/solicitudes/cambiar-estado', payload)
    
    console.log('[RequestDetail] ✅ Respuesta del backend:', response.data)
    console.log('[RequestDetail] 📊 Estado devuelto por backend:', response.data?.estado)
    
    console.log('[RequestDetail] ✅ Respuesta del backend:', response.data)
    
    // Actualizar localmente después de éxito
    const data = solicitud.value as any
    data.estado = estadoTemp.value
    estadoTemp.value = undefined
    
    console.log('[RequestDetail] ✅ Estado actualizado exitosamente')
    alert('Estado actualizado correctamente')
  } catch (err: any) {
    console.error('[RequestDetail] ❌ Error al guardar cambios:')
    console.error('  - Status:', err.response?.status)
    console.error('  - Status Text:', err.response?.statusText)
    console.error('  - Error del backend:', err.response?.data)
    console.error('  - Mensaje:', err.response?.data?.message || err.response?.data?.Message)
    console.error('  - Errores de validación:', err.response?.data?.errors)
    console.error('  - URL llamada:', err.config?.url)
    console.error('  - Payload enviado:', err.config?.data)
    
    const errorMsg = err.response?.data?.message 
      || err.response?.data?.Message 
      || err.response?.data?.title 
      || err.message 
      || 'Error desconocido'
    
    alert('Error al actualizar el estado: ' + errorMsg)
  }
}

// Helper para descargar archivos (blob)
const iniciarDescargaBlob = (blob: Blob, nombreArchivo: string) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nombreArchivo
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

// Acciones de descarga para SuperAdmin
const exportarPDF = async () => {
  if (!solicitud.value || downloadingPDF.value) return

  downloadingPDF.value = true
  try {
    console.log('[RequestDetail] Descargando PDF - Solicitud ID:', solicitud.value.id)
    
    const response = await api.get(`/solicitudes/${solicitud.value.id}/export/pdf`, {
      responseType: 'blob'
    })
    
    const nombreArchivo = solicitud.value.numeroSolicitud 
      ? `${solicitud.value.numeroSolicitud}.pdf`
      : `solicitud-${solicitud.value.id}.pdf`
    
    iniciarDescargaBlob(response.data, nombreArchivo)
    console.log('[RequestDetail] ✅ PDF descargado:', nombreArchivo)
  } catch (err: any) {
    console.error('[RequestDetail] ❌ Error al descargar PDF:', err.message)
    alert('Error al descargar PDF: ' + (err.response?.data?.message || err.message || 'Error desconocido'))
  } finally {
    downloadingPDF.value = false
  }
}

const exportarPNG = async () => {
  if (!solicitud.value || downloadingPNG.value) return

  downloadingPNG.value = true
  try {
    console.log('[RequestDetail] Descargando PNG - Solicitud ID:', solicitud.value.id)
    
    const response = await api.get(`/solicitudes/${solicitud.value.id}/export/png`, {
      responseType: 'blob'
    })
    
    const nombreArchivo = solicitud.value.numeroSolicitud 
      ? `${solicitud.value.numeroSolicitud}.png`
      : `solicitud-${solicitud.value.id}.png`
    
    iniciarDescargaBlob(response.data, nombreArchivo)
    console.log('[RequestDetail] ✅ PNG descargado:', nombreArchivo)
  } catch (err: any) {
    console.error('[RequestDetail] ❌ Error al descargar PNG:', err.message)
    alert('Error al descargar PNG: ' + (err.response?.data?.message || err.message || 'Error desconocido'))
  } finally {
    downloadingPNG.value = false
  }
}

// Helpers de formato
const getPriorityColor = (priority: number | undefined): string => {
  if (priority === 3) return 'bg-red-100 text-red-700 border-red-200'  // Alta
  if (priority === 2) return 'bg-yellow-100 text-yellow-700 border-yellow-200'  // Media
  if (priority === 1) return 'bg-green-100 text-green-700 border-green-200'  // Baja
  return 'bg-gray-100 text-gray-700 border-gray-200'
}

const getStatusColor = (status: number | undefined): string => {
  if (status === 1) return 'bg-blue-100 text-blue-700'  // Nueva
  if (status === 2) return 'bg-purple-100 text-purple-700'  // Asignado
  if (status === 3) return 'bg-green-100 text-green-700'  // Resuelto
  if (status === 4) return 'bg-gray-100 text-gray-700'  // Cerrado
  if (status === 5) return 'bg-red-100 text-red-700'  // Cancelado
  return 'bg-gray-100 text-gray-700'
}

// Nuevas funciones para trabajar con strings
const getEstadoColor = (estado: string): string => {
  const colores: Record<string, string> = {
    'Nueva': 'bg-blue-100 text-blue-800',
    'Asignado': 'bg-purple-100 text-purple-800',
    'Resuelta': 'bg-green-100 text-green-800',
    'Cerrada': 'bg-gray-200 text-gray-800',
    'Cancelada': 'bg-red-100 text-red-800',
    'Rechazada': 'bg-orange-100 text-orange-800',  // Estado adicional del backend
    '5': 'bg-red-100 text-red-800'  // Fallback para cuando muestra el número
  }
  return colores[estado] || 'bg-gray-100 text-gray-800'
}

const getPrioridadColor = (prioridad: string): string => {
  const colores: Record<string, string> = {
    'Alta': 'border-red-500 text-red-700 bg-red-50',
    'Media': 'border-yellow-500 text-yellow-700 bg-yellow-50',
    'Baja': 'border-green-500 text-green-700 bg-green-50'
  }
  return colores[prioridad] || 'border-gray-500 text-gray-700 bg-gray-50'
}

const getPriorityLabel = (priority: number | undefined): string => {
  if (priority === 3) return 'Alta'
  if (priority === 2) return 'Media'
  if (priority === 1) return 'Baja'
  return '-'
}

const getStatusLabel = (status: number | undefined): string => {
  const labels: Record<number, string> = {
    1: 'Nueva',
    2: 'Asignado',
    3: 'Resuelto',
    4: 'Cerrado',
    5: 'Cancelado'
  }
  return status ? (labels[status] || '-') : '-'
}

const formatDateTime = (dateStr: string | undefined): string => {
  if (!dateStr) return '-'
  
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return '-'
    
    return date.toLocaleString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true  // Mostrar AM/PM
    })
  } catch {
    return '-'
  }
}

// Helper para obtener iniciales del nombre
const getInitials = (nombre: string): string => {
  if (!nombre) return '?'
  const words = nombre.trim().split(' ')
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

// Helper para formatear tamaño de archivo
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

// Función para agregar comentario
const agregarComentario = async () => {
  if (!solicitud.value || !nuevoComentario.value.trim()) return

  try {
    console.log('[RequestDetail] Agregando comentario a solicitud', solicitud.value.id)
    
    const payload = {
      contenido: nuevoComentario.value
    }
    
    await api.post(`/solicitudes/${solicitud.value.id}/comentarios`, payload)
    
    console.log('[RequestDetail] ✅ Comentario agregado exitosamente')
    
    // Limpiar el campo
    nuevoComentario.value = ''
    
    // Recargar la solicitud para obtener el nuevo comentario
    await cargarSolicitud()
    
    alert('Comentario agregado correctamente')
  } catch (err: any) {
    console.error('[RequestDetail] ❌ Error al agregar comentario:', err.message)
    console.error('  - Status:', err.response?.status)
    console.error('  - Data:', err.response?.data)
    alert('Error al agregar comentario: ' + (err.response?.data?.message || err.message))
  }
}

// Función para descargar archivo adjunto
const descargarArchivo = async (archivoId: number) => {
  if (!solicitud.value) return

  try {
    console.log('[RequestDetail] Descargando archivo', archivoId)
    
    const response = await api.get(`/solicitudes/${solicitud.value.id}/archivos/${archivoId}/download`, {
      responseType: 'blob'
    })
    
    // Obtener nombre del archivo del header Content-Disposition o usar default
    const contentDisposition = response.headers['content-disposition']
    let filename = `archivo-${archivoId}`
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/)
      if (filenameMatch) {
        filename = filenameMatch[1]
      }
    }
    
    iniciarDescargaBlob(response.data, filename)
    console.log('[RequestDetail] ✅ Archivo descargado:', filename)
  } catch (err: any) {
    console.error('[RequestDetail] Error al descargar archivo:', err.message)
    alert('Error al descargar archivo: ' + (err.response?.data?.message || err.message))
  }
}

// Cargar solicitud al montar
onMounted(() => {
  cargarSolicitud()
})
</script>
