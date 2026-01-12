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
      <!-- Feedback Message -->
      <div
        v-if="feedback"
        :class="[
          'rounded-lg p-4',
          feedback.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        ]"
      >
        <p :class="feedback.type === 'success' ? 'text-green-800' : 'text-red-800'">
          {{ feedback.message }}
        </p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-800">{{ error }}</p>
      </div>

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

        <!-- Buscador de usuarios -->
        <div class="mb-6">
          <div class="relative">
            <input
              v-model="busquedaUsuarios"
              type="text"
              placeholder="Buscar por nombre, email, usuario, rol o área..."
              class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72] focus:border-transparent"
            />
            <svg
              class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p v-if="busquedaUsuarios" class="text-sm text-gray-500 mt-2">
            Mostrando {{ usuariosFiltrados.length }} de {{ users.length }} usuarios
          </p>
        </div>

        <!-- Filtros por estado -->
        <div class="mb-6">
          <div class="flex gap-3">
            <button
              @click="filtroEstadoUsuarios = 'todos'"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                filtroEstadoUsuarios === 'todos'
                  ? 'bg-[#0f3a72] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              Todos ({{ users.length }})
            </button>
            <button
              @click="filtroEstadoUsuarios = 'activos'"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                filtroEstadoUsuarios === 'activos'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              Activos ({{ users.filter(u => u.activo).length }})
            </button>
            <button
              @click="filtroEstadoUsuarios = 'inactivos'"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                filtroEstadoUsuarios === 'inactivos'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              Inactivos ({{ users.filter(u => !u.activo).length }})
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f3a72]"></div>
          <p class="text-gray-500 mt-3">Cargando usuarios...</p>
        </div>

        <!-- Users Table -->
        <div v-else class="overflow-x-auto">
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
              <tr v-if="usuariosFiltrados.length === 0">
                <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                  {{ busquedaUsuarios ? 'No se encontraron usuarios que coincidan con la búsqueda' : 'No hay usuarios registrados' }}
                </td>
              </tr>
              <tr v-for="user in usuariosFiltrados" :key="user.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-10 h-10 rounded-full bg-[#0f3a72] flex items-center justify-center text-white font-medium">
                      {{ user.nombre.charAt(0).toUpperCase() }}
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ user.nombre }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.email }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getRoleBadgeClass(user.rolId)">
                    {{ user.rolNombre || getRoleLabel(user.rolId) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.areaNombre || 'Sin área' }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="user.activo ? 'px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700' : 'px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700'">
                    {{ user.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <button 
                    @click="abrirModalEdicion(user)"
                    class="text-[#0f3a72] hover:text-[#0d3260] mr-3"
                  >
                    Editar
                  </button>
                  <button 
                    @click="toggleUsuarioEstado(user)"
                    class="text-gray-600 hover:text-gray-800"
                  >
                    {{ user.activo ? 'Desactivar' : 'Activar' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Solicitudes Sin Asignar -->
    <div v-if="activeTab === 'unassigned'" class="space-y-6">
      <!-- Feedback Message -->
      <div
        v-if="feedback"
        :class="[
          'rounded-lg p-4',
          feedback.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        ]"
      >
        <p :class="feedback.type === 'success' ? 'text-green-800' : 'text-red-800'">
          {{ feedback.message }}
        </p>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-xl font-semibold text-gray-900">Solicitudes Sin Asignar</h2>
            <p class="text-sm text-gray-600 mt-1">Todas las solicitudes nuevas sin gestor asignado</p>
          </div>
        </div>

        <!-- Filtros -->
        <div class="flex gap-4 mb-6">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">Filtrar por Prioridad</label>
            <select
              v-model="filtroSinAsignar.prioridad"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
            >
              <option value="">Todas las prioridades</option>
              <option value="3">Alta</option>
              <option value="2">Media</option>
              <option value="1">Baja</option>
            </select>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">Ordenar por Fecha</label>
            <select
              v-model="filtroSinAsignar.ordenFecha"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
            >
              <option value="">Sin ordenar</option>
              <option value="desc">Más recientes primero</option>
              <option value="asc">Más antiguas primero</option>
            </select>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f3a72]"></div>
          <p class="text-gray-500 mt-3">Cargando solicitudes...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="solicitudesSinAsignarFiltradas.length === 0" class="text-center py-12">
          <p class="text-gray-500">{{ solicitudesSinAsignar.length === 0 ? 'No hay solicitudes sin asignar' : 'No hay solicitudes que coincidan con los filtros' }}</p>
          <p class="text-sm text-gray-400 mt-2">{{ solicitudesSinAsignar.length === 0 ? 'Todas las solicitudes nuevas sin gestor aparecerán aquí' : 'Intenta ajustar los filtros' }}</p>
        </div>

        <!-- Solicitudes Cards -->
        <div v-else class="space-y-4">
          <div
            v-for="solicitud in solicitudesSinAsignarFiltradas"
            :key="solicitud.id"
            class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <span class="text-sm font-medium text-gray-500">{{ solicitud.numeroSolicitud }}</span>
                  <span
                    :class="['px-2 py-1 text-xs font-medium rounded-full', getPrioridadInfo(solicitud.prioridad).class]"
                  >
                    {{ getPrioridadInfo(solicitud.prioridad).label }}
                  </span>
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-medium rounded-full',
                      'bg-blue-100 text-blue-700'
                    ]"
                  >
                    Nueva
                  </span>
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-medium rounded',
                      solicitud.area ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'
                    ]"
                  >
                    {{ solicitud.area || 'Sin área' }}
                  </span>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-1">{{ solicitud.asunto }}</h3>
                <p class="text-sm text-gray-600 mb-2">
                  {{ solicitud.tipoSolicitud }} • {{ new Date(solicitud.fechaCreacion).toLocaleDateString() }}
                </p>
                <div class="text-sm text-gray-500">
                  <span class="font-medium">Solicitante:</span> {{ solicitud.solicitante }}
                  <span class="text-gray-400 ml-2">{{ solicitud.solicitanteEmail }}</span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="verDetalle(solicitud.id)"
                  class="inline-flex items-center gap-2 px-4 py-2 text-[#0f3a72] border border-[#0f3a72] rounded-md hover:bg-[#0f3a72] hover:text-white transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Ver Detalles
                </button>
                <button
                  v-if="puedeSerAsignada(solicitud.estado)"
                  @click="abrirModalAsignarAgente(solicitud)"
                  class="inline-flex items-center gap-2 px-4 py-2 bg-[#0f3a72] text-white rounded-md hover:bg-[#0d3260] transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Asignar a Gestor
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Solicitudes Tipo Otro Management -->
    <div v-if="activeTab === 'tipo-otro'" class="space-y-6">
      <!-- Feedback Message -->
      <div
        v-if="feedback"
        :class="[
          'rounded-lg p-4',
          feedback.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        ]"
      >
        <p :class="feedback.type === 'success' ? 'text-green-800' : 'text-red-800'">
          {{ feedback.message }}
        </p>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-xl font-semibold text-gray-900">Solicitudes Tipo "Otro"</h2>
            <p class="text-sm text-gray-600 mt-1">Todas las solicitudes tipo "Otro" (asignadas y sin asignar)</p>
          </div>
        </div>

        <!-- Filtros -->
        <div class="flex gap-4 mb-6">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">Filtrar por Prioridad</label>
            <select
              v-model="filtroTipoOtro.prioridad"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
            >
              <option value="">Todas las prioridades</option>
              <option value="3">Alta</option>
              <option value="2">Media</option>
              <option value="1">Baja</option>
            </select>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">Ordenar por Fecha</label>
            <select
              v-model="filtroTipoOtro.ordenFecha"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
            >
              <option value="">Sin ordenar</option>
              <option value="desc">Más recientes primero</option>
              <option value="asc">Más antiguas primero</option>
            </select>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f3a72]"></div>
          <p class="text-gray-500 mt-3">Cargando solicitudes...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="solicitudesTipoOtroFiltradas.length === 0" class="text-center py-12">
          <p class="text-gray-500">{{ solicitudesTipoOtro.length === 0 ? 'No hay solicitudes tipo "Otro"' : 'No hay solicitudes que coincidan con los filtros' }}</p>
          <p class="text-sm text-gray-400 mt-2">{{ solicitudesTipoOtro.length === 0 ? 'Las solicitudes tipo "Otro" aparecerán aquí' : 'Intenta ajustar los filtros' }}</p>
        </div>

        <!-- Solicitudes Cards -->
        <div v-else class="space-y-4">
          <div
            v-for="solicitud in solicitudesTipoOtroFiltradas"
            :key="solicitud.id"
            class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <span class="text-sm font-medium text-gray-500">{{ solicitud.numeroSolicitud }}</span>
                  <span
                    :class="['px-2 py-1 text-xs font-medium rounded-full', getPrioridadInfo(solicitud.prioridad).class]"
                  >
                    {{ getPrioridadInfo(solicitud.prioridad).label }}
                  </span>
                  <span
                    :class="['px-2 py-1 text-xs font-medium rounded-full', getEstadoInfo(solicitud.estado).class]"
                  >
                    {{ getEstadoInfo(solicitud.estado).label }}
                  </span>
                  <span
                    v-if="solicitud.gestorAsignadoId"
                    class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700"
                  >
                    Asignada
                  </span>
                  <span
                    v-else
                    class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700"
                  >
                    Sin Asignar
                  </span>
                  <span class="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-600">
                    Sin área
                  </span>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-1">{{ solicitud.asunto }}</h3>
                <p class="text-sm text-gray-600 mb-2">
                  {{ solicitud.tipoSolicitud }} • {{ new Date(solicitud.fechaCreacion).toLocaleDateString() }}
                </p>
                <div class="text-sm text-gray-500">
                  <span class="font-medium">Solicitante:</span> {{ solicitud.solicitante }}
                  <span class="text-gray-400 ml-2">{{ solicitud.solicitanteEmail }}</span>
                </div>
                <div v-if="solicitud.gestorAsignado" class="text-sm text-gray-500 mt-1">
                  <span class="font-medium">Asignada a:</span> {{ solicitud.gestorAsignado }}
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="verDetalle(solicitud.id)"
                  class="inline-flex items-center gap-2 px-4 py-2 text-[#0f3a72] border border-[#0f3a72] rounded-md hover:bg-[#0f3a72] hover:text-white transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Ver Detalles
                </button>
                <button
                  v-if="puedeSerAsignada(solicitud.estado)"
                  @click="abrirModalAsignarAgente(solicitud)"
                  class="inline-flex items-center gap-2 px-4 py-2 bg-[#0f3a72] text-white rounded-md hover:bg-[#0d3260] transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {{ solicitud.gestorAsignadoId ? 'Reasignar' : 'Asignar' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Areas Management -->
    <div v-if="activeTab === 'areas'" class="space-y-6">
      <!-- Feedback Message -->
      <div
        v-if="feedback"
        :class="[
          'rounded-lg p-4',
          feedback.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        ]"
      >
        <p :class="feedback.type === 'success' ? 'text-green-800' : 'text-red-800'">
          {{ feedback.message }}
        </p>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold text-gray-900">Gestión de Áreas</h2>
          <button 
            @click="showNewAreaModal = true"
            class="px-4 py-2 bg-[#0f3a72] text-white rounded-md hover:bg-[#0d3260] transition-colors"
          >
            + Agregar Área
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f3a72]"></div>
          <p class="text-gray-500 mt-3">Cargando áreas...</p>
        </div>

        <!-- Areas Grid -->
        <div v-else-if="areas.length === 0" class="text-center py-12 text-gray-500">
          No hay áreas registradas
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="area in areas" :key="area.id" class="border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">{{ area.nombre }}</h3>
              <div class="flex items-center gap-2">
                <span
                  :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    area.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  ]"
                >
                  {{ area.activo ? 'Activa' : 'Inactiva' }}
                </span>
                <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                  {{ area.cantidadAgentes || 0 }} agentes
                </span>
              </div>
            </div>
            <p class="text-sm text-gray-600 mb-4">{{ area.descripcion || 'Sin descripción' }}</p>
            <div class="flex gap-2">
              <button 
                @click="abrirModalEdicionArea(area)"
                class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Editar
              </button>
              <button 
                @click="toggleAreaEstado(area)"
                :class="[
                  'px-3 py-2 text-sm border rounded-md',
                  area.activo 
                    ? 'text-orange-600 border-orange-200 hover:bg-orange-50' 
                    : 'text-green-600 border-green-200 hover:bg-green-50'
                ]"
              >
                {{ area.activo ? 'Desactivar' : 'Activar' }}
              </button>
              <button 
                @click="eliminarArea(area.id, area.nombre)"
                class="px-3 py-2 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Categories Management -->
    <div v-if="activeTab === 'categories'" class="space-y-6">
      <!-- Feedback Message -->
      <div
        v-if="feedback"
        :class="[
          'rounded-lg p-4',
          feedback.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        ]"
      >
        <p :class="feedback.type === 'success' ? 'text-green-800' : 'text-red-800'">
          {{ feedback.message }}
        </p>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold text-gray-900">Categorías de Solicitudes</h2>
          <button 
            @click="showNewCategoryModal = true"
            class="px-4 py-2 bg-[#0f3a72] text-white rounded-md hover:bg-[#0d3260] transition-colors"
          >
            + Agregar Categoría
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f3a72]"></div>
          <p class="text-gray-500 mt-3">Cargando categorías...</p>
        </div>

        <!-- Categories List -->
        <div v-else-if="categories.length === 0" class="text-center py-12 text-gray-500">
          No hay categorías registradas
        </div>

        <div v-else class="space-y-4">
          <div v-for="category in categories" :key="category.id" :class="['border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50', !category.activo ? 'bg-gray-50 opacity-75' : '']">
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <h3 class="text-base font-medium text-gray-900">{{ category.nombre }}</h3>
                <span v-if="!category.activo" class="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200 text-gray-600">
                  Inactiva
                </span>
                <span v-else class="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                  Activa
                </span>
              </div>
              <p class="text-sm text-gray-600">{{ category.descripcion || 'Sin descripción' }}</p>
              <p class="text-xs text-gray-500 mt-1">Área: {{ category.areaNombre || 'Sin área' }}</p>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-sm text-gray-500">{{ category.cantidadSolicitudes || 0 }} solicitudes</span>
              <button 
                @click="abrirModalEdicionCategoria(category)"
                class="text-[#0f3a72] hover:text-[#0d3260] text-sm"
              >
                Editar
              </button>
              <button 
                @click="toggleActivoCategoria(category.id, category.nombre, category.activo)"
                :class="[
                  'text-sm',
                  category.activo ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'
                ]"
              >
                {{ category.activo ? 'Desactivar' : 'Activar' }}
              </button>
              <button 
                @click="eliminarCategoria(category.id, category.nombre)"
                class="text-red-600 hover:text-red-800 text-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reports -->
    <div v-if="activeTab === 'reports'" class="space-y-6">
      <!-- Header con botón de exportar -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">Reportes del Sistema</h2>
          <p class="text-sm text-gray-600 mt-1">Visualización de métricas y actividad general</p>
        </div>
        <button
          @click="exportarReporteExcel"
          :disabled="exportandoExcel"
          class="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="!exportandoExcel" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div v-else class="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          {{ exportandoExcel ? 'Exportando...' : 'Exportar a Excel' }}
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f3a72]"></div>
        <p class="text-gray-500 mt-3">Cargando métricas...</p>
      </div>

      <template v-else-if="metricas">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <p class="text-sm text-gray-600 mb-1">Total Solicitudes</p>
            <p class="text-3xl font-bold text-gray-900">{{ metricas.totalSolicitudes }}</p>
            <p v-if="metricas.variacionMensual" class="text-xs mt-2" :class="metricas.variacionMensual >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ metricas.variacionMensual >= 0 ? '↑' : '↓' }} {{ Math.abs(metricas.variacionMensual) }}% vs mes anterior
            </p>
            <p v-else class="text-xs text-gray-500 mt-2">Todas las solicitudes</p>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6">
            <p class="text-sm text-gray-600 mb-1">En Progreso</p>
            <p class="text-3xl font-bold text-blue-600">{{ metricas.solicitudesEnProceso }}</p>
            <p class="text-xs text-gray-500 mt-2">
              {{ metricas.totalSolicitudes > 0 ? Math.round((metricas.solicitudesEnProceso / metricas.totalSolicitudes) * 100) : 0 }}% del total
            </p>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6">
            <p class="text-sm text-gray-600 mb-1">Resueltas</p>
            <p class="text-3xl font-bold text-green-600">{{ metricas.solicitudesResueltas }}</p>
            <p class="text-xs text-gray-500 mt-2">
              {{ metricas.totalSolicitudes > 0 ? Math.round((metricas.solicitudesResueltas / metricas.totalSolicitudes) * 100) : 0 }}% del total
            </p>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6">
            <p class="text-sm text-gray-600 mb-1">Rechazadas</p>
            <p class="text-3xl font-bold text-red-600">{{ metricas.solicitudesRechazadas }}</p>
            <p class="text-xs text-gray-500 mt-2">
              {{ metricas.totalSolicitudes > 0 ? Math.round((metricas.solicitudesRechazadas / metricas.totalSolicitudes) * 100) : 0 }}% del total
            </p>
          </div>
        </div>
      </template>

      <div v-else class="bg-white rounded-lg shadow-sm p-12 text-center">
        <p class="text-gray-500">No hay métricas disponibles</p>
      </div>

      <!-- Resumen Visual Adicional -->
      <template v-if="metricas">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Estado de Solicitudes -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Distribución por Estado</h3>
            <div class="space-y-4">
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-gray-600">En Proceso</span>
                  <span class="font-medium text-blue-600">{{ metricas.solicitudesEnProceso }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    :style="{ width: metricas.totalSolicitudes > 0 ? `${(metricas.solicitudesEnProceso / metricas.totalSolicitudes) * 100}%` : '0%' }"
                  ></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-gray-600">Resueltas</span>
                  <span class="font-medium text-green-600">{{ metricas.solicitudesResueltas }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-green-500 h-2 rounded-full transition-all duration-300"
                    :style="{ width: metricas.totalSolicitudes > 0 ? `${(metricas.solicitudesResueltas / metricas.totalSolicitudes) * 100}%` : '0%' }"
                  ></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-gray-600">Rechazadas</span>
                  <span class="font-medium text-red-600">{{ metricas.solicitudesRechazadas }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-red-500 h-2 rounded-full transition-all duration-300"
                    :style="{ width: metricas.totalSolicitudes > 0 ? `${(metricas.solicitudesRechazadas / metricas.totalSolicitudes) * 100}%` : '0%' }"
                  ></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-gray-600">Pendientes</span>
                  <span class="font-medium text-gray-600">{{ metricas.totalSolicitudes - metricas.solicitudesEnProceso - metricas.solicitudesResueltas - metricas.solicitudesRechazadas }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-gray-400 h-2 rounded-full transition-all duration-300"
                    :style="{ width: metricas.totalSolicitudes > 0 ? `${((metricas.totalSolicitudes - metricas.solicitudesEnProceso - metricas.solicitudesResueltas - metricas.solicitudesRechazadas) / metricas.totalSolicitudes) * 100}%` : '0%' }"
                  ></div>
                </div>
                <p class="text-xs text-gray-500 mt-2 italic">
                  Incluye solicitudes en estados: Nuevas (sin asignar o recién creadas), Cerradas y Canceladas. 
                  La mayoría son solicitudes en estado "Nueva" que aún no han sido asignadas o procesadas.
                </p>
              </div>
            </div>
          </div>

          <!-- Indicadores Visuales -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Indicadores Clave</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Tasa de Resolución</p>
                    <p class="text-2xl font-bold text-gray-900">
                      {{ metricas.totalSolicitudes > 0 ? Math.round((metricas.solicitudesResueltas / metricas.totalSolicitudes) * 100) : 0 }}%
                    </p>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">En Progreso</p>
                    <p class="text-2xl font-bold text-gray-900">
                      {{ metricas.totalSolicitudes > 0 ? Math.round((metricas.solicitudesEnProceso / metricas.totalSolicitudes) * 100) : 0 }}%
                    </p>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-100">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Total Procesadas</p>
                    <p class="text-2xl font-bold text-gray-900">
                      {{ metricas.solicitudesResueltas + metricas.solicitudesRechazadas }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Modal: Nuevo Usuario -->
    <div v-if="showNewUserModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="showNewUserModal = false; resetNewUserForm()">
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
          <!-- Feedback Message dentro del modal -->
          <div
            v-if="feedback"
            :class="[
              'rounded-lg p-4',
              feedback.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            ]"
          >
            <p :class="feedback.type === 'success' ? 'text-green-800' : 'text-red-800'">
              {{ feedback.message }}
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nombre de Usuario</label>
              <input 
                type="text" 
                v-model="newUser.nombreUsuario"
                placeholder="jperez"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
              <input 
                type="text" 
                v-model="newUser.nombre"
                placeholder="Juan Pérez"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
              />
            </div>
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

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Rol</label>
              <select 
                v-model.number="newUser.rol"
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
                v-model="newUser.areaId"
                :disabled="!nuevoUsuarioPuedeAsignarArea"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72] disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option :value="0">Sin área</option>
                <option v-for="area in areas" :key="area.id" :value="area.id">
                  {{ area.nombre }}
                </option>
              </select>
              <p v-if="!nuevoUsuarioPuedeAsignarArea" class="text-xs text-gray-500 mt-1">
                Solo los Agentes de Área pueden tener un área asignada
              </p>
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
                v-model="newUser.activo"
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
            :disabled="loading"
            class="px-4 py-2 bg-[#0f3a72] text-white rounded-md hover:bg-[#0d3260] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Creando...</span>
            <span v-else>Crear Usuario</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Editar Usuario -->
    <div v-if="showEditUserModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="cerrarModalEdicion">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div class="flex justify-between items-center p-6 border-b">
          <h3 class="text-xl font-semibold text-gray-900">Editar Usuario</h3>
          <button 
            @click="cerrarModalEdicion"
            class="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div class="p-6 space-y-4">
          <!-- Feedback Message dentro del modal -->
          <div
            v-if="feedback"
            :class="[
              'rounded-lg p-4',
              feedback.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            ]"
          >
            <p :class="feedback.type === 'success' ? 'text-green-800' : 'text-red-800'">
              {{ feedback.message }}
            </p>
          </div>

          <div v-if="editingUser" class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nombre de Usuario</label>
              <input 
                type="text" 
                v-model="editingUser.nombreUsuario"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
              />
              <p class="text-xs text-gray-500 mt-1">
                Usa este nombre de usuario para iniciar sesión
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
              <input 
                type="text" 
                v-model="editingUser.nombre"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
              />
            </div>
          </div>

          <div v-if="editingUser">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input 
                type="email" 
                v-model="editingUser.email"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
              />
            </div>
          </div>

          <div v-if="editingUser" class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Rol</label>
              <select 
                v-model.number="editingUser.rolId"
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
                v-model="editingUser.areaId"
                :disabled="!editandoUsuarioPuedeAsignarArea"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72] disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option :value="0">Sin área</option>
                <option v-for="area in areas" :key="area.id" :value="area.id">
                  {{ area.nombre }}
                </option>
              </select>
              <p v-if="!editandoUsuarioPuedeAsignarArea" class="text-xs text-gray-500 mt-1">
                Solo los Agentes de Área pueden tener un área asignada
              </p>
            </div>
          </div>

          <div v-if="editingUser">
            <label class="block text-sm font-medium text-gray-700 mb-2">Nueva Contraseña (opcional)</label>
            <input 
              type="password" 
              v-model="editingUser.password"
              placeholder="Dejar vacío para mantener la actual"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
            />
            <p class="text-xs text-gray-500 mt-1">
              Solo ingresar si deseas cambiar la contraseña (mínimo 8 caracteres)
            </p>
          </div>

          <div v-if="editingUser">
            <label class="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                v-model="editingUser.activo"
                class="w-4 h-4 text-[#0f3a72] focus:ring-[#0f3a72] rounded" 
              />
              <span class="text-sm text-gray-700">Usuario activo</span>
            </label>
          </div>
        </div>

        <div class="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button 
            @click="cerrarModalEdicion"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button 
            @click="actualizarUsuario"
            :disabled="loading"
            class="px-4 py-2 bg-[#0f3a72] text-white rounded-md hover:bg-[#0d3260] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Guardando...</span>
            <span v-else>Guardar Cambios</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Nuevo Área -->
    <div v-if="showNewAreaModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="showNewAreaModal = false; resetNewAreaForm()">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div class="flex justify-between items-center p-6 border-b">
          <h3 class="text-xl font-semibold text-gray-900">Crear Nueva Área</h3>
          <button 
            @click="showNewAreaModal = false"
            class="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div class="p-6 space-y-4">
          <!-- Feedback Message dentro del modal -->
          <div
            v-if="feedback"
            :class="[
              'rounded-lg p-4',
              feedback.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            ]"
          >
            <p :class="feedback.type === 'success' ? 'text-green-800' : 'text-red-800'">
              {{ feedback.message }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nombre del Área *</label>
            <input 
              type="text" 
              v-model="newArea.nombre"
              placeholder="Ej: Recursos Humanos"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
            <textarea 
              v-model="newArea.descripcion"
              rows="3"
              placeholder="Descripción del área y sus responsabilidades"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
            ></textarea>
          </div>

          <div>
            <label class="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                v-model="newArea.activo"
                class="w-4 h-4 text-[#0f3a72] focus:ring-[#0f3a72] rounded" 
              />
              <span class="text-sm text-gray-700">Área activa</span>
            </label>
          </div>
        </div>

        <div class="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button 
            @click="showNewAreaModal = false"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button 
            @click="crearArea"
            :disabled="loading"
            class="px-4 py-2 bg-[#0f3a72] text-white rounded-md hover:bg-[#0d3260] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Creando...</span>
            <span v-else>Crear Área</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Editar Área -->
    <div v-if="showEditAreaModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="cerrarModalEdicionArea">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div class="flex justify-between items-center p-6 border-b">
          <h3 class="text-xl font-semibold text-gray-900">Editar Área</h3>
          <button 
            @click="cerrarModalEdicionArea"
            class="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div class="p-6 space-y-4">
          <!-- Feedback Message dentro del modal -->
          <div
            v-if="feedback"
            :class="[
              'rounded-lg p-4',
              feedback.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            ]"
          >
            <p :class="feedback.type === 'success' ? 'text-green-800' : 'text-red-800'">
              {{ feedback.message }}
            </p>
          </div>

          <div v-if="editingArea">
            <label class="block text-sm font-medium text-gray-700 mb-2">Nombre del Área *</label>
            <input 
              type="text" 
              v-model="editingArea.nombre"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
            />
          </div>

          <div v-if="editingArea">
            <label class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
            <textarea 
              v-model="editingArea.descripcion"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
            ></textarea>
          </div>

          <div v-if="editingArea">
            <label class="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                v-model="editingArea.activo"
                class="w-4 h-4 text-[#0f3a72] focus:ring-[#0f3a72] rounded" 
              />
              <span class="text-sm text-gray-700">Área activa</span>
            </label>
          </div>
        </div>

        <div class="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button 
            @click="cerrarModalEdicionArea"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button 
            @click="actualizarArea"
            :disabled="loading"
            class="px-4 py-2 bg-[#0f3a72] text-white rounded-md hover:bg-[#0d3260] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Guardando...</span>
            <span v-else>Guardar Cambios</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Nueva Categoría -->
    <div v-if="showNewCategoryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="cerrarModalNuevaCategoria">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div class="flex justify-between items-center p-6 border-b">
          <h3 class="text-xl font-semibold text-gray-900">Agregar Nueva Tipo de Solicitud</h3>
          <button 
            @click="cerrarModalNuevaCategoria"
            class="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div class="p-6 space-y-4">
          <!-- Feedback Message dentro del modal -->
          <div
            v-if="feedback"
            :class="[
              'rounded-lg p-4',
              feedback.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            ]"
          >
            <p :class="feedback.type === 'success' ? 'text-green-800' : 'text-red-800'">
              {{ feedback.message }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
            <input 
              type="text" 
              v-model="newCategory.nombre"
              placeholder="Ingresa el nombre"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
            <textarea 
              v-model="newCategory.descripcion"
              placeholder="Descripción de la categoría (opcional)"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Área Relacionada</label>
            <select 
              v-model="newCategory.areaId"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
            >
              <option :value="0">Selecciona un área</option>
              <option v-for="area in areas" :key="area.id" :value="area.id">
                {{ area.nombre }}
              </option>
            </select>
          </div>
        </div>

        <div class="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button 
            @click="cerrarModalNuevaCategoria"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button 
            @click="crearCategoria"
            :disabled="loading || !newCategory.nombre"
            class="px-4 py-2 bg-[#0f3a72] text-white rounded-md hover:bg-[#0d3260] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Creando...</span>
            <span v-else>Crear</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Editar Categoría -->
    <div v-if="showEditCategoryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="cerrarModalEdicionCategoria">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div class="flex justify-between items-center p-6 border-b">
          <h3 class="text-xl font-semibold text-gray-900">Editar Tipo de Solicitud</h3>
          <button 
            @click="cerrarModalEdicionCategoria"
            class="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div class="p-6 space-y-4">
          <!-- Feedback Message dentro del modal -->
          <div
            v-if="feedback"
            :class="[
              'rounded-lg p-4',
              feedback.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            ]"
          >
            <p :class="feedback.type === 'success' ? 'text-green-800' : 'text-red-800'">
              {{ feedback.message }}
            </p>
          </div>

          <div v-if="editingCategory">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
              <input 
                type="text" 
                v-model="editingCategory.nombre"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <textarea 
                v-model="editingCategory.descripcion"
                placeholder="Descripción de la categoría (opcional)"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Área Relacionada</label>
              <select 
                v-model="editingCategory.areaId"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
              >
                <option :value="null">Sin área</option>
                <option v-for="area in areas" :key="area.id" :value="area.id">
                  {{ area.nombre }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button 
            @click="cerrarModalEdicionCategoria"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button 
            @click="actualizarCategoria"
            :disabled="loading"
            class="px-4 py-2 bg-[#0f3a72] text-white rounded-md hover:bg-[#0d3260] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Guardando...</span>
            <span v-else>Guardar Cambios</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Asignar Agente -->
    <div v-if="showAsignarAgenteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="cerrarModalAsignarAgente">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div class="flex justify-between items-center p-6 border-b">
          <h3 class="text-xl font-semibold text-gray-900">Asignar Agente</h3>
          <button 
            @click="cerrarModalAsignarAgente"
            class="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div class="p-6 space-y-4">
          <!-- Feedback Message dentro del modal -->
          <div
            v-if="feedback"
            :class="[
              'rounded-lg p-4',
              feedback.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            ]"
          >
            <p :class="feedback.type === 'success' ? 'text-green-800' : 'text-red-800'">
              {{ feedback.message }}
            </p>
          </div>

          <div v-if="solicitudParaAsignar">
            <div class="bg-gray-50 p-4 rounded-lg mb-4">
              <p class="text-sm font-medium text-gray-900">{{ solicitudParaAsignar.asunto }}</p>
              <p class="text-xs text-gray-500 mt-1">Solicitante: {{ solicitudParaAsignar.solicitante }}</p>
              <p class="text-xs text-gray-500">Fecha: {{ new Date(solicitudParaAsignar.fechaCreacion).toLocaleDateString() }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Seleccionar Agente *</label>
              <select 
                v-model="gestorSeleccionado"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
              >
                <option :value="null">Seleccione un agente...</option>
                <option v-for="agente in agentesDisponibles" :key="agente.id" :value="agente.id">
                  {{ agente.nombre }} - {{ agente.areaNombre || 'Sin área' }}
                </option>
              </select>
              <p class="text-xs text-gray-500 mt-1">
                Puede asignar esta solicitud a cualquier agente de cualquier área
              </p>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button 
            @click="cerrarModalAsignarAgente"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button 
            @click="asignarSolicitud"
            :disabled="loading || !gestorSeleccionado"
            class="px-4 py-2 bg-[#0f3a72] text-white rounded-md hover:bg-[#0d3260] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Asignando...</span>
            <span v-else>Asignar</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { ROLES, hasMinRole } from '../../constants/roles'
import adminService, { type Usuario, type Area, type TipoSolicitud, type CrearUsuarioDto, type MetricasGenerales } from '../../services/adminService'

const router = useRouter()
const authStore = useAuthStore()
// Usar el getter del store para el rol
const userRole = computed(() => authStore.userRole)

const activeTab = ref(userRole.value === ROLES.SUPER_ADMIN ? 'users' : 'areas')

const tabs = computed(() => {
  const allTabs = [
    { id: 'users', label: 'Usuarios', minRole: ROLES.SUPER_ADMIN },
    { id: 'unassigned', label: 'Sin Asignar', minRole: ROLES.ADMIN },
    { id: 'tipo-otro', label: 'Tipo Otro', minRole: ROLES.ADMIN },
    { id: 'areas', label: 'Áreas', minRole: ROLES.ADMIN },
    { id: 'categories', label: 'Categorías', minRole: ROLES.ADMIN },
    { id: 'reports', label: 'Reportes', minRole: ROLES.ADMIN }
  ]
  return allTabs.filter(tab => hasMinRole(userRole.value, tab.minRole))
})

// Estados para datos del backend
const users = ref<Usuario[]>([])
const areas = ref<Area[]>([])
const categories = ref<TipoSolicitud[]>([])
const metricas = ref<MetricasGenerales | null>(null)
const solicitudesSinAsignar = ref<any[]>([])
const solicitudesTipoOtro = ref<any[]>([])

// Estados para filtros
const filtroSinAsignar = ref({
  prioridad: '' as '' | '1' | '2' | '3',
  ordenFecha: '' as '' | 'asc' | 'desc'
})

const filtroTipoOtro = ref({
  prioridad: '' as '' | '1' | '2' | '3',
  ordenFecha: '' as '' | 'asc' | 'desc'
})

// Estado para búsqueda de usuarios
const busquedaUsuarios = ref('')

// Estado para filtro de usuarios por estado
const filtroEstadoUsuarios = ref<'todos' | 'activos' | 'inactivos'>('todos')

// Estados de carga y errores
const loading = ref(false)
const error = ref<string | null>(null)
const feedback = ref<{ type: 'success' | 'error', message: string } | null>(null)
const exportandoExcel = ref(false)

// Modales
const showNewUserModal = ref(false)
const showEditUserModal = ref(false)
const showNewAreaModal = ref(false)
const showEditAreaModal = ref(false)
const showNewCategoryModal = ref(false)
const showEditCategoryModal = ref(false)
const showAsignarAgenteModal = ref(false)

// Formularios
const newUser = ref<CrearUsuarioDto>({
  nombreUsuario: '',
  nombre: '',
  email: '',
  password: '',
  rol: 1,
  areaId: 0,  // 0 = Sin área
  activo: false,  // Por defecto inactivo hasta que se marque explícitamente
  codigoEmpleado: ''
})

// Formulario para nueva área
const newArea = ref({
  nombre: '',
  descripcion: '',
  activo: true
})

// Formulario para nueva categoría
const newCategory = ref({
  nombre: '',
  descripcion: '',
  areaId: 0,  // 0 = Sin área
  activo: true
})

const editingUser = ref<Usuario | null>(null)
const editingArea = ref<Area | null>(null)
const editingCategory = ref<TipoSolicitud | null>(null)

// Variables para asignar agente
const solicitudParaAsignar = ref<any | null>(null)
const gestorSeleccionado = ref<number | null>(null)
const agentesDisponibles = ref<Usuario[]>([])

// Computed: Solo Agente de Área (rol 4) puede tener área
const nuevoUsuarioPuedeAsignarArea = computed(() => newUser.value.rol === 4)
const editandoUsuarioPuedeAsignarArea = computed(() => editingUser.value?.rolId === 4)

// Watch: Resetear área cuando cambia el rol y NO es Agente de Área
watch(() => newUser.value.rol, (nuevoRol) => {
  if (nuevoRol !== 4) {
    newUser.value.areaId = 0  // Sin área
  }
})

watch(() => editingUser.value?.rolId, (nuevoRol) => {
  if (editingUser.value && nuevoRol !== 4) {
    editingUser.value.areaId = 0  // Sin área
  }
})

// ==================== FUNCIONES DE CARGA ====================

const cargarUsuarios = async () => {
  if (userRole.value !== ROLES.SUPER_ADMIN) return
  
  loading.value = true
  error.value = null
  
  try {
    users.value = await adminService.obtenerUsuarios()
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || 'Error al cargar usuarios'
    console.error('[Administration] Error cargando usuarios:', err)
  } finally {
    loading.value = false
  }
}

const cargarAreas = async () => {
  loading.value = true
  error.value = null
  
  try {
    areas.value = await adminService.obtenerAreas()
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || 'Error al cargar áreas'
    console.error('[Administration] Error cargando áreas:', err)
  } finally {
    loading.value = false
  }
}

const cargarCategorias = async () => {
  loading.value = true
  error.value = null
  
  try {
    categories.value = await adminService.obtenerTiposSolicitud()
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || 'Error al cargar categorías'
    console.error('[Administration] Error cargando categorías:', err)
  } finally {
    loading.value = false
  }
}

const cargarMetricas = async () => {
  loading.value = true
  error.value = null
  
  try {
    metricas.value = await adminService.obtenerMetricasGenerales()
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || 'Error al cargar métricas'
    console.error('[Administration] Error cargando métricas:', err)
  } finally {
    loading.value = false
  }
}

// Computed para filtrar usuarios por búsqueda
const usuariosFiltrados = computed(() => {
  let resultado = users.value
  
  // Filtrar por estado
  if (filtroEstadoUsuarios.value === 'activos') {
    resultado = resultado.filter(user => user.activo)
  } else if (filtroEstadoUsuarios.value === 'inactivos') {
    resultado = resultado.filter(user => !user.activo)
  }
  
  // Filtrar por búsqueda
  if (busquedaUsuarios.value.trim()) {
    const termino = busquedaUsuarios.value.toLowerCase().trim()
    
    resultado = resultado.filter(user => {
      // Buscar en nombre, email, nombreUsuario, rol y área
      const nombre = (user.nombre || '').toLowerCase()
      const email = (user.email || '').toLowerCase()
      const nombreUsuario = (user.nombreUsuario || '').toLowerCase()
      const rol = (user.rolNombre || getRoleLabel(user.rolId)).toLowerCase()
      const area = (user.areaNombre || '').toLowerCase()
      
      return nombre.includes(termino) || 
             email.includes(termino) || 
             nombreUsuario.includes(termino) ||
             rol.includes(termino) ||
             area.includes(termino)
    })
  }
  
  return resultado
})

// Computed para filtrar y ordenar solicitudes sin asignar
const solicitudesSinAsignarFiltradas = computed(() => {
  let resultado = [...solicitudesSinAsignar.value]
  
  // Filtrar por prioridad
  if (filtroSinAsignar.value.prioridad) {
    const prioridadSeleccionada = Number(filtroSinAsignar.value.prioridad)
    resultado = resultado.filter(s => {
      // El backend puede enviar la prioridad como número o como string
      let prioridadSolicitud = s.prioridad
      
      // Si viene como string, convertir a número
      if (typeof prioridadSolicitud === 'string') {
        const mapeo: Record<string, number> = {
          'Baja': 1,
          'Media': 2,
          'Alta': 3
        }
        prioridadSolicitud = mapeo[prioridadSolicitud] || 0
      }
      
      return prioridadSolicitud === prioridadSeleccionada
    })
  }
  
  // Ordenar por fecha
  if (filtroSinAsignar.value.ordenFecha) {
    resultado.sort((a, b) => {
      const fechaA = new Date(a.fechaCreacion).getTime()
      const fechaB = new Date(b.fechaCreacion).getTime()
      return filtroSinAsignar.value.ordenFecha === 'asc' ? fechaA - fechaB : fechaB - fechaA
    })
  }
  
  return resultado
})

// Computed para filtrar y ordenar solicitudes tipo otro
const solicitudesTipoOtroFiltradas = computed(() => {
  let resultado = [...solicitudesTipoOtro.value]
  
  // Filtrar por prioridad
  if (filtroTipoOtro.value.prioridad) {
    const prioridadSeleccionada = Number(filtroTipoOtro.value.prioridad)
    resultado = resultado.filter(s => {
      // El backend puede enviar la prioridad como número o como string
      let prioridadSolicitud = s.prioridad
      
      // Si viene como string, convertir a número
      if (typeof prioridadSolicitud === 'string') {
        const mapeo: Record<string, number> = {
          'Baja': 1,
          'Media': 2,
          'Alta': 3
        }
        prioridadSolicitud = mapeo[prioridadSolicitud] || 0
      }
      
      return prioridadSolicitud === prioridadSeleccionada
    })
  }
  
  // Ordenar por fecha
  if (filtroTipoOtro.value.ordenFecha) {
    resultado.sort((a, b) => {
      const fechaA = new Date(a.fechaCreacion).getTime()
      const fechaB = new Date(b.fechaCreacion).getTime()
      return filtroTipoOtro.value.ordenFecha === 'asc' ? fechaA - fechaB : fechaB - fechaA
    })
  }
  
  return resultado
})

const cargarSolicitudesSinAsignar = async () => {
  loading.value = true
  error.value = null
  
  try {
    console.log('[Administration] 🔍 Cargando solicitudes sin asignar...')
    solicitudesSinAsignar.value = await adminService.obtenerTodasSolicitudesSinAsignar()
    console.log('[Administration] ✅ Solicitudes sin asignar cargadas:', solicitudesSinAsignar.value.length)
    console.log('[Administration] 📋 Solicitudes:', solicitudesSinAsignar.value)
    
    // Debug: mostrar estados de las solicitudes
    if (solicitudesSinAsignar.value.length > 0) {
      solicitudesSinAsignar.value.forEach(s => {
        console.log(`[Administration] 🔹 ID: ${s.id} | Estado: ${s.estado} | Gestor: ${s.gestorAsignadoId || 'null'} | Número: ${s.numeroSolicitud}`)
      })
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || 'Error al cargar solicitudes sin asignar'
    console.error('[Administration] ❌ Error cargando solicitudes sin asignar:', err)
  } finally {
    loading.value = false
  }
}

const cargarSolicitudesTipoOtro = async () => {
  loading.value = true
  error.value = null
  
  try {
    console.log('[Administration] 🔍 Cargando solicitudes tipo Otro...')
    solicitudesTipoOtro.value = await adminService.obtenerSolicitudesTipoOtro()
    console.log('[Administration] ✅ Solicitudes tipo Otro cargadas:', solicitudesTipoOtro.value.length)
    console.log('[Administration] 📋 Solicitudes:', solicitudesTipoOtro.value)
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || 'Error al cargar solicitudes tipo Otro'
    console.error('[Administration] ❌ Error cargando solicitudes tipo Otro:', err)
    console.error('[Administration] ❌ Error completo:', err.response)
  } finally {
    loading.value = false
  }
}

const cargarAgentesDisponibles = async () => {
  try {
    console.log('[Administration] 🔍 Cargando agentes disponibles...')
    
    // Obtener áreas primero
    const todasAreas = await adminService.obtenerAreas()
    
    // Intentar obtener agentes usando el endpoint específico (Admin y SuperAdmin)
    try {
      const todosAgentes = await adminService.obtenerAgentes()
      
      // Filtrar solo agentes activos cuya área también esté activa
      agentesDisponibles.value = todosAgentes.filter(u => {
        if (u.rolId !== 4 || !u.activo) return false
        
        // Si el agente no tiene área asignada, no está disponible
        if (!u.areaId) return false
        
        // Verificar que el área del agente esté activa
        const area = todasAreas.find(a => a.id === u.areaId)
        return area && area.activo
      })
      
      console.log('[Administration] ✅ Agentes disponibles (usando endpoint /admin/agentes):', agentesDisponibles.value.length)
    } catch (err: any) {
      // Si el endpoint /admin/agentes no existe o falla, intentar con /admin/usuarios (solo SuperAdmin)
      console.warn('[Administration] ⚠️ Endpoint /admin/agentes no disponible, intentando fallback con /admin/usuarios')
      
      const todosUsuarios = await adminService.obtenerUsuarios()
      
      // Filtrar solo agentes activos (rol 4) cuya área también esté activa
      agentesDisponibles.value = todosUsuarios.filter(u => {
        if (u.rolId !== 4 || !u.activo) return false
        
        // Si el agente no tiene área asignada, no está disponible
        if (!u.areaId) return false
        
        // Verificar que el área del agente esté activa
        const area = todasAreas.find(a => a.id === u.areaId)
        return area && area.activo
      })
      
      console.log('[Administration] ✅ Agentes disponibles (usando fallback /admin/usuarios):', agentesDisponibles.value.length)
    }
  } catch (err: any) {
    console.error('[Administration] ❌ Error cargando agentes:', err)
    mostrarFeedback('error', 'No tienes permisos para ver los agentes disponibles')
  }
}

// ==================== USUARIOS ====================

const createUser = async () => {
  console.log('[Administration] 🔵 createUser llamado')
  console.log('[Administration] 📝 Datos del formulario:', newUser.value)
  
  // Validación básica
  if (!newUser.value.nombreUsuario || !newUser.value.nombre || !newUser.value.email || !newUser.value.password) {
    console.warn('[Administration] ⚠️ Validación fallida: campos vacíos')
    mostrarFeedback('error', 'Por favor complete todos los campos obligatorios: Nombre de Usuario, Nombre Completo, Email y Contraseña')
    return
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(newUser.value.email)) {
    console.warn('[Administration] ⚠️ Validación fallida: email inválido')
    mostrarFeedback('error', 'Por favor ingrese un email válido (ejemplo: usuario@dominio.com)')
    return
  }

  if (newUser.value.password.length < 8) {
    console.warn('[Administration] ⚠️ Validación fallida: contraseña corta')
    mostrarFeedback('error', 'La contraseña debe tener al menos 8 caracteres')
    return
  }

  console.log('[Administration] ✅ Validaciones pasadas, enviando al backend...')
  loading.value = true
  try {
    // Preparar datos: si areaId es 0 o "0", omitirlo (sin área)
    const userData: any = {
      nombreUsuario: newUser.value.nombreUsuario,
      nombre: newUser.value.nombre,
      email: newUser.value.email,
      password: newUser.value.password,
      rol: newUser.value.rol,
      activo: newUser.value.activo,  // Incluir estado activo explícitamente
      codigoEmpleado: newUser.value.codigoEmpleado
    }
    
    // Solo incluir areaId si es > 0
    const areaId = Number(newUser.value.areaId)
    if (areaId > 0) {
      userData.areaId = areaId
    }
    
    console.log('[Administration] 📤 Datos a enviar:', userData)
    const result = await adminService.crearUsuario(userData)
    console.log('[Administration] ✅ Usuario creado:', result)
    mostrarFeedback('success', 'Usuario creado exitosamente')
    showNewUserModal.value = false
    resetNewUserForm()
    await cargarUsuarios()
  } catch (err: any) {
    console.error('[Administration] ❌ Error creando usuario:', err)
    console.error('[Administration] 📋 Respuesta del servidor:', err.response?.data)
    
    // Extraer mensaje de error del backend
    let errorMsg = 'Error al crear usuario'
    
    if (err.response?.data) {
      const data = err.response.data
      
      // Formato 1: BusinessException/NotFoundException -> { mensaje: "..." }
      if (data.mensaje) {
        errorMsg = data.mensaje
      }
      // Formato 2: ModelState ValidationProblem -> { errors: { campo: ["error1", "error2"] } }
      else if (data.errors && typeof data.errors === 'object') {
        const errorsArray: string[] = []
        Object.entries(data.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            // Traducir nombres de campos
            const fieldName = field === 'NombreUsuario' ? 'Nombre de Usuario' :
                             field === 'Nombre' ? 'Nombre Completo' :
                             field === 'Email' ? 'Email' :
                             field === 'Password' ? 'Contraseña' : field
            messages.forEach(msg => errorsArray.push(`${fieldName}: ${msg}`))
          }
        })
        errorMsg = errorsArray.join('. ')
      }
      // Formato 3: String directo
      else if (typeof data === 'string') {
        errorMsg = data
      }
    }
    
    console.error('[Administration] 📋 Mensaje de error extraído:', errorMsg)
    mostrarFeedback('error', errorMsg)
  } finally {
    loading.value = false
  }
}

const abrirModalEdicion = (usuario: Usuario) => {
  console.log('[Administration] 📝 Abriendo modal de edición para:', usuario)
  editingUser.value = { ...usuario } // Clonar para no modificar el original
  showEditUserModal.value = true
  feedback.value = null
}

const cerrarModalEdicion = () => {
  showEditUserModal.value = false
  editingUser.value = null
  feedback.value = null
}

const actualizarUsuario = async () => {
  if (!editingUser.value) return

  console.log('[Administration] 🔄 Actualizando usuario:', editingUser.value.id)
  
  // 🔒 Validación de seguridad: No permitir que un usuario se desactive a sí mismo
  if (editingUser.value.activo === false && editingUser.value.id === authStore.user?.id) {
    mostrarFeedback('error', 'No puedes desactivar tu propia cuenta mientras la estás usando. Pide a otro administrador que lo haga.')
    return
  }
  
  // Validación básica
  if (!editingUser.value.nombre || !editingUser.value.email) {
    mostrarFeedback('error', 'Por favor complete todos los campos obligatorios')
    return
  }

  // Validar contraseña si se ingresó una nueva
  if (editingUser.value.password && editingUser.value.password.trim() !== '') {
    if (editingUser.value.password.length < 8) {
      mostrarFeedback('error', 'La contraseña debe tener al menos 8 caracteres')
      return
    }
  }

  loading.value = true
  try {
    // Convertir areaId: si es 0 o null, enviar 0 al backend para eliminar área
    const areaId = editingUser.value.areaId === 0 || editingUser.value.areaId === null 
      ? 0 
      : Number(editingUser.value.areaId)
    
    const updateData: any = {
      nombreUsuario: editingUser.value.nombreUsuario,
      nombre: editingUser.value.nombre,
      email: editingUser.value.email,
      rol: editingUser.value.rolId,  // Backend espera 'rol', leemos de 'rolId'
      areaId: areaId,
      activo: editingUser.value.activo
    }
    
    // Solo incluir password si se ingresó una nueva
    if (editingUser.value.password && editingUser.value.password.trim() !== '') {
      updateData.password = editingUser.value.password
    }
    
    console.log('[Administration] 📤 Enviando actualización:', updateData)
    const userId = editingUser.value.id  // Guardar ID antes de cerrar modal
    await adminService.actualizarUsuario(userId, updateData)
    mostrarFeedback('success', 'Usuario actualizado exitosamente')
    showEditUserModal.value = false
    editingUser.value = null
    console.log('[Administration] 🔄 Recargando usuarios después de actualizar...')
    await cargarUsuarios()
    console.log('[Administration] ✅ Usuarios recargados. Total:', users.value.length)
    const usuarioActualizado = users.value.find(u => u.id === userId)
    console.log('[Administration] 👤 Usuario actualizado encontrado:', JSON.stringify(usuarioActualizado, null, 2))
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || err.message || 'Error al actualizar usuario'
    mostrarFeedback('error', errorMsg)
    console.error('[Administration] ❌ Error actualizando usuario:', err)
  } finally {
    loading.value = false
  }
}

const eliminarUsuario = async (id: number, nombre: string, force: boolean = false) => {
  // Primera confirmación básica
  if (!force && !confirm(`¿Estás seguro de que deseas eliminar al usuario "${nombre}"? Esta acción no se puede deshacer.`)) {
    return
  }

  loading.value = true
  try {
    await adminService.eliminarUsuario(id, force)
    mostrarFeedback('success', 'Usuario eliminado exitosamente')
    await cargarUsuarios()
  } catch (err: any) {
    // Capturar mensaje del backend
    const errorMsg = err.response?.data?.mensaje || err.response?.data?.message || err.message || 'Error al eliminar usuario'
    
    // Si el error es por solicitudes asignadas y no es forzado, mostrar confirmación especial
    if (!force && err.response?.status === 400 && errorMsg.includes('solicitudes asignadas')) {
      const confirmarForzar = confirm(
        `⚠️ ADVERTENCIA: El usuario "${nombre}" tiene solicitudes asignadas.\n\n` +
        `Si eliminas este usuario:\n` +
        `• Sus solicitudes quedarán sin gestor asignado\n` +
        `• Sus comentarios serán eliminados\n` +
        `• Su historial será eliminado\n\n` +
        `¿Estás seguro de que deseas continuar con la eliminación?`
      )
      
      if (confirmarForzar) {
        // Reintentar con force=true
        await eliminarUsuario(id, nombre, true)
      }
    } else {
      mostrarFeedback('error', errorMsg)
      console.error('[Administration] Error eliminando usuario:', err)
    }
  } finally {
    loading.value = false
  }
}

const toggleUsuarioEstado = async (usuario: Usuario) => {
  const nuevoEstado = !usuario.activo
  const accion = nuevoEstado ? 'activar' : 'desactivar'
  
  console.log('[Administration] 🔄 Cambiando estado:', {
    usuarioId: usuario.id,
    estadoActual: usuario.activo,
    nuevoEstado: nuevoEstado
  })
  
  if (!confirm(`¿Estás seguro de que deseas ${accion} al usuario "${usuario.nombre}"?`)) {
    return
  }

  loading.value = true
  try {
    const resultado = await adminService.cambiarEstadoUsuario(usuario.id, nuevoEstado)
    console.log('[Administration] ✅ Respuesta del backend:', resultado)
    mostrarFeedback('success', `Usuario ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`)
    await cargarUsuarios()
    
    // Verificar si se actualizó correctamente
    const usuarioActualizado = users.value.find(u => u.id === usuario.id)
    console.log('[Administration] 📋 Usuario después de recargar (JSON):', JSON.stringify(usuarioActualizado, null, 2))
    console.log('[Administration] 📋 Campo activo:', usuarioActualizado?.activo)
  } catch (err: any) {
    const errorMsg = err.response?.data?.mensaje || err.response?.data?.message || err.message || `Error al ${accion} usuario`
    mostrarFeedback('error', errorMsg)
    console.error('[Administration] Error cambiando estado:', err)
  } finally {
    loading.value = false
  }
}

// ==================== ÁREAS ====================

const crearArea = async () => {
  console.log('[Administration] 🔵 crearArea llamado')
  
  // Validación
  if (!newArea.value.nombre || !newArea.value.nombre.trim()) {
    mostrarFeedback('error', 'Por favor ingrese el nombre del área')
    return
  }

  loading.value = true
  try {
    console.log('[Administration] 📤 Creando área:', newArea.value)
    await adminService.crearArea(newArea.value)
    mostrarFeedback('success', 'Área creada exitosamente')
    showNewAreaModal.value = false
    resetNewAreaForm()
    await cargarAreas()
  } catch (err: any) {
    const errorMsg = err.response?.data?.mensaje || err.response?.data?.message || err.message || 'Error al crear área'
    mostrarFeedback('error', errorMsg)
    console.error('[Administration] ❌ Error creando área:', err)
  } finally {
    loading.value = false
  }
}

const abrirModalEdicionArea = (area: Area) => {
  console.log('[Administration] 📝 Abriendo modal de edición de área:', area)
  editingArea.value = { ...area }
  showEditAreaModal.value = true
  feedback.value = null
}

const cerrarModalEdicionArea = () => {
  showEditAreaModal.value = false
  editingArea.value = null
  feedback.value = null
}

const actualizarArea = async () => {
  if (!editingArea.value) return

  console.log('[Administration] 🔄 Actualizando área:', editingArea.value.id)
  
  // Validación
  if (!editingArea.value.nombre || !editingArea.value.nombre.trim()) {
    mostrarFeedback('error', 'Por favor ingrese el nombre del área')
    return
  }

  loading.value = true
  try {
    const updateData = {
      nombre: editingArea.value.nombre,
      descripcion: editingArea.value.descripcion || '',
      activo: editingArea.value.activo
    }
    
    console.log('[Administration] 📤 Actualizando área:', updateData)
    await adminService.actualizarArea(editingArea.value.id, updateData)
    mostrarFeedback('success', 'Área actualizada exitosamente')
    showEditAreaModal.value = false
    editingArea.value = null
    await cargarAreas()
  } catch (err: any) {
    const errorMsg = err.response?.data?.mensaje || err.response?.data?.message || err.message || 'Error al actualizar área'
    mostrarFeedback('error', errorMsg)
    console.error('[Administration] ❌ Error actualizando área:', err)
  } finally {
    loading.value = false
  }
}

const eliminarArea = async (id: number, nombre: string) => {
  if (!confirm(`¿Estás seguro de que deseas eliminar el área "${nombre}"? Esta acción no se puede deshacer.`)) {
    return
  }

  loading.value = true
  try {
    await adminService.eliminarArea(id)
    mostrarFeedback('success', 'Área eliminada exitosamente')
    await cargarAreas()
  } catch (err: any) {
    // Capturar mensaje del backend en español (campo 'mensaje') o inglés (campo 'message')
    const errorMsg = err.response?.data?.mensaje || err.response?.data?.message || err.message || 'Error al eliminar área'
    mostrarFeedback('error', errorMsg)
    console.error('[Administration] Error eliminando área:', err)
  } finally {
    loading.value = false
  }
}

const toggleAreaEstado = async (area: Area) => {
  const nuevoEstado = !area.activo
  const accion = nuevoEstado ? 'activar' : 'desactivar'
  
  if (!confirm(`¿Estás seguro de que deseas ${accion} el área "${area.nombre}"?`)) {
    return
  }

  loading.value = true
  try {
    await adminService.actualizarArea(area.id, { activo: nuevoEstado })
    mostrarFeedback('success', `Área ${nuevoEstado ? 'activada' : 'desactivada'} exitosamente`)
    await cargarAreas()
  } catch (err: any) {
    const errorMsg = err.response?.data?.mensaje || err.response?.data?.message || err.message || `Error al ${accion} área`
    mostrarFeedback('error', errorMsg)
    console.error(`[Administration] Error al ${accion} área:`, err)
  } finally {
    loading.value = false
  }
}

// ==================== SOLICITUDES SIN ASIGNAR ====================

const abrirModalAsignarAgente = async (solicitud: any) => {
  solicitudParaAsignar.value = solicitud
  gestorSeleccionado.value = null
  await cargarAgentesDisponibles()
  showAsignarAgenteModal.value = true
  feedback.value = null
}

const cerrarModalAsignarAgente = () => {
  showAsignarAgenteModal.value = false
  solicitudParaAsignar.value = null
  gestorSeleccionado.value = null
}

const asignarSolicitud = async () => {
  if (!solicitudParaAsignar.value || !gestorSeleccionado.value) {
    mostrarFeedback('error', 'Por favor seleccione un agente')
    return
  }

  loading.value = true
  try {
    await adminService.asignarSolicitudAAgente(solicitudParaAsignar.value.id, gestorSeleccionado.value)
    mostrarFeedback('success', 'Solicitud asignada exitosamente')
    showAsignarAgenteModal.value = false
    solicitudParaAsignar.value = null
    gestorSeleccionado.value = null
    await cargarSolicitudesSinAsignar()
    await cargarSolicitudesTipoOtro()
  } catch (err: any) {
    const errorMsg = err.response?.data?.mensaje || err.response?.data?.message || err.message || 'Error al asignar solicitud'
    mostrarFeedback('error', errorMsg)
    console.error('[Administration] Error asignando solicitud:', err)
  } finally {
    loading.value = false
  }
}

// ==================== CATEGORÍAS ====================

const toggleActivoCategoria = async (id: number, nombre: string, estadoActual: boolean) => {
  const accion = estadoActual ? 'desactivar' : 'activar'
  if (!confirm(`¿Estás seguro de que deseas ${accion} la categoría "${nombre}"?`)) {
    return
  }

  loading.value = true
  try {
    await adminService.toggleActivoCategoria(id)
    const mensaje = estadoActual 
      ? 'Categoría desactivada exitosamente. Las solicitudes asociadas permanecen intactas.'
      : 'Categoría activada exitosamente'
    mostrarFeedback('success', mensaje)
    await cargarCategorias()
  } catch (err: any) {
    const errorMsg = err.response?.data?.mensaje || err.response?.data?.message || err.message || 'Error al cambiar estado de la categoría'
    mostrarFeedback('error', errorMsg)
    console.error('[Administration] Error cambiando estado de categoría:', err)
  } finally {
    loading.value = false
  }
}

const eliminarCategoria = async (id: number, nombre: string) => {
  if (!confirm(`¿Estás seguro de que deseas eliminar la categoría "${nombre}"? Esta acción no se puede deshacer.`)) {
    return
  }

  loading.value = true
  try {
    await adminService.eliminarTipoSolicitud(id)
    mostrarFeedback('success', 'Categoría eliminada exitosamente')
    await cargarCategorias()
  } catch (err: any) {
    const errorMsg = err.response?.data?.mensaje || err.response?.data?.message || err.message || 'Error al eliminar categoría'
    mostrarFeedback('error', errorMsg)
    console.error('[Administration] Error eliminando categoría:', err)
  } finally {
    loading.value = false
  }
}

const cerrarModalNuevaCategoria = () => {
  showNewCategoryModal.value = false
  resetNewCategoryForm()
  feedback.value = null
}

const resetNewCategoryForm = () => {
  newCategory.value = {
    nombre: '',
    descripcion: '',
    areaId: 0,
    activo: true
  }
}

const crearCategoria = async () => {
  if (!newCategory.value.nombre) {
    mostrarFeedback('error', 'El nombre es requerido')
    return
  }

  loading.value = true
  try {
    await adminService.crearTipoSolicitud({
      nombre: newCategory.value.nombre,
      descripcion: newCategory.value.descripcion,
      areaId: newCategory.value.areaId || 0,
      activo: newCategory.value.activo
    })
    mostrarFeedback('success', 'Categoría creada exitosamente')
    showNewCategoryModal.value = false
    resetNewCategoryForm()
    await cargarCategorias()
  } catch (err: any) {
    const errorMsg = err.response?.data?.mensaje || err.response?.data?.message || err.message || 'Error al crear categoría'
    mostrarFeedback('error', errorMsg)
    console.error('[Administration] Error creando categoría:', err)
  } finally {
    loading.value = false
  }
}

const abrirModalEdicionCategoria = (category: TipoSolicitud) => {
  editingCategory.value = { ...category }
  showEditCategoryModal.value = true
  feedback.value = null
}

const cerrarModalEdicionCategoria = () => {
  showEditCategoryModal.value = false
  editingCategory.value = null
  feedback.value = null
}

const actualizarCategoria = async () => {
  if (!editingCategory.value) return

  loading.value = true
  try {
    await adminService.actualizarTipoSolicitud(editingCategory.value.id, {
      nombre: editingCategory.value.nombre,
      descripcion: editingCategory.value.descripcion,
      areaId: editingCategory.value.areaId || undefined,
      activo: editingCategory.value.activo
    })
    mostrarFeedback('success', 'Categoría actualizada exitosamente')
    showEditCategoryModal.value = false
    editingCategory.value = null
    await cargarCategorias()
  } catch (err: any) {
    const errorMsg = err.response?.data?.mensaje || err.response?.data?.message || err.message || 'Error al actualizar categoría'
    mostrarFeedback('error', errorMsg)
    console.error('[Administration] Error actualizando categoría:', err)
  } finally {
    loading.value = false
  }
}

// ==================== HELPERS ====================

const mostrarFeedback = (type: 'success' | 'error', message: string) => {
  feedback.value = { type, message }
  setTimeout(() => {
    feedback.value = null
  }, type === 'success' ? 3000 : 5000)
}

const resetNewUserForm = () => {
  newUser.value = {
    nombreUsuario: '',
    nombre: '',
    email: '',
    password: '',
    rol: 1,
    areaId: 0,  // 0 = Sin área
    activo: false,  // Por defecto inactivo hasta que se marque explícitamente
    codigoEmpleado: ''
  }
}

const resetNewAreaForm = () => {
  newArea.value = {
    nombre: '',
    descripcion: '',
    activo: true
  }
}

const getRoleBadgeClass = (rolId: number): string => {
  const classes: Record<number, string> = {
    3: 'px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700',      // Super Admin (3)
    2: 'px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700', // Admin (2)
    4: 'px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700',     // Agente (4)
    1: 'px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700'      // Usuario (1)
  }
  return classes[rolId] || classes[1]
}

import { getRoleName } from '../../constants/roles'

const getRoleLabel = getRoleName

// Helper para obtener información del estado de solicitud
// Helper para obtener información de prioridad (maneja tanto números como strings)
const getPrioridadInfo = (prioridad: number | string): { label: string, class: string } => {
  // Mapeo por número
  const prioridadesPorNumero: Record<number, { label: string, class: string }> = {
    1: { label: 'Baja', class: 'bg-green-100 text-green-700 border border-green-200' },
    2: { label: 'Media', class: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
    3: { label: 'Alta', class: 'bg-red-100 text-red-700 border border-red-200' }
  }
  
  // Mapeo por string (si el backend envía strings)
  const prioridadesPorString: Record<string, { label: string, class: string }> = {
    'Baja': { label: 'Baja', class: 'bg-green-100 text-green-700 border border-green-200' },
    'Media': { label: 'Media', class: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
    'Alta': { label: 'Alta', class: 'bg-red-100 text-red-700 border border-red-200' }
  }
  
  // Si es string, buscar en mapeo de strings
  if (typeof prioridad === 'string') {
    return prioridadesPorString[prioridad] || { label: prioridad, class: 'bg-gray-100 text-gray-500' }
  }
  
  // Si es número, buscar en mapeo de números
  return prioridadesPorNumero[prioridad] || { label: 'Desconocida', class: 'bg-gray-100 text-gray-500' }
}

const getEstadoInfo = (estado: number | string): { label: string, class: string } => {
  // Mapeo de estados por número
  const estadosPorNumero: Record<number, { label: string, class: string }> = {
    1: { label: 'Nueva', class: 'bg-blue-100 text-blue-700 border border-blue-200' },
    2: { label: 'En Proceso', class: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
    3: { label: 'Resuelta', class: 'bg-green-100 text-green-700 border border-green-200' },
    4: { label: 'Cerrada', class: 'bg-gray-100 text-gray-700 border border-gray-200' },
    5: { label: 'Rechazada', class: 'bg-red-100 text-red-700 border border-red-200' },
    6: { label: 'Cancelada', class: 'bg-orange-100 text-orange-700 border border-orange-200' }
  }
  
  // Mapeo de estados por string (backend a veces envía strings)
  const estadosPorString: Record<string, { label: string, class: string }> = {
    'Nueva': { label: 'Nueva', class: 'bg-blue-100 text-blue-700 border border-blue-200' },
    'EnProceso': { label: 'En Proceso', class: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
    'Resuelta': { label: 'Resuelta', class: 'bg-green-100 text-green-700 border border-green-200' },
    'Cerrada': { label: 'Cerrada', class: 'bg-gray-100 text-gray-700 border border-gray-200' },
    'Rechazada': { label: 'Rechazada', class: 'bg-red-100 text-red-700 border border-red-200' },
    'Cancelada': { label: 'Cancelada', class: 'bg-orange-100 text-orange-700 border border-orange-200' }
  }
  
  // Si es string, buscar en el mapeo de strings
  if (typeof estado === 'string') {
    return estadosPorString[estado] || { label: estado, class: 'bg-gray-100 text-gray-500' }
  }
  
  // Si es número, buscar en el mapeo de números
  return estadosPorNumero[estado] || { label: 'Desconocido', class: 'bg-gray-100 text-gray-500' }
}

// Helper para verificar si una solicitud puede ser asignada/reasignada
// No se pueden asignar solicitudes que están: Rechazada (5), Resuelta (3), Cerrada (4) o Cancelada (6)
const puedeSerAsignada = (estado: number | string): boolean => {
  // Convertir a string para comparación uniforme
  const estadoStr = typeof estado === 'string' ? estado : String(estado)
  
  // Estados finales que NO permiten asignación
  const estadosFinales = ['3', 'Resuelta', '4', 'Cerrada', '5', 'Rechazada', '6', 'Cancelada']
  
  return !estadosFinales.includes(estadoStr)
}

// Helper para navegar al detalle de una solicitud
const verDetalle = (id: number) => {
  router.push(`/dashboard/request-detail/${id}`)
}

// ==================== EXPORTAR REPORTE A EXCEL ====================

const exportarReporteExcel = async () => {
  exportandoExcel.value = true
  
  try {
    console.log('[Administration] 📊 Exportando reporte a Excel...')
    
    // Llamar al endpoint del backend
    const response = await adminService.exportarReporteExcel()
    
    // El backend debería devolver un blob (archivo)
    // Crear un link temporal para descargar el archivo
    const url = window.URL.createObjectURL(response)
    const link = document.createElement('a')
    link.href = url
    
    // Nombre del archivo con fecha actual
    const fecha = new Date().toISOString().split('T')[0]
    link.download = `Reporte_Sistema_${fecha}.xlsx`
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Liberar el objeto URL
    window.URL.revokeObjectURL(url)
    
    console.log('[Administration] ✅ Reporte exportado exitosamente')
    mostrarFeedback('success', 'Reporte exportado exitosamente')
  } catch (err: any) {
    console.error('[Administration] ❌ Error al exportar reporte:', err)
    const errorMsg = err.response?.data?.message || err.message || 'Error al exportar reporte'
    mostrarFeedback('error', errorMsg)
  } finally {
    exportandoExcel.value = false
  }
}

// Cargar datos al montar según la pestaña activa
onMounted(() => {
  if (activeTab.value === 'users') {
    cargarUsuarios()
    cargarAreas() // Para el dropdown en el modal
  } else if (activeTab.value === 'unassigned') {
    cargarSolicitudesSinAsignar()
  } else if (activeTab.value === 'areas') {
    cargarAreas()
  } else if (activeTab.value === 'categories') {
    cargarCategorias()
    cargarAreas() // Para el dropdown
  } else if (activeTab.value === 'reports') {
    cargarMetricas()
  }
})

// Recargar datos cuando cambia de pestaña
watch(activeTab, (newTab) => {
  feedback.value = null
  error.value = null
  
  if (newTab === 'users') {
    cargarUsuarios()
    cargarAreas() // Para el dropdown
  } else if (newTab === 'unassigned') {
    cargarSolicitudesSinAsignar()
  } else if (newTab === 'tipo-otro') {
    cargarSolicitudesTipoOtro()
  } else if (newTab === 'areas') {
    cargarAreas()
  } else if (newTab === 'categories') {
    cargarCategorias()
    if (areas.value.length === 0) cargarAreas() // Para el dropdown
  } else if (newTab === 'reports') {
    cargarMetricas()
  }
})
</script>
