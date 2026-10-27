import { Rol } from '../../core/models/usuario.model';

export interface OpcionMenu {
  etiqueta: string;
  icono: string;
  ruta: string;
}

const PERFIL: OpcionMenu = { etiqueta: 'Mi perfil', icono: 'account_circle', ruta: '/perfil' };

/**
 * Opciones de navegación por rol. Las rutas de semanas futuras existen y
 * muestran la pantalla "En construcción" hasta que se implementen.
 */
export const MENU_POR_ROL: Record<Rol, OpcionMenu[]> = {
  paciente: [
    { etiqueta: 'Inicio', icono: 'home', ruta: '/paciente' },
    { etiqueta: 'Sacar turno', icono: 'event_available', ruta: '/paciente/turnos/nuevo' },
    { etiqueta: 'Mis turnos', icono: 'event_note', ruta: '/paciente/turnos' },
    { etiqueta: 'Historial clínico', icono: 'history_edu', ruta: '/paciente/historial' },
    PERFIL,
  ],
  medico: [
    { etiqueta: 'Inicio', icono: 'home', ruta: '/medico' },
    { etiqueta: 'Mi agenda', icono: 'calendar_month', ruta: '/medico/agenda' },
    { etiqueta: 'Turnos del día', icono: 'today', ruta: '/medico/turnos' },
    { etiqueta: 'Historial clínico', icono: 'history_edu', ruta: '/medico/historial' },
    PERFIL,
  ],
  operador: [
    { etiqueta: 'Inicio', icono: 'home', ruta: '/operador' },
    { etiqueta: 'Turnos de la sede', icono: 'event_note', ruta: '/operador/turnos' },
    { etiqueta: 'Pacientes', icono: 'groups', ruta: '/operador/pacientes' },
    PERFIL,
  ],
  administrador: [
    { etiqueta: 'Inicio', icono: 'home', ruta: '/admin' },
    { etiqueta: 'Usuarios', icono: 'manage_accounts', ruta: '/admin/usuarios' },
    { etiqueta: 'Sedes', icono: 'location_city', ruta: '/admin/sedes' },
    { etiqueta: 'Especialidades', icono: 'medical_services', ruta: '/admin/especialidades' },
    { etiqueta: 'Coberturas', icono: 'health_and_safety', ruta: '/admin/coberturas' },
    { etiqueta: 'Reportes', icono: 'bar_chart', ruta: '/admin/reportes' },
    { etiqueta: 'Auditoría', icono: 'fact_check', ruta: '/admin/auditoria' },
    PERFIL,
  ],
};
