<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">Crear Nueva Solicitud</h1>
      <p class="text-gray-600 mt-1">Completa los detalles a continuación para enviar una nueva solicitud</p>
    </div>

    <!-- Form Card -->
    <div class="bg-white rounded-lg shadow-sm p-8 max-w-3xl mx-auto">
      <form @submit.prevent="handleSave" class="space-y-6">
        <!-- Request Type -->
        <div class="space-y-2">
          <label for="request-type" class="text-sm font-medium">Tipo de Solicitud *</label>
          <select
            id="request-type"
            v-model.number="requestType"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
          >
            <option value="">Selecciona el tipo de solicitud</option>
            <option :value="1">Soporte PC</option>
            <option :value="2">Acceso a Sistema</option>
            <option :value="3">Reparación</option>
            <option :value="4">Asignación de Vehículo</option>
            <option :value="5">Compra de Material</option>
          </select>
        </div>

        <!-- Subject -->
        <div class="space-y-2">
          <label for="subject" class="text-sm font-medium">Asunto *</label>
          <input
            id="subject"
            v-model="subject"
            type="text"
            placeholder="Descripción breve de tu solicitud"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
          />
        </div>

        <!-- Description -->
        <div class="space-y-2">
          <label for="description" class="text-sm font-medium">Descripción *</label>
          <textarea
            id="description"
            v-model="description"
            placeholder="Proporciona información detallada sobre tu solicitud..."
            required
            rows="6"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72] resize-none"
          ></textarea>
        </div>

        <!-- Priority -->
        <div class="space-y-2">
          <label class="text-sm font-medium">Prioridad *</label>
          <div class="space-y-2">
            <label class="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
              <input
                v-model.number="priority"
                type="radio"
                :value="1"
                required
                class="w-4 h-4 text-[#0f3a72] focus:ring-[#0f3a72]"
              />
              <div>
                <div class="font-medium text-gray-900">🟢 Baja</div>
                <div class="text-sm text-gray-600">Puede esperar varios días</div>
              </div>
            </label>
            <label class="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
              <input
                v-model.number="priority"
                type="radio"
                :value="2"
                required
                class="w-4 h-4 text-[#0f3a72] focus:ring-[#0f3a72]"
              />
              <div>
                <div class="font-medium text-gray-900">🟡 Media</div>
                <div class="text-sm text-gray-600">Necesita atención en 2-3 días</div>
              </div>
            </label>
            <label class="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
              <input
                v-model.number="priority"
                type="radio"
                :value="3"
                required
                class="w-4 h-4 text-[#0f3a72] focus:ring-[#0f3a72]"
              />
              <div>
                <div class="font-medium text-gray-900">🔴 Alta</div>
                <div class="text-sm text-gray-600">Requiere atención inmediata</div>
              </div>
            </label>
          </div>
        </div>

        <!-- File Upload -->
        <div class="space-y-2">
          <label class="text-sm font-medium">Archivos Adjuntos</label>
          <div class="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-[#0f3a72] transition-colors">
            <Upload class="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p class="text-sm text-gray-600 mb-2">Arrastra archivos o haz clic para seleccionar</p>
            <input
              type="file"
              @change="handleFileChange"
              class="hidden"
              id="file-upload"
            />
            <label
              for="file-upload"
              class="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-md cursor-pointer hover:bg-gray-200 transition-colors"
            >
              Seleccionar archivo
            </label>
            <p class="text-xs text-gray-500 mt-2">Máximo 10 MB por archivo</p>
            
            <div v-if="fileName" class="mt-4 inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-md">
              <File class="w-4 h-4" />
              <span class="text-sm">{{ fileName }}</span>
              <button
                type="button"
                @click="fileName = ''"
                class="ml-2 text-blue-700 hover:text-blue-900"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-4">
          <button
            type="submit"
            :disabled="loading"
            :class="[
              'inline-flex items-center gap-2 px-6 py-3 rounded-md transition-colors font-medium',
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#0f3a72] text-white hover:bg-[#0d3260]'
            ]"
          >
            <div v-if="loading" class="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <Save v-else class="w-5 h-5" />
            {{ loading ? 'Creando...' : 'Crear Solicitud' }}
          </button>
          <button
            type="button"
            @click="router.push('/dashboard')"
            :disabled="loading"
            class="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X class="w-5 h-5" />
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Save, X, Upload, File } from 'lucide-vue-next'
import solicitudesService from '../../services/solicitudesService'

const router = useRouter()

// Formulario inicializado completamente vacío
const requestType = ref<number | ''>('')
const subject = ref('')
const description = ref('')
const priority = ref<number | ''>('')
const fileName = ref('')

// Estados
const loading = ref(false)
const error = ref<string | null>(null)

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    fileName.value = file.name
  }
}

const handleSave = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Validaciones exhaustivas de campos obligatorios
    const validationErrors: string[] = []
    
    if (!requestType.value) {
      validationErrors.push('Debe seleccionar un tipo de solicitud')
    }
    
    if (!subject.value || !subject.value.trim()) {
      validationErrors.push('El asunto es obligatorio')
    }
    
    if (!description.value || !description.value.trim()) {
      validationErrors.push('La descripción es obligatoria')
    }
    
    if (!priority.value) {
      validationErrors.push('Debe seleccionar una prioridad')
    }
    
    // Si hay errores de validación, mostrarlos y detener el envío
    if (validationErrors.length > 0) {
      const errorMsg = 'Por favor, completa los siguientes campos:\n\n' + validationErrors.map(e => `• ${e}`).join('\n')
      alert(errorMsg)
      error.value = errorMsg
      return
    }
    
    // Construir el payload con solo los campos requeridos por el backend
    const payload = {
      TipoSolicitudId: requestType.value as number,
      Asunto: subject.value.trim(),
      Descripcion: description.value.trim(),
      Prioridad: priority.value as number
    }
    
    console.log('[NewRequest] Enviando solicitud:', payload)
    
    // Crear la solicitud
    const nuevaSolicitud = await solicitudesService.crearSolicitud(payload)
    
    console.log('[NewRequest] Solicitud creada exitosamente:', nuevaSolicitud)
    
    // Mostrar mensaje de éxito y redirigir
    alert('¡Solicitud creada exitosamente!')
    await router.push('/dashboard')
  } catch (err: any) {
    console.error('[NewRequest] Error al crear solicitud:', err.message)
    
    // Extraer mensaje de error del backend
    let errorMessage = 'Error al crear la solicitud. Por favor, intenta nuevamente.'
    
    if (err.response?.data) {
      const errorData = err.response.data
      
      if (typeof errorData === 'string') {
        errorMessage = errorData
      } else if (errorData.message) {
        errorMessage = errorData.message
      } else if (errorData.title) {
        errorMessage = errorData.title
        if (errorData.detail) {
          errorMessage += `\n${errorData.detail}`
        }
      } else if (errorData.errors) {
        // ValidationProblemDetails de ASP.NET Core
        const errors = Object.entries(errorData.errors)
          .map(([field, messages]: [string, any]) => {
            const msgs = Array.isArray(messages) ? messages.join(', ') : messages
            return `• ${field}: ${msgs}`
          })
          .join('\n')
        errorMessage = `Errores de validación:\n${errors}`
      }
    } else if (err.message) {
      errorMessage = err.message
    }
    
    // Agregar código de estado si está disponible
    if (err.response?.status) {
      errorMessage = `Error ${err.response.status}: ${errorMessage}`
    }
    
    error.value = errorMessage
    alert(errorMessage)
  } finally {
    loading.value = false
  }
}
</script>
