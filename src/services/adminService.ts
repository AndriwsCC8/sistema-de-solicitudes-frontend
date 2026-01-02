import api from './api'

// ==================== INTERFACES ====================

export interface Usuario {
  id: number
  nombreUsuario?: string  // Username para login
  nombre: string
  email: string
  rolId: number      // Frontend usa rolId
  rol?: number       // Backend puede devolver 'rol' también
  rolNombre?: string
  areaId?: number | null
  areaNombre?: string
  activo: boolean
  fechaCreacion?: string
  codigoEmpleado?: string
  password?: string  // Opcional para edición
}

export interface CrearUsuarioDto {
  nombreUsuario: string  // Username único para login
  nombre: string         // Nombre completo
  email: string
  password: string
  rol: number           // Backend espera 'rol' no 'rolId'
  areaId?: number | null
  activo?: boolean      // Opcional en creación
  codigoEmpleado?: string
}

export interface ActualizarUsuarioDto {
  nombre?: string
  email?: string
  rol?: number           // Backend espera 'rol', no 'rolId'
  areaId?: number | null
  activo?: boolean
  codigoEmpleado?: string
}

export interface Area {
  id: number
  nombre: string
  descripcion?: string
  activa: boolean
  cantidadAgentes?: number
  fechaCreacion?: string
}

export interface CrearAreaDto {
  nombre: string
  descripcion?: string
  activa: boolean
}

export interface ActualizarAreaDto {
  nombre?: string
  descripcion?: string
  activa?: boolean
}

export interface TipoSolicitud {
  id: number
  nombre: string
  descripcion?: string
  areaId: number
  areaNombre?: string
  activo: boolean
  cantidadSolicitudes?: number
  fechaCreacion?: string
}

export interface CrearTipoSolicitudDto {
  nombre: string
  descripcion?: string
  areaId: number
  activo: boolean
}

export interface ActualizarTipoSolicitudDto {
  nombre?: string
  descripcion?: string
  areaId?: number
  activo?: boolean
}

export interface MetricasGenerales {
  totalSolicitudes: number
  enProgreso: number
  resueltas: number
  tiempoPromedioHoras: number
  variacionMensual?: number
}

// ==================== SERVICIO ====================

const adminService = {
  // ==================== USUARIOS ====================
  
  /**
   * Obtener todos los usuarios (Solo SuperAdmin)
   * GET /api/admin/usuarios
   */
  async obtenerUsuarios(): Promise<Usuario[]> {
    try {
      console.log('[adminService] 📤 Obteniendo usuarios...')
      const response = await api.get<Usuario[]>('/admin/usuarios')
      
      // Normalizar: asegurar que rolId esté presente
      const usuarios = response.data.map(u => ({
        ...u,
        rolId: u.rolId || u.rol || 1  // Si backend devuelve 'rol', usarlo como 'rolId'
      }))
      
      console.log('[adminService] ✅ Usuarios obtenidos:', usuarios.length)
      return usuarios
    } catch (error: any) {
      console.error('[adminService] ❌ Error al obtener usuarios:', error)
      throw error
    }
  },

  /**
   * Crear un nuevo usuario (Solo SuperAdmin)
   * POST /api/admin/usuarios
   */
  async crearUsuario(data: CrearUsuarioDto): Promise<Usuario> {
    try {
      console.log('[adminService] 📤 Creando usuario:', data.email)
      const response = await api.post<Usuario>('/admin/usuarios', data)
      console.log('[adminService] ✅ Usuario creado:', response.data.id)
      return response.data
    } catch (error: any) {
      console.error('[adminService] ❌ Error al crear usuario:', error)
      throw error
    }
  },

  /**
   * Actualizar un usuario existente (Solo SuperAdmin)
   * PUT /api/admin/usuarios/{id}
   */
  async actualizarUsuario(id: number, data: ActualizarUsuarioDto): Promise<Usuario> {
    try {
      console.log('[adminService] 📤 Actualizando usuario:', id)
      const response = await api.put<Usuario>(`/admin/usuarios/${id}`, data)
      console.log('[adminService] ✅ Usuario actualizado:', response.data.id)
      return response.data
    } catch (error: any) {
      console.error('[adminService] ❌ Error al actualizar usuario:', error)
      throw error
    }
  },

  /**
   * Eliminar un usuario (Solo SuperAdmin)
   * DELETE /api/admin/usuarios/{id}
   */
  async eliminarUsuario(id: number): Promise<void> {
    try {
      console.log('[adminService] 📤 Eliminando usuario:', id)
      await api.delete(`/admin/usuarios/${id}`)
      console.log('[adminService] ✅ Usuario eliminado')
    } catch (error: any) {
      console.error('[adminService] ❌ Error al eliminar usuario:', error)
      throw error
    }
  },

  /**
   * Activar/Desactivar un usuario (Solo SuperAdmin)
   * Si el backend no tiene endpoint /estado, usa PUT para actualizar solo el campo activo
   */
  async cambiarEstadoUsuario(id: number, activo: boolean): Promise<Usuario> {
    try {
      console.log('[adminService] 📤 Cambiando estado usuario:', id, '→', activo)
      
      // Primero obtenemos el usuario actual para preservar sus datos
      const usuarios = await this.obtenerUsuarios()
      const usuario = usuarios.find(u => u.id === id)
      
      if (!usuario) {
        throw new Error(`Usuario con id ${id} no encontrado`)
      }
      
      // Actualizamos solo cambiando el campo activo
      const response = await api.put<Usuario>(`/admin/usuarios/${id}`, {
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rolId,    // Backend espera 'rol', leemos de 'rolId'
        areaId: usuario.areaId,
        activo: activo
      })
      
      console.log('[adminService] ✅ Estado cambiado')
      return response.data
    } catch (error: any) {
      console.error('[adminService] ❌ Error al cambiar estado:', error)
      throw error
    }
  },

  // ==================== ÁREAS ====================

  /**
   * Obtener todas las áreas
   * GET /api/admin/areas
   */
  async obtenerAreas(): Promise<Area[]> {
    try {
      console.log('[adminService] 📤 Obteniendo áreas...')
      const response = await api.get<Area[]>('/admin/areas')
      console.log('[adminService] ✅ Áreas obtenidas:', response.data.length)
      return response.data
    } catch (error: any) {
      console.error('[adminService] ❌ Error al obtener áreas:', error)
      throw error
    }
  },

  /**
   * Crear una nueva área
   * POST /api/admin/areas
   */
  async crearArea(data: CrearAreaDto): Promise<Area> {
    try {
      console.log('[adminService] 📤 Creando área:', data.nombre)
      const response = await api.post<Area>('/admin/areas', data)
      console.log('[adminService] ✅ Área creada:', response.data.id)
      return response.data
    } catch (error: any) {
      console.error('[adminService] ❌ Error al crear área:', error)
      throw error
    }
  },

  /**
   * Actualizar un área existente
   * PUT /api/admin/areas/{id}
   */
  async actualizarArea(id: number, data: ActualizarAreaDto): Promise<Area> {
    try {
      console.log('[adminService] 📤 Actualizando área:', id)
      const response = await api.put<Area>(`/admin/areas/${id}`, data)
      console.log('[adminService] ✅ Área actualizada:', response.data.id)
      return response.data
    } catch (error: any) {
      console.error('[adminService] ❌ Error al actualizar área:', error)
      throw error
    }
  },

  /**
   * Eliminar un área
   * DELETE /api/admin/areas/{id}
   */
  async eliminarArea(id: number): Promise<void> {
    try {
      console.log('[adminService] 📤 Eliminando área:', id)
      await api.delete(`/admin/areas/${id}`)
      console.log('[adminService] ✅ Área eliminada')
    } catch (error: any) {
      console.error('[adminService] ❌ Error al eliminar área:', error)
      throw error
    }
  },

  // ==================== CATEGORÍAS (TIPOS DE SOLICITUD) ====================

  /**
   * Obtener todos los tipos de solicitud / categorías
   * GET /api/admin/categorias
   */
  async obtenerTiposSolicitud(): Promise<TipoSolicitud[]> {
    try {
      console.log('[adminService] 📤 Obteniendo tipos de solicitud...')
      const response = await api.get<TipoSolicitud[]>('/admin/categorias')
      console.log('[adminService] ✅ Tipos obtenidos:', response.data.length)
      return response.data
    } catch (error: any) {
      console.error('[adminService] ❌ Error al obtener tipos:', error)
      throw error
    }
  },

  /**
   * Crear un nuevo tipo de solicitud / categoría
   * POST /api/admin/categorias
   */
  async crearTipoSolicitud(data: CrearTipoSolicitudDto): Promise<TipoSolicitud> {
    try {
      console.log('[adminService] 📤 Creando tipo de solicitud:', data.nombre)
      const response = await api.post<TipoSolicitud>('/admin/categorias', data)
      console.log('[adminService] ✅ Tipo creado:', response.data.id)
      return response.data
    } catch (error: any) {
      console.error('[adminService] ❌ Error al crear tipo:', error)
      throw error
    }
  },

  /**
   * Actualizar un tipo de solicitud existente
   * PUT /api/admin/categorias/{id}
   */
  async actualizarTipoSolicitud(id: number, data: ActualizarTipoSolicitudDto): Promise<TipoSolicitud> {
    try {
      console.log('[adminService] 📤 Actualizando tipo de solicitud:', id)
      const response = await api.put<TipoSolicitud>(`/admin/categorias/${id}`, data)
      console.log('[adminService] ✅ Tipo actualizado:', response.data.id)
      return response.data
    } catch (error: any) {
      console.error('[adminService] ❌ Error al actualizar tipo:', error)
      throw error
    }
  },

  /**
   * Eliminar un tipo de solicitud
   * DELETE /api/admin/categorias/{id}
   */
  async eliminarTipoSolicitud(id: number): Promise<void> {
    try {
      console.log('[adminService] 📤 Eliminando tipo de solicitud:', id)
      await api.delete(`/admin/categorias/${id}`)
      console.log('[adminService] ✅ Tipo eliminado')
    } catch (error: any) {
      console.error('[adminService] ❌ Error al eliminar tipo:', error)
      throw error
    }
  },

  // ==================== REPORTES ====================

  /**
   * Obtener reporte resumen general del sistema
   * GET /api/admin/reportes/resumen
   */
  async obtenerMetricasGenerales(): Promise<MetricasGenerales> {
    try {
      console.log('[adminService] 📤 Obteniendo métricas generales...')
      const response = await api.get<MetricasGenerales>('/admin/reportes/resumen')
      console.log('[adminService] ✅ Métricas obtenidas')
      return response.data
    } catch (error: any) {
      console.error('[adminService] ❌ Error al obtener métricas:', error)
      throw error
    }
  }
}

export default adminService
