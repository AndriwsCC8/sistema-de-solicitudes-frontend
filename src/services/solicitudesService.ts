import api from './api';

// Interface para Solicitud - Debe coincidir con el DTO del backend ASP.NET Core
interface Solicitud {
  id: number;
  numeroSolicitud?: string;
  numero?: string; // Alias usado por el backend en GET /api/solicitudes/area
  asunto: string;
  descripcion: string;
  prioridad: number | string;  // 1=Baja, 2=Media, 3=Alta O "Baja", "Media", "Alta"
  estado: number | string;  // 1=Nueva, 2=EnProceso, 3=Resuelta, 4=Cerrada, 5=Rechazada, 6=Cancelada
  fechaCreacion: string;
  fechaActualizacion?: string;
  fechaCierre?: string;
  
  // Usuario creador
  usuarioCreadorId: number;
  solicitanteId?: number; // Alias
  usuarioCreador?: {
    id: number;
    nombre: string;
    email: string;
  };
  solicitante?: string; // Nombre del solicitante (campo plano)
  solicitanteEmail?: string;
  solicitanteDepartamento?: string;
  solicitanteRol?: string;
  solicitanteRolNombre?: string;
  solicitanteCodigoEmpleado?: string;
  
  // Tipo de solicitud y área
  tipoSolicitudId: number;
  tipoSolicitud?: string | {
    id: number;
    nombre: string;
    areaId: number;
    area?: {
      id: number;
      nombre: string;
    };
  };
  areaId?: number; // ID del área (campo directo del backend)
  area?: string; // Nombre del área (campo plano)
  
  // Gestor asignado (el backend usa "GestorAsignadoId" en mayúsculas pero JSON lo serializa como camelCase)
  gestorAsignadoId?: number | null;
  gestorAsignado?: string | {
    id: number;
    nombre: string;
    email: string;
  };
  gestorAsignadoEmail?: string;
  
  // Otros campos
  motivoRechazo?: string | null;
  
  // Archivos
  archivo?: {
    nombreArchivo: string;
    contentType: string;
    tamanoBytes: number | null;
  };
  
  // Comentarios
  comentarios?: Array<{
    id: number;
    contenido: string;
    fechaCreacion: string;
    usuarioId: number;
    usuario?: {
      id: number;
      nombre: string;
      email: string;
    };
    nombreUsuario?: string;
    usuarioRolNombre?: string;
    usuarioDepartamento?: string;
  }>;
}

interface CrearSolicitudData {
  TipoSolicitudId: number;  // 1-5 según tipos disponibles
  Asunto: string;           // Título de la solicitud
  Descripcion: string;      // Descripción detallada
  Prioridad: number;        // 1=Baja, 2=Media, 3=Alta
}

const solicitudesService = {
  /**
   * Crear una nueva solicitud
   * POST /api/solicitudes
   */
  async crearSolicitud(data: CrearSolicitudData | FormData): Promise<Solicitud> {
    try {
      console.log('📤 [solicitudesService] Creando solicitud...');
      
      // Determinar si es FormData o objeto regular
      const isFormData = data instanceof FormData
      
      if (isFormData) {
        console.log('📎 [solicitudesService] Enviando con FormData (incluye archivo)');
        // Loggear el contenido del FormData
        for (const pair of (data as FormData).entries()) {
          console.log(`  ${pair[0]}:`, pair[1] instanceof File ? `File(${pair[1].name})` : pair[1]);
        }
      } else {
        console.log('📝 [solicitudesService] Datos recibidos:', data);
      }
      
      const response = await api.post<Solicitud>('/solicitudes', data, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
      });
      
      console.log('✅ [solicitudesService] Solicitud creada:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [solicitudesService] Error al crear solicitud:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        errorData: error.response?.data,
        errorDetails: JSON.stringify(error.response?.data, null, 2),
        url: error.config?.url,
        method: error.config?.method
      });
      
      // Loggear TODA la respuesta del error
      if (error.response) {
        console.error('🚨🚨🚨 RESPUESTA COMPLETA DEL ERROR 🚨🚨🚨');
        console.error('Status:', error.response.status);
        console.error('StatusText:', error.response.statusText);
        console.error('Data completa (objeto):', error.response.data);
        console.error('Data completa (JSON):', JSON.stringify(error.response.data, null, 2));
        console.error('Tipo de error.response.data:', typeof error.response.data);
        console.error('Keys del error.data:', Object.keys(error.response.data || {}));
        console.error('Headers:', error.response.headers);
        console.error('🚨🚨🚨 FIN RESPUESTA ERROR 🚨🚨🚨');
      }
      
      throw error;
    }
  },

  /**
   * Obtener solicitudes del usuario autenticado
   * GET /api/solicitudes/mis-solicitudes
   */
  async obtenerMisSolicitudes(): Promise<Solicitud[]> {
    try {
      console.log('📤 [solicitudesService] Obteniendo mis solicitudes...');
      const response = await api.get<Solicitud[]>('/solicitudes/mis-solicitudes');
      console.log('✅ [solicitudesService] Solicitudes obtenidas:', response.data.length);
      return response.data;
    } catch (error: any) {
      console.error('❌ [solicitudesService] Error al obtener mis solicitudes:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  },

  /**
   * Obtener solicitudes por área (para Agentes)
   * GET /api/solicitudes/area/{areaId}
   */
  async obtenerSolicitudesPorArea(areaId: number): Promise<Solicitud[]> {
    try {
      console.log(`📤 [solicitudesService] Obteniendo solicitudes del área ${areaId}...`);
      const response = await api.get<Solicitud[]>(`/solicitudes/area/${areaId}`);
      console.log('✅ [solicitudesService] Solicitudes del área obtenidas:', response.data.length);
      return response.data;
    } catch (error: any) {
      console.error('❌ [solicitudesService] Error al obtener solicitudes del área:', {
        areaId,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  },

  /**
   * Obtener solicitudes del área del usuario autenticado (Agente)
   * GET /api/solicitudes/area
   */
  async obtenerSolicitudesArea(): Promise<Solicitud[]> {
    try {
      console.log('📤 [solicitudesService] Obteniendo solicitudes de mi área...');
      const response = await api.get<Solicitud[]>('/solicitudes/area');
      console.log('✅ [solicitudesService] Solicitudes del área obtenidas:', response.data.length);
      return response.data;
    } catch (error: any) {
      console.error('❌ [solicitudesService] Error al obtener solicitudes del área:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  },

  /**
   * Obtener todas las solicitudes (Admin / SuperAdmin)
   * GET /api/solicitudes
   */
  async obtenerTodas(): Promise<Solicitud[]> {
    try {
      console.log('📤 [solicitudesService] Obteniendo todas las solicitudes...');
      const response = await api.get<Solicitud[]>('/solicitudes');
      console.log('✅ [solicitudesService] Todas las solicitudes obtenidas:', response.data.length);
      return response.data;
    } catch (error: any) {
      console.error('❌ [solicitudesService] Error al obtener todas las solicitudes:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  },

  /**
   * Obtener una solicitud por ID
   * GET /api/solicitudes/{id}
   */
  async obtenerPorId(id: number): Promise<Solicitud> {
    try {
      console.log(`[solicitudesService] 🔍 GET /api/solicitudes/${id}`);
      const response = await api.get<Solicitud>(`/solicitudes/${id}`);
      console.log(`[solicitudesService] ✅ Solicitud ${id} obtenida`);
      return response.data;
    } catch (error: any) {
      console.error(`[solicitudesService] ❌ Error al obtener solicitud ${id}:`);
      console.error('  - Status:', error.response?.status);
      console.error('  - Status Text:', error.response?.statusText);
      console.error('  - Respuesta del backend:', error.response?.data);
      console.error('  - URL llamada:', error.config?.url);
      console.error('  - Headers enviados:', error.config?.headers);
      throw error;
    }
  },
  /**
   * Tomar una solicitud (asignarla al usuario actual)
   * POST /api/solicitudes/{id}/tomar
   */
  async tomarSolicitud(id: number): Promise<Solicitud> {
    try {
      console.log(`[solicitudesService] 📥 POST /api/solicitudes/${id}/tomar`);
      const response = await api.post<Solicitud>(`/solicitudes/${id}/tomar`);
      console.log(`[solicitudesService] ✅ Solicitud ${id} tomada exitosamente`);
      return response.data;
    } catch (error: any) {
      console.error(`[solicitudesService] ❌ Error al tomar solicitud ${id}:`, error);
      throw error;
    }
  },

  /**
   * Asignar una solicitud a un gestor específico
   * POST /api/solicitudes/{id}/asignar/{usuarioId}
   */
  async asignarSolicitud(solicitudId: number, usuarioId: number): Promise<Solicitud> {
    try {
      console.log(`[solicitudesService] 📋 POST /api/solicitudes/${solicitudId}/asignar/${usuarioId}`);
      const response = await api.post<Solicitud>(`/solicitudes/${solicitudId}/asignar/${usuarioId}`);
      console.log(`[solicitudesService] ✅ Solicitud ${solicitudId} asignada a usuario ${usuarioId}`);
      return response.data;
    } catch (error: any) {
      console.error(`[solicitudesService] ❌ Error al asignar solicitud:`, error);
      throw error;
    }
  },

  /**
   * Desasignar una solicitud (quitar el gestor asignado)
   * POST /api/solicitudes/{id}/desasignar
   */
  async desasignarSolicitud(solicitudId: number): Promise<Solicitud> {
    try {
      console.log(`[solicitudesService] 🔄 POST /api/solicitudes/${solicitudId}/desasignar`);
      const response = await api.post<Solicitud>(`/solicitudes/${solicitudId}/desasignar`);
      console.log(`[solicitudesService] ✅ Solicitud ${solicitudId} desasignada exitosamente`);
      return response.data;
    } catch (error: any) {
      console.error(`[solicitudesService] ❌ Error al desasignar solicitud:`, error);
      throw error;
    }
  },
};

export default solicitudesService;
export type { Solicitud, CrearSolicitudData };
