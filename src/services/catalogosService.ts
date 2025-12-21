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
};

export default catalogosService;
export type { Area, TipoSolicitud, Estado };
