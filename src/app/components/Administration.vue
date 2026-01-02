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
              <tr v-if="users.length === 0">
                <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                  No hay usuarios registrados
                </td>
              </tr>
              <tr v-for="user in users" :key="user.id">
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
                    class="text-gray-600 hover:text-gray-800 mr-3"
                  >
                    {{ user.activo ? 'Desactivar' : 'Activar' }}
                  </button>
                  <button 
                    @click="eliminarUsuario(user.id, user.nombre)"
                    class="text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
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
              <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                {{ area.cantidadAgentes || 0 }} agentes
              </span>
            </div>
            <p class="text-sm text-gray-600 mb-4">{{ area.descripcion || 'Sin descripción' }}</p>
            <div class="flex gap-2">
              <button 
                class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                disabled
              >
                Editar
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
          <div v-for="category in categories" :key="category.id" class="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50">
            <div class="flex-1">
              <h3 class="text-base font-medium text-gray-900">{{ category.nombre }}</h3>
              <p class="text-sm text-gray-600">{{ category.descripcion || 'Sin descripción' }}</p>
              <p class="text-xs text-gray-500 mt-1">Área: {{ category.areaNombre || 'Sin área' }}</p>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-sm text-gray-500">{{ category.cantidadSolicitudes || 0 }} solicitudes</span>
              <button 
                class="text-[#0f3a72] hover:text-[#0d3260] text-sm"
                disabled
              >
                Editar
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

    <!-- Settings -->
    <div v-if="activeTab === 'settings'" class="space-y-6">
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Configuración del Sistema</h2>
        
        <div class="space-y-6">
          <div>
            <label class="text-sm font-medium text-gray-700 mb-2 block">Nombre de la Organización</label>
            <input 
              type="text" 
              value="Mesa de Servicios"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
            />
          </div>

          <div>
            <label class="text-sm font-medium text-gray-700 mb-2 block">Email de Notificaciones</label>
            <input 
              type="email" 
              value="notificaciones@empresa.com"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3a72]"
            />
          </div>

          <div>
            <label class="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked class="w-4 h-4 text-[#0f3a72] focus:ring-[#0f3a72] rounded" />
              <span class="text-sm text-gray-700">Permitir auto-registro de usuarios</span>
            </label>
          </div>

          <div>
            <label class="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked class="w-4 h-4 text-[#0f3a72] focus:ring-[#0f3a72] rounded" />
              <span class="text-sm text-gray-700">Enviar notificaciones por email</span>
            </label>
          </div>

          <div class="pt-4">
            <button class="px-6 py-2 bg-[#0f3a72] text-white rounded-md hover:bg-[#0d3260] transition-colors">
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Reports -->
    <div v-if="activeTab === 'reports'" class="space-y-6">
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
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6">
            <p class="text-sm text-gray-600 mb-1">En Progreso</p>
            <p class="text-3xl font-bold text-blue-600">{{ metricas.enProgreso }}</p>
            <p class="text-xs text-gray-500 mt-2">
              {{ metricas.totalSolicitudes > 0 ? Math.round((metricas.enProgreso / metricas.totalSolicitudes) * 100) : 0 }}% del total
            </p>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6">
            <p class="text-sm text-gray-600 mb-1">Resueltas</p>
            <p class="text-3xl font-bold text-green-600">{{ metricas.resueltas }}</p>
            <p class="text-xs text-gray-500 mt-2">
              {{ metricas.totalSolicitudes > 0 ? Math.round((metricas.resueltas / metricas.totalSolicitudes) * 100) : 0 }}% del total
            </p>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6">
            <p class="text-sm text-gray-600 mb-1">Tiempo Promedio</p>
            <p class="text-3xl font-bold text-gray-900">{{ metricas.tiempoPromedioHoras ? metricas.tiempoPromedioHoras.toFixed(1) : '0.0' }}h</p>
            <p class="text-xs text-gray-500 mt-2">Horas de resolución</p>
          </div>
        </div>
      </template>

      <div v-else class="bg-white rounded-lg shadow-sm p-12 text-center">
        <p class="text-gray-500">No hay métricas disponibles</p>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">Reportes Disponibles</h2>
        <div class="space-y-3">
          <button class="w-full text-left px-4 py-3 border rounded-lg hover:bg-gray-50 transition-colors" disabled>
            📊 Reporte de Solicitudes por Área (Próximamente)
          </button>
          <button class="w-full text-left px-4 py-3 border rounded-lg hover:bg-gray-50 transition-colors" disabled>
            📈 Reporte de Desempeño de Agentes (Próximamente)
          </button>
          <button class="w-full text-left px-4 py-3 border rounded-lg hover:bg-gray-50 transition-colors" disabled>
            ⏱️ Reporte de Tiempos de Respuesta (Próximamente)
          </button>
          <button class="w-full text-left px-4 py-3 border rounded-lg hover:bg-gray-50 transition-colors" disabled>
            📋 Reporte Mensual Consolidado (Próximamente)
          </button>
        </div>
      </div>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { ROLES, hasMinRole } from '../../constants/roles'
import adminService, { type Usuario, type Area, type TipoSolicitud, type CrearUsuarioDto, type MetricasGenerales } from '../../services/adminService'

const authStore = useAuthStore()
// Usar el getter del store para el rol
const userRole = computed(() => authStore.userRole)

const activeTab = ref(userRole.value === ROLES.SUPER_ADMIN ? 'users' : 'areas')

const tabs = computed(() => {
  const allTabs = [
    { id: 'users', label: 'Usuarios', minRole: ROLES.SUPER_ADMIN },
    { id: 'areas', label: 'Áreas', minRole: ROLES.ADMIN },
    { id: 'categories', label: 'Categorías', minRole: ROLES.ADMIN },
    { id: 'settings', label: 'Configuración', minRole: ROLES.ADMIN },
    { id: 'reports', label: 'Reportes', minRole: ROLES.ADMIN }
  ]
  return allTabs.filter(tab => hasMinRole(userRole.value, tab.minRole))
})

// Estados para datos del backend
const users = ref<Usuario[]>([])
const areas = ref<Area[]>([])
const categories = ref<TipoSolicitud[]>([])
const metricas = ref<MetricasGenerales | null>(null)

// Estados de carga y errores
const loading = ref(false)
const error = ref<string | null>(null)
const feedback = ref<{ type: 'success' | 'error', message: string } | null>(null)

// Modales
const showNewUserModal = ref(false)
const showEditUserModal = ref(false)
const showNewAreaModal = ref(false)
const showEditAreaModal = ref(false)
const showNewCategoryModal = ref(false)
const showEditCategoryModal = ref(false)

// Formularios
const newUser = ref<CrearUsuarioDto>({
  nombreUsuario: '',
  nombre: '',
  email: '',
  password: '',
  rol: 1,
  areaId: 0,  // 0 = Sin área
  codigoEmpleado: ''
})

const editingUser = ref<Usuario | null>(null)
const editingArea = ref<Area | null>(null)
const editingCategory = ref<TipoSolicitud | null>(null)

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

const eliminarUsuario = async (id: number, nombre: string) => {
  if (!confirm(`¿Estás seguro de que deseas eliminar al usuario "${nombre}"? Esta acción no se puede deshacer.`)) {
    return
  }

  loading.value = true
  try {
    await adminService.eliminarUsuario(id)
    mostrarFeedback('success', 'Usuario eliminado exitosamente')
    await cargarUsuarios()
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || err.message || 'Error al eliminar usuario'
    mostrarFeedback('error', errorMsg)
    console.error('[Administration] Error eliminando usuario:', err)
  } finally {
    loading.value = false
  }
}

const toggleUsuarioEstado = async (usuario: Usuario) => {
  const nuevoEstado = !usuario.activo
  const accion = nuevoEstado ? 'activar' : 'desactivar'
  
  if (!confirm(`¿Estás seguro de que deseas ${accion} al usuario "${usuario.nombre}"?`)) {
    return
  }

  loading.value = true
  try {
    await adminService.cambiarEstadoUsuario(usuario.id, nuevoEstado)
    mostrarFeedback('success', `Usuario ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`)
    await cargarUsuarios()
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || err.message || `Error al ${accion} usuario`
    mostrarFeedback('error', errorMsg)
    console.error('[Administration] Error cambiando estado:', err)
  } finally {
    loading.value = false
  }
}

// ==================== ÁREAS ====================

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
    const errorMsg = err.response?.data?.message || err.message || 'Error al eliminar área'
    mostrarFeedback('error', errorMsg)
    console.error('[Administration] Error eliminando área:', err)
  } finally {
    loading.value = false
  }
}

// ==================== CATEGORÍAS ====================

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
    const errorMsg = err.response?.data?.message || err.message || 'Error al eliminar categoría'
    mostrarFeedback('error', errorMsg)
    console.error('[Administration] Error eliminando categoría:', err)
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
    codigoEmpleado: ''
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

// Cargar datos al montar según la pestaña activa
onMounted(() => {
  if (activeTab.value === 'users') {
    cargarUsuarios()
    cargarAreas() // Para el dropdown en el modal
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
