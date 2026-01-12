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
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h1 class="text-2xl font-semibold text-gray-900">{{ numeroSolicitud }}</h1>
              <span :class="['px-3 py-1 text-sm font-medium rounded-full border', getPrioridadColor(prioridadTexto)]">
                {{ prioridadTexto }}
              </span>
              <span :class="['px-3 py-1 text-sm font-medium rounded-full', getEstadoColor(estadoTexto)]">
                {{ estadoTexto }}
              </span>
            </div>
            <h2 v-if="!modoEdicion" class="text-xl text-gray-700">{{ solicitud.asunto }}</h2>
            <input 
              v-else
              v-model="asuntoEdit"
              type="text"
              class="text-xl text-gray-700 border-b-2 border-blue-500 focus:outline-none w-full"
              placeholder="Asunto de la solicitud"
            />
          </div>
          
          <!-- Botón Editar (solo si puede editar) -->
          <button
            v-if="puedeEditar && !modoEdicion"
            @click="iniciarEdicion"
            class="inline-flex items-center gap-2 px-4 py-2 text-[#0f3a72] border border-[#0f3a72] rounded-md hover:bg-[#0f3a72] hover:text-white transition-colors"
          >
            <Edit class="w-4 h-4" />
            Editar Solicitud
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Description -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Descripción</h3>
            <p v-if="!modoEdicion && solicitud.descripcion" class="text-gray-700 whitespace-pre-line">{{ solicitud.descripcion }}</p>
            <p v-else-if="!modoEdicion" class="text-gray-400 italic">Sin descripción</p>
            <textarea
              v-else
              v-model="descripcionEdit"
              rows="6"
              class="w-full px-3 py-2 border-2 border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Descripción detallada de la solicitud..."
            ></textarea>
            
            <!-- Prioridad en modo edición -->
            <div v-if="modoEdicion" class="mt-4">
              <label class="text-sm font-medium text-gray-900 mb-2 block">Prioridad</label>
              <div class="space-y-2">
                <label class="flex items-center gap-3 p-3 border-2 rounded-md cursor-pointer hover:bg-gray-50" :class="prioridadEdit === 1 ? 'border-blue-500 bg-blue-50' : 'border-gray-300'">
                  <input v-model.number="prioridadEdit" type="radio" :value="1" class="w-4 h-4 text-blue-600" />
                  <div>
                    <div class="font-medium text-gray-900">🟢 Baja</div>
                    <div class="text-sm text-gray-600">Puede esperar varios días</div>
                  </div>
                </label>
                <label class="flex items-center gap-3 p-3 border-2 rounded-md cursor-pointer hover:bg-gray-50" :class="prioridadEdit === 2 ? 'border-blue-500 bg-blue-50' : 'border-gray-300'">
                  <input v-model.number="prioridadEdit" type="radio" :value="2" class="w-4 h-4 text-blue-600" />
                  <div>
                    <div class="font-medium text-gray-900">🟡 Media</div>
                    <div class="text-sm text-gray-600">Necesita atención en 2-3 días</div>
                  </div>
                </label>
                <label class="flex items-center gap-3 p-3 border-2 rounded-md cursor-pointer hover:bg-gray-50" :class="prioridadEdit === 3 ? 'border-blue-500 bg-blue-50' : 'border-gray-300'">
                  <input v-model.number="prioridadEdit" type="radio" :value="3" class="w-4 h-4 text-blue-600" />
                  <div>
                    <div class="font-medium text-gray-900">🔴 Alta</div>
                    <div class="text-sm text-gray-600">Requiere atención inmediata</div>
                  </div>
                </label>
              </div>
            </div>
            
            <!-- Gestión de archivo en modo edición -->
            <div v-if="modoEdicion" class="mt-4">
              <label class="text-sm font-medium text-gray-900 mb-2 block">Archivo Adjunto</label>
              
              <!-- Archivo actual -->
              <div v-if="solicitud.archivo && !eliminarArchivo" class="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <File class="w-4 h-4 text-gray-400" />
                    <span class="text-sm text-gray-700">{{ solicitud.archivo.nombreArchivo }}</span>
                  </div>
                  <button
                    type="button"
                    @click="eliminarArchivo = true"
                    class="text-red-600 hover:text-red-800 text-sm"
                  >
                    <X class="w-4 h-4" />
                  </button>
                </div>
                <p class="text-xs text-gray-500 mt-1">Haz clic en la X para eliminar</p>
              </div>
              
              <!-- Mensaje de eliminación -->
              <div v-if="eliminarArchivo" class="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <p class="text-sm text-red-800">Se eliminará el archivo actual al guardar</p>
                <button
                  type="button"
                  @click="eliminarArchivo = false"
                  class="text-xs text-red-600 hover:text-red-800 mt-1"
                >
                  Cancelar eliminación
                </button>
              </div>
              
              <!-- Subir nuevo archivo -->
              <div class="border-2 border-dashed border-blue-300 rounded-md p-4 text-center">
                <Upload class="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p class="text-sm text-gray-600 mb-2">{{ solicitud.archivo && !eliminarArchivo ? 'Reemplazar archivo' : 'Subir archivo' }}</p>
                <input
                  type="file"
                  @change="handleFileChangeEdit"
                  class="hidden"
                  id="file-upload-edit"
                />
                <label
                  for="file-upload-edit"
                  class="inline-block px-3 py-1.5 bg-blue-100 text-blue-700 text-sm rounded-md cursor-pointer hover:bg-blue-200"
                >
                  Seleccionar archivo
                </label>
                <p v-if="nombreArchivoEdit" class="text-sm text-blue-700 mt-2">✓ {{ nombreArchivoEdit }}</p>
              </div>
            </div>
            
            <!-- Botones de acción en modo edición -->
            <div v-if="modoEdicion" class="flex gap-3 mt-6 pt-6 border-t">
              <button
                @click="guardarEdicion"
                :disabled="guardandoEdicion"
                class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#0f3a72] text-white rounded-md hover:bg-[#0a2850] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div v-if="guardandoEdicion" class="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <Save v-else class="w-5 h-5" />
                {{ guardandoEdicion ? 'Guardando...' : 'Guardar Cambios' }}
              </button>
              <button
                @click="cancelarEdicion"
                :disabled="guardandoEdicion"
                class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X class="w-5 h-5" />
                Cancelar
              </button>
            </div>
          </div>

          <!-- Comments/Activity -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Comentarios y Cronología</h3>
              
              <!-- Toggle para mostrar/ocultar comentarios del sistema -->
              <label class="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                <input 
                  type="checkbox" 
                  v-model="mostrarComentariosSistema"
                  class="w-4 h-4 text-amber-600 focus:ring-amber-500 rounded"
                />
                <span>Mostrar actividad del sistema</span>
              </label>
            </div>
            
            <!-- Comentarios existentes (ordenados cronológicamente) -->
            <div v-if="comentariosFiltrados.length > 0" class="space-y-4 mb-6">
              <div 
                v-for="comentario in comentariosFiltrados" 
                :key="comentario.id"
                :class="[
                  'pl-4 py-2',
                  comentario.esSistema 
                    ? 'border-l-4 border-amber-400 bg-amber-50' 
                    : 'border-l-4 border-blue-500'
                ]"
              >
                <div class="flex items-start gap-3">
                  <!-- Icono diferente para comentarios del sistema -->
                  <div 
                    v-if="comentario.esSistema"
                    class="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <!-- Icono normal para comentarios de usuario -->
                  <div 
                    v-else
                    class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm"
                  >
                    {{ getInitials(getNombreUsuarioComentario(comentario)) }}
                  </div>
                  
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1 flex-wrap">
                      <!-- Indicador de sistema -->
                      <span 
                        v-if="comentario.esSistema" 
                        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-200 text-amber-900"
                      >
                        🤖 Sistema
                      </span>
                      <span :class="comentario.esSistema ? 'text-sm text-gray-700' : 'font-semibold text-gray-900'">
                        {{ getNombreUsuarioComentario(comentario) }}
                      </span>
                      <span v-if="comentario.usuarioRolNombre && !comentario.esSistema" class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                        {{ comentario.usuarioRolNombre }}
                      </span>
                      <span class="text-sm text-gray-500">{{ formatDateTime(comentario.fechaCreacion) }}</span>
                    </div>
                    <p v-if="comentario.usuarioDepartamento && !comentario.esSistema" class="text-xs text-gray-500 mb-2">{{ comentario.usuarioDepartamento }}</p>
                    <p :class="comentario.esSistema ? 'text-amber-900 font-medium' : 'text-gray-700 whitespace-pre-line'">
                      {{ comentario.contenido }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Sin comentarios -->
            <div v-else class="text-center py-8 text-gray-500">
              <p>{{ mostrarComentariosSistema ? 'No hay comentarios aún' : 'No hay comentarios de usuarios aún' }}</p>
              <p v-if="puedeComentarYCambiarEstado" class="text-sm mt-1">Sé el primero en comentar esta solicitud</p>
              <p v-if="!mostrarComentariosSistema && comentariosOrdenados.some(c => c.esSistema)" class="text-sm mt-2 text-amber-600">
                Hay actividad del sistema oculta. Activa el interruptor para verla.
              </p>
            </div>
            
            <!-- Agregar comentario (solo Gestor/Admin) -->
            <div v-if="puedeComentarYCambiarEstado" class="mt-6 border-t pt-6">
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
            
            <!-- Mensaje para usuario solicitante -->
            <div v-else class="mt-6 border-t pt-6">
              <p class="text-sm text-gray-500 italic text-center">
                Solo los gestores y administradores pueden agregar comentarios
              </p>
            </div>
          </div>
          
          <!-- Archivo Adjunto -->
          <div v-if="solicitud.archivo" class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Archivo Adjunto</h3>
            <div class="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50">
              <div class="flex items-center gap-3">
                <FileText class="w-5 h-5 text-gray-400" />
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ solicitud.archivo.nombreArchivo }}</p>
                  <p class="text-xs text-gray-500">
                    {{ solicitud.archivo.contentType }}
                    <span v-if="solicitud.archivo.tamanoBytes"> · {{ formatFileSize(solicitud.archivo.tamanoBytes) }}</span>
                  </p>
                </div>
              </div>
              <button
                @click="descargarArchivo()"
                class="text-[#0f3a72] hover:text-[#0a2850]"
              >
                <Download class="w-4 h-4" />
              </button>
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
                <div class="flex items-center gap-3 mt-2">
                  <span v-if="solicitud.solicitanteDepartamento" class="inline-flex items-center text-xs text-gray-600">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {{ solicitud.solicitanteDepartamento }}
                  </span>
                  <span v-if="solicitud.solicitanteRolNombre" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {{ solicitud.solicitanteRolNombre }}
                  </span>
                  <span v-if="solicitud.solicitanteCodigoEmpleado" class="inline-flex items-center text-xs text-gray-500">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {{ solicitud.solicitanteCodigoEmpleado }}
                  </span>
                </div>
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
              <div v-if="estadoTexto === 'Rechazada' && solicitud.motivoRechazo" class="col-span-2">
                <p class="text-xs text-gray-500 mb-1">Motivo del Rechazo</p>
                <div class="bg-red-50 border border-red-200 rounded-md p-3">
                  <p class="text-sm text-red-800">{{ solicitud.motivoRechazo }}</p>
                </div>
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

          <!-- Actualizar Estado (Gestor/Admin) -->
          <div v-if="puedeComentarYCambiarEstado" class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Actualizar Estado</h3>
            <div class="space-y-3">
              <select 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72] focus:border-transparent"
                :value="estadoTexto"
                @change="actualizarEstado($event)"
              >
                <option 
                  v-for="estado in estadosDisponibles" 
                  :key="estado" 
                  :value="estado"
                >
                  {{ estado }}
                </option>
              </select>
              
              <!-- Campo de motivo de rechazo (solo cuando se selecciona Rechazada) -->
              <div v-if="estadoTemp === 'Rechazada'" class="space-y-2">
                <label class="text-sm font-medium text-gray-900">Motivo del Rechazo *</label>
                <textarea
                  v-model="motivoRechazoTemp"
                  placeholder="Explica por qué se rechaza esta solicitud..."
                  required
                  rows="3"
                  class="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                ></textarea>
                <p class="text-xs text-red-600">* Este campo es obligatorio para rechazar una solicitud</p>
              </div>
              
              <p v-if="hasMinRole(userRole, ROLES.ADMIN)" class="text-xs text-green-600 italic">✓ Sin restricciones (Admin)</p>
              <p v-else class="text-xs text-gray-500 italic">Solo se muestran transiciones válidas</p>
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
              <!-- Botón Asignar (solo Admin y si se puede asignar) -->
              <button
                v-if="hasMinRole(userRole, ROLES.ADMIN) && puedeSerAsignada"
                class="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#0f3a72] text-white rounded-md hover:bg-[#0a2850] transition-colors"
                @click="mostrarModalAsignacion"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Asignar a Gestor
              </button>
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

    <!-- Modal de Asignación -->
    <div
      v-if="mostrarModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="cerrarModal"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">Asignar Solicitud</h3>
          <button @click="cerrarModal" class="text-gray-400 hover:text-gray-600">
            <X class="w-5 h-5" />
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
            <p class="text-sm text-gray-600 mb-3">Selecciona un gestor para asignar esta solicitud:</p>
            <button
              v-for="gestor in gestoresDisponibles"
              :key="gestor.id"
              @click="seleccionarGestor(gestor.id)"
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

    <!-- Feedback de Asignación -->
    <div
      v-if="feedbackAsignacion"
      class="fixed top-4 right-4 z-50 max-w-sm animate-fade-in"
    >
      <div
        :class="[
          'rounded-lg shadow-lg p-4 border',
          feedbackAsignacion.tipo === 'success'
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        ]"
      >
        <p
          :class="[
            'text-sm font-medium',
            feedbackAsignacion.tipo === 'success' ? 'text-green-800' : 'text-red-800'
          ]"
        >
          {{ feedbackAsignacion.mensaje }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Download, FileText, Save, Edit, X, Upload, File } from 'lucide-vue-next'
import solicitudesService from '../../services/solicitudesService'
import catalogosService, { type Gestor } from '../../services/catalogosService'
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

// Computed para verificar si el usuario puede editar esta solicitud
const puedeEditar = computed(() => {
  if (!solicitud.value) return false
  
  const solicitudData = solicitud.value as any
  const userId = authStore.user?.id
  
  // El usuario debe ser el creador
  const esCreador = solicitudData.solicitanteId === userId
  
  // Debe estar en estado "Nueva"
  const esNueva = solicitudData.estado === 'Nueva'
  
  // No debe tener agente asignado
  const sinAgente = !solicitudData.gestorAsignadoId
  
  return esCreador && esNueva && sinAgente
})

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
  gestorAsignadoId?: number
  gestorAsignado?: {
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
  archivo?: {
    nombreArchivo: string
    contentType: string
    tamanoBytes: number | null
  }
  // Campos del backend plano (strings)
  solicitanteDepartamento?: string
  solicitanteRolNombre?: string
  solicitanteCodigoEmpleado?: string
  motivoRechazo?: string | null
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
    // Campos adicionales del backend
    usuarioRolNombre?: string
    usuarioDepartamento?: string
    esSistema?: boolean  // Campo para identificar comentarios del sistema
    tipoEvento?: string  // Tipo de evento del sistema (opcional)
  }>
}

// Estados reactivos
const solicitud = ref<SolicitudDisplay | null>(null)
const loading = ref<boolean>(false)
const error = ref<string | null>(null)
const downloadingPDF = ref<boolean>(false)
const downloadingPNG = ref<boolean>(false)
const nuevoComentario = ref<string>('')
const motivoRechazoTemp = ref<string>('')
const mostrarComentariosSistema = ref<boolean>(true) // Por defecto mostrar todo

// Estados para asignación
const mostrarModal = ref(false)
const gestoresDisponibles = ref<Gestor[]>([])
const cargandoGestores = ref(false)
const errorGestores = ref<string | null>(null)
const asignando = ref(false)
const feedbackAsignacion = ref<{ tipo: 'success' | 'error', mensaje: string } | null>(null)

// Estados para edición
const modoEdicion = ref<boolean>(false)
const asuntoEdit = ref<string>('')
const descripcionEdit = ref<string>('')
const prioridadEdit = ref<number>(1)
const archivoEdit = ref<File | null>(null)
const nombreArchivoEdit = ref<string>('')
const eliminarArchivo = ref<boolean>(false)
const guardandoEdicion = ref<boolean>(false)

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

// Computed para comentarios ordenados cronológicamente (más antiguos primero)
const comentariosOrdenados = computed(() => {
  if (!solicitud.value?.comentarios) return []
  return [...solicitud.value.comentarios].sort((a, b) => {
    const dateA = new Date(a.fechaCreacion).getTime()
    const dateB = new Date(b.fechaCreacion).getTime()
    return dateA - dateB // Orden ascendente (más antiguos primero)
  })
})

// Computed para filtrar comentarios según el toggle
const comentariosFiltrados = computed(() => {
  if (mostrarComentariosSistema.value) {
    return comentariosOrdenados.value // Mostrar todos
  }
  // Filtrar solo comentarios de usuarios (no del sistema)
  return comentariosOrdenados.value.filter(c => !c.esSistema)
})

// Computed para verificar si el usuario puede agregar comentarios
// Gestor/Admin pueden comentar, Usuario solicitante solo puede ver
const puedeComentarYCambiarEstado = computed(() => {
  if (!solicitud.value) return false
  
  const rol = userRole.value
  const userId = authStore.user?.id
  const solicitudData = solicitud.value as any
  
  // Admin y SuperAdmin pueden comentar siempre
  if (rol === ROLES.ADMIN || rol === ROLES.SUPER_ADMIN) {
    return true
  }
  
  // Gestor (AGENTE) puede comentar solo si:
  // 1. La solicitud está asignada a él
  // 2. Y la solicitud NO está en estado terminal (Cerrada, Rechazada, Cancelada)
  if (rol === ROLES.AGENTE) {
    const estaAsignadoAMi = solicitudData.gestorAsignadoId === userId
    const estadoActivo = !['Cerrada', 'Rechazada', 'Cancelada'].includes(solicitudData.estado)
    
    console.log('[RequestDetail] 🔍 Validación comentario Gestor:', {
      rol,
      userId,
      gestorAsignadoId: solicitudData.gestorAsignadoId,
      estaAsignadoAMi,
      estado: solicitudData.estado,
      estadoActivo,
      solicitudData: solicitudData
    })
    
    return estaAsignadoAMi && estadoActivo
  }
  
  console.log('[RequestDetail] ❌ Usuario no tiene permisos para comentar. Rol:', rol)
  return false
})

// Helper para obtener nombre de usuario de comentario
const getNombreUsuarioComentario = (comentario: any): string => {
  return comentario?.nombreUsuario || comentario?.usuario?.nombre || 'Usuario'
}

// Helper para verificar si una solicitud puede ser asignada/reasignada
// No se pueden asignar solicitudes que están: Rechazada, Resuelta, Cerrada o Cancelada
const puedeSerAsignada = computed(() => {
  if (!solicitud.value) return false
  
  const estadoActual = estadoTexto.value
  const estadosFinales = ['Resuelta', 'Cerrada', 'Rechazada', 'Cancelada']
  
  return !estadosFinales.includes(estadoActual)
})

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
    console.log('🔍 [DEBUG] gestorAsignado:', data.gestorAsignado)
    
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

// Computed: Estados disponibles según el estado actual y rol del usuario
const estadosDisponibles = computed(() => {
  const estadoActual = estadoTexto.value
  const rol = userRole.value
  
  // ADMIN y SUPER_ADMIN pueden cambiar a cualquier estado sin restricciones
  const todosLosEstados = ['Nueva', 'Asignado', 'Resuelta', 'Cerrada', 'Cancelada', 'Rechazada']
  
  if (hasMinRole(rol, ROLES.ADMIN)) {
    return todosLosEstados
  }
  
  // AGENTE sigue reglas de transición
  const transiciones: Record<string, string[]> = {
    'Nueva': ['Nueva', 'Asignado', 'Cancelada', 'Rechazada'],
    'Asignado': ['Asignado', 'Resuelta', 'Cancelada', 'Rechazada'],
    'Resuelta': ['Resuelta', 'Cerrada', 'Rechazada'],
    'Cerrada': ['Cerrada'], // Estado final - no se puede cambiar
    'Cancelada': ['Cancelada', 'Rechazada'], // Puede cambiar entre estados cerrados
    'Rechazada': ['Rechazada', 'Cancelada'], // Puede cambiar entre estados cerrados
  }
  
  return transiciones[estadoActual] || todosLosEstados
})

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
  if (estado === 'EnProceso') return 'Asignado' // Backend usa EnProceso, frontend usa Asignado
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
    motivoRechazoTemp.value = ''
    return
  }

  // Validar que se haya proporcionado motivo si el estado es Rechazada
  if (estadoTemp.value === 'Rechazada' && !motivoRechazoTemp.value.trim()) {
    alert('❌ Debes proporcionar un motivo para rechazar la solicitud')
    return
  }

  try {
    const nuevoEstadoNumero = estadoANumero(estadoTemp.value)
    const payload: any = {
      solicitudId: solicitud.value.id,
      nuevoEstado: nuevoEstadoNumero
    }
    
    // Agregar motivo de rechazo si aplica
    if (estadoTemp.value === 'Rechazada') {
      payload.motivoRechazo = motivoRechazoTemp.value.trim()
      console.log('[RequestDetail] 📝 Incluyendo motivo de rechazo:', payload.motivoRechazo)
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
    
    // Si se cambia a "Nueva", desasignar el gestor
    if (estadoTemp.value === 'Nueva') {
      const solicitudData = solicitud.value as any
      if (solicitudData.gestorAsignadoId) {
        console.log('[RequestDetail] 🔄 Desasignando gestor porque el estado cambió a "Nueva"...')
        try {
          await solicitudesService.desasignarSolicitud(solicitud.value.id)
          console.log('[RequestDetail] ✅ Gestor desasignado exitosamente')
        } catch (desasignarErr: any) {
          console.error('[RequestDetail] ⚠️ Error al desasignar gestor:', desasignarErr)
          // No bloqueamos el flujo si falla la desasignación
        }
      }
    }
    
    // Actualizar localmente después de éxito
    const data = solicitud.value as any
    data.estado = estadoTemp.value
    
    // Si fue rechazada, actualizar también el motivo
    if (estadoTemp.value === 'Rechazada') {
      data.motivoRechazo = motivoRechazoTemp.value.trim()
    }
    
    estadoTemp.value = undefined
    motivoRechazoTemp.value = ''
    
    console.log('[RequestDetail] ✅ Estado actualizado exitosamente')
    alert('Estado actualizado correctamente')
    
    // Recargar la solicitud para obtener datos actualizados
    await cargarSolicitud()
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
    console.log('[RequestDetail] 👤 Usuario actual:', authStore.user)
    console.log('[RequestDetail] 🔑 Rol del usuario:', authStore.userRole)
    console.log('[RequestDetail] 📋 Solicitud areaId:', (solicitud.value as any).areaId)
    console.log('[RequestDetail] 📋 Usuario areaId:', authStore.user?.areaId)
    console.log('[RequestDetail] ✅ Puede comentar (frontend):', puedeComentarYCambiarEstado.value)
    
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
    console.error('  - Status Text:', err.response?.statusText)
    console.error('  - Data:', err.response?.data)
    console.error('  - Message del backend:', err.response?.data?.message)
    console.error('  - Errores:', err.response?.data?.errors)
    
    const mensajeError = err.response?.data?.message || 
                        err.response?.data?.title ||
                        err.message || 
                        'Error al agregar comentario'
    alert('❌ ' + mensajeError)
  }
}

// Función para descargar archivo adjunto
const descargarArchivo = async () => {
  if (!solicitud.value || !solicitud.value.archivo) return

  try {
    const archivo = solicitud.value.archivo
    console.log('[RequestDetail] Descargando archivo:', archivo.nombreArchivo)
    
    const response = await api.get(`/solicitudes/${solicitud.value.id}/archivo/download`, {
      responseType: 'blob'
    })
    
    // Usar el nombre del archivo del DTO o del header Content-Disposition
    const contentDisposition = response.headers['content-disposition']
    let filename = archivo.nombreArchivo
    
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

// Funciones de edición
const iniciarEdicion = () => {
  if (!solicitud.value) return
  
  const solicitudData = solicitud.value as any
  
  // Cargar valores actuales en los campos de edición
  asuntoEdit.value = solicitudData.asunto || ''
  descripcionEdit.value = solicitudData.descripcion || ''
  prioridadEdit.value = solicitudData.prioridad ? 
    (solicitudData.prioridad === 'Baja' ? 1 : solicitudData.prioridad === 'Media' ? 2 : 3) : 1
  
  modoEdicion.value = true
  console.log('[RequestDetail] Modo edición activado')
}

const cancelarEdicion = () => {
  modoEdicion.value = false
  asuntoEdit.value = ''
  descripcionEdit.value = ''
  prioridadEdit.value = 1
  archivoEdit.value = null
  nombreArchivoEdit.value = ''
  eliminarArchivo.value = false
  console.log('[RequestDetail] Edición cancelada')
}

const handleFileChangeEdit = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    archivoEdit.value = file
    nombreArchivoEdit.value = file.name
    eliminarArchivo.value = false  // Si sube nuevo archivo, no eliminar el anterior
    console.log('[RequestDetail] Archivo seleccionado para edición:', file.name)
  }
}

const guardarEdicion = async () => {
  if (!solicitud.value) return
  
  // Validaciones
  if (!asuntoEdit.value.trim()) {
    alert('El asunto es obligatorio')
    return
  }
  
  if (!descripcionEdit.value.trim()) {
    alert('La descripción es obligatoria')
    return
  }
  
  guardandoEdicion.value = true
  
  try {
    // Construir FormData
    const formData = new FormData()
    formData.append('Asunto', asuntoEdit.value.trim())
    formData.append('Descripcion', descripcionEdit.value.trim())
    formData.append('Prioridad', prioridadEdit.value.toString())
    formData.append('EliminarArchivo', eliminarArchivo.value.toString())
    
    // Agregar archivo si se seleccionó uno nuevo
    if (archivoEdit.value) {
      formData.append('Archivo', archivoEdit.value)
      console.log('[RequestDetail] Incluyendo nuevo archivo:', archivoEdit.value.name)
    }
    
    console.log('[RequestDetail] Guardando edición de solicitud', solicitud.value.id)
    
    // Llamar al endpoint PUT /api/solicitudes/{id}
    const response = await api.put(`/solicitudes/${solicitud.value.id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    console.log('[RequestDetail] ✅ Solicitud editada:', response.data)
    
    // Salir del modo edición
    cancelarEdicion()
    
    // Recargar la solicitud
    await cargarSolicitud()
    
    alert('✅ Solicitud actualizada correctamente')
  } catch (err: any) {
    console.error('[RequestDetail] Error al guardar edición:', err)
    
    let errorMsg = 'Error al actualizar la solicitud'
    
    if (err.response?.status === 403) {
      errorMsg = err.response.data?.message || 'No tienes permiso para editar esta solicitud'
    } else if (err.response?.status === 400) {
      errorMsg = err.response.data?.message || 'No puedes editar esta solicitud en su estado actual'
    } else if (err.response?.data?.message) {
      errorMsg = err.response.data.message
    }
    
    alert('❌ ' + errorMsg)
  } finally {
    guardandoEdicion.value = false
  }
}

// Funciones para asignación
const mostrarModalAsignacion = async () => {
  const solicitudData = solicitud.value as any
  const areaId = solicitudData?.areaId
  
  if (!areaId) {
    feedbackAsignacion.value = {
      tipo: 'error',
      mensaje: 'No se puede determinar el área de esta solicitud'
    }
    setTimeout(() => { feedbackAsignacion.value = null }, 3000)
    return
  }

  mostrarModal.value = true
  cargandoGestores.value = true
  errorGestores.value = null
  gestoresDisponibles.value = []

  try {
    console.log('[RequestDetail] Cargando gestores del área:', areaId)
    console.log('[RequestDetail] Solicitud completa:', solicitud.value)
    const gestores = await catalogosService.obtenerGestoresPorArea(areaId)
    gestoresDisponibles.value = gestores
    console.log('[RequestDetail] Gestores cargados:', gestores.length)
  } catch (err: any) {
    console.error('[RequestDetail] Error al cargar gestores:', err)
    errorGestores.value = err.response?.data?.message || err.message || 'Error al cargar gestores'
  } finally {
    cargandoGestores.value = false
  }
}

const cerrarModal = () => {
  if (asignando.value) return
  mostrarModal.value = false
  gestoresDisponibles.value = []
  errorGestores.value = null
}

const seleccionarGestor = async (gestorId: number) => {
  if (!solicitud.value?.id) return

  asignando.value = true
  
  try {
    console.log('[RequestDetail] Asignando solicitud a gestor:', gestorId)
    await solicitudesService.asignarSolicitud(solicitud.value.id, gestorId)
    
    feedbackAsignacion.value = {
      tipo: 'success',
      mensaje: '✓ Solicitud asignada exitosamente'
    }
    
    mostrarModal.value = false
    await cargarSolicitud()
    
    setTimeout(() => {
      feedbackAsignacion.value = null
    }, 3000)
  } catch (err: any) {
    console.error('[RequestDetail] Error al asignar solicitud:', err)
    feedbackAsignacion.value = {
      tipo: 'error',
      mensaje: err.response?.data?.message || err.message || 'Error al asignar la solicitud'
    }
    
    setTimeout(() => {
      feedbackAsignacion.value = null
    }, 5000)
  } finally {
    asignando.value = false
  }
}

// Cargar solicitud al montar
onMounted(() => {
  cargarSolicitud()
})
</script>
