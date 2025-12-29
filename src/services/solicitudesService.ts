import api from './api';

// Interface para Solicitud - Debe coincidir con el DTO del backend ASP.NET Core
interface Solicitud {
  id: number;
  numeroSolicitud?: string;
  asunto: string;
  descripcion: string;
  prioridad: number;  // 1=Baja, 2=Media, 3=Alta
  estado: number;  // 1=Nueva, 2=Asignado, 3=Resuelto, 4=Cerrado, 5=Cancelado
  fechaCreacion: string;
  fechaActualizacion?: string;
  usuarioCreadorId: number;
  usuarioCreador?: {
    id: number;
    nombre: string;
    email: string;
  };
  tipoSolicitudId: number;
  tipoSolicitud?: {
    id: number;
    nombre: string;
    areaId: number;
    area?: {
      id: number;
      nombre: string;
    };
  };
  agenteAsignadoId?: number;
  agenteAsignado?: {
    id: number;
    nombre: string;
    email: string;
  };
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
  async crearSolicitud(data: CrearSolicitudData): Promise<Solicitud> {
    try {
      console.log('📤 [solicitudesService] Creando solicitud...');
      console.log('📝 [solicitudesService] Datos recibidos:', data);
      
      // Payload FINAL que se enviará al backend (según DTO del backend)
      const payload = {
        TipoSolicitudId: data.TipoSolicitudId,
        Asunto: data.Asunto,
        Descripcion: data.Descripcion,
        Prioridad: data.Prioridad
      };
      
      console.log('🚨 [solicitudesService] Payload FINAL enviado al backend:', JSON.stringify(payload, null, 2));
      
      const response = await api.post<Solicitud>('/solicitudes', payload);
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
        method: error.config?.method,
        sentData: error.config?.data,
        headers: error.config?.headers
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
};

export default solicitudesService;
export type { Solicitud, CrearSolicitudData };
