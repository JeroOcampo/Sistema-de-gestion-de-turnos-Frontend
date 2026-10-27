import { Rol } from '../../core/models/usuario.model';

export interface OpcionMenu {
  etiqueta: string;
  icono: string;
  ruta: string;
}

const PERFIL: OpcionMenu = { etiqueta: 'Mi perfil', icono: 'account_circle', ruta: '/perfil' };

/** Opciones de navegación por rol. */
export const MENU_POR_ROL: Record<Rol, OpcionMenu[]> = {
  paciente: [
    { etiqueta: 'Inicio', icono: 'home', ruta: '/paciente' },
    { etiqueta: 'Sacar turno', icono: 'event_available', ruta: '/paciente/turnos/nuevo' },
    { etiqueta: 'Mis turnos', icono: 'event_note', ruta: '/paciente/turnos' },
    { etiqueta: 'Historial clínico', icono: 'history_edu', ruta: '/paciente/historial' },
    { etiqueta: 'Mis datos personales', icono: 'account_circle', ruta: '/perfil' },
  ],
  medico: [
    { etiqueta: 'Inicio', icono: 'home', ruta: '/medico' },
    { etiqueta: 'Mi agenda', icono: 'calendar_month', ruta: '/medico/agenda' },
    { etiqueta: 'Turnos programados', icono: 'today', ruta: '/medico/turnos' },
    { etiqueta: 'Historial clínico', icono: 'history_edu', ruta: '/medico/historial' },
    PERFIL,
  ],
  operador: [
    { etiqueta: 'Inicio', icono: 'home', ruta: '/operador' },
    { etiqueta: 'Agenda y turnos', icono: 'event_note', ruta: '/operador/agenda' },
    { etiqueta: 'Asignar turno', icono: 'event_available', ruta: '/operador/turnos/nuevo' },
    { etiqueta: 'Alta de paciente', icono: 'person_add', ruta: '/operador/pacientes/nuevo' },
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
