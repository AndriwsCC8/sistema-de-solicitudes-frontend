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
        <!-- Area -->
        <div class="space-y-2">
          <label for="area" class="text-sm font-medium">Área *</label>
          <select
            id="area"
            v-model="area"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
          >
            <option value="">Selecciona un área</option>
            <option value="it-support">Soporte TI</option>
            <option value="hr">Recursos Humanos</option>
            <option value="administration">Administración</option>
            <option value="facilities">Instalaciones</option>
            <option value="finance">Finanzas</option>
          </select>
        </div>

        <!-- Request Type -->
        <div class="space-y-2">
          <label for="request-type" class="text-sm font-medium">Tipo de Solicitud *</label>
          <select
            id="request-type"
            v-model="requestType"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
          >
            <option value="">Selecciona el tipo de solicitud</option>
            <option value="incident">Incidente</option>
            <option value="service-request">Solicitud de Servicio</option>
            <option value="access-request">Solicitud de Acceso</option>
            <option value="information">Solicitud de Información</option>
            <option value="change">Solicitud de Cambio</option>
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
                v-model="priority"
                type="radio"
                value="low"
                class="w-4 h-4 text-[#0f3a72] focus:ring-[#0f3a72]"
              />
              <div>
                <div class="font-medium text-gray-900">🟢 Baja</div>
                <div class="text-sm text-gray-600">Puede esperar varios días</div>
              </div>
            </label>
            <label class="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
              <input
                v-model="priority"
                type="radio"
                value="medium"
                class="w-4 h-4 text-[#0f3a72] focus:ring-[#0f3a72]"
              />
              <div>
                <div class="font-medium text-gray-900">🟡 Media</div>
                <div class="text-sm text-gray-600">Necesita atención en 2-3 días</div>
              </div>
            </label>
            <label class="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
              <input
                v-model="priority"
                type="radio"
                value="high"
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
            class="inline-flex items-center gap-2 px-6 py-3 bg-[#0f3a72] text-white rounded-md hover:bg-[#0d3260] transition-colors font-medium"
          >
            <Save class="w-5 h-5" />
            Crear Solicitud
          </button>
          <button
            type="button"
            @click="router.push('/dashboard')"
            class="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
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

const router = useRouter()

const area = ref('')
const requestType = ref('')
const subject = ref('')
const description = ref('')
const priority = ref('medium')
const fileName = ref('')

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    fileName.value = file.name
  }
}

const handleSave = () => {
  // Here you would normally save the request
  alert('¡Solicitud creada exitosamente!')
  router.push('/dashboard')
}
</script>
