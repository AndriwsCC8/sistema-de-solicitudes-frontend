import api from './api';

interface Area {
  id: number;
  nombre: string;
  descripcion: string;
}

interface TipoSolicitud {
  id: number;
  nombre: string;
  descripcion: string;
}

interface Estado {
  id: number;
  nombre: string;
  color: string;
}

interface Gestor {
  id: number;
  nombre: string;
  email: string;
  departamento?: string;
}

const catalogosService = {
  async obtenerAreas(): Promise<Area[]> {
    const response = await api.get<Area[]>('/catalogos/areas');
    return response.data;
  },

  async obtenerTiposSolicitud(): Promise<TipoSolicitud[]> {
    const response = await api.get<TipoSolicitud[]>('/catalogos/tipos-solicitud');
    return response.data;
  },

  async obtenerEstados(): Promise<Estado[]> {
    const response = await api.get<Estado[]>('/catalogos/estados');
    return response.data;
  },

  /**
   * Obtener gestores de un área específica
   * GET /api/catalogos/areas/{areaId}/gestores
   */
  async obtenerGestoresPorArea(areaId: number): Promise<Gestor[]> {
    try {
      console.log(`[catalogosService] 🔍 GET /api/catalogos/areas/${areaId}/gestores`);
      const response = await api.get<Gestor[]>(`/catalogos/areas/${areaId}/gestores`);
      console.log(`[catalogosService] ✅ Gestores obtenidos:`, response.data.length);
      return response.data;
    } catch (error: any) {
      console.error(`[catalogosService] ❌ Error al obtener gestores del área ${areaId}:`, error);
      throw error;
    }
  },
};

export default catalogosService;
export type { Area, TipoSolicitud, Estado, Gestor };
