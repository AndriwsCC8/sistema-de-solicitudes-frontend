import api from './api';

interface Solicitud {
  id: number;
  titulo: string;
  descripcion: string;
  categoria: string;
  prioridad: string;
  estado: string;
  solicitante: {
    id: number;
    nombre: string;
    email: string;
  };
  area: {
    id: number;
    nombre: string;
  };
  fechaCreacion: string;
  fechaActualizacion: string;
}

interface CrearSolicitudData {
  titulo: string;
  descripcion: string;
  categoria: string;
  prioridad: string;
  areaDestinoId: number;
}

const solicitudesService = {
  async crearSolicitud(data: CrearSolicitudData): Promise<Solicitud> {
    const response = await api.post<Solicitud>('/solicitudes', data);
    return response.data;
  },

  async obtenerMisSolicitudes(): Promise<Solicitud[]> {
    const response = await api.get<Solicitud[]>('/solicitudes/mis-solicitudes');
    return response.data;
  },

  async obtenerSolicitudesPorArea(areaId: number): Promise<Solicitud[]> {
    const response = await api.get<Solicitud[]>(`/solicitudes/area/${areaId}`);
    return response.data;
  },

  async obtenerTodas(): Promise<Solicitud[]> {
    const response = await api.get<Solicitud[]>('/solicitudes');
    return response.data;
  },
};

export default solicitudesService;
export type { Solicitud, CrearSolicitudData };
