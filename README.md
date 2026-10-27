# Clínica Virtual — Frontend del Sistema de Gestión de Turnos

Frontend en Angular del Sistema de Gestión de Turnos Médicos (Programación 2).
Consume la API del backend: <https://github.com/S4nti21/Sistema-de-gestion-de-turnos-Backend>.

## Versiones utilizadas

| Herramienta      | Versión  |
| ---------------- | -------- |
| Node.js          | 24.16.0 (compatible: `^20.19`, `^22.12`, `^24`) |
| npm              | 11.13.0  |
| Angular CLI      | 21.2.x   |
| Angular          | 21.2.x   |
| Angular Material | 21.2.x   |
| TypeScript       | 5.9.x    |

Sin SSR, estilos en SCSS, formularios con Reactive Forms.

## Requisitos previos

1. Node.js 22 LTS (22.12 o superior) o Node 24 LTS.
2. Angular CLI 21: `npm install -g @angular/cli@21` (verificar con `ng version`).
3. Backend de la clínica en ejecución en `http://localhost:3000` (con su base MySQL cargada y CORS habilitado, que ya viene activo en el backend).

## Instalación y ejecución

```bash
npm install
ng serve
```

La aplicación queda disponible en <http://localhost:4200>.

Otros comandos útiles:

```bash
ng build   # compilación de producción en dist/
ng test    # pruebas unitarias (Vitest)
```

### Cambiar la URL del backend

La URL base de la API se define en un único archivo: [`src/app/core/config/api.config.ts`](src/app/core/config/api.config.ts) (`API_BASE_URL`).

## Estructura del proyecto

```
src/app/
  core/
    config/        URL base de la API
    models/        interfaces TypeScript (usuario, cobertura, auth, respuesta de la API)
    services/      auth, cobertura, notificaciones (consumo de la API)
    interceptors/  envío del token JWT y traducción de errores del backend
    guards/        acceso por sesión, por rol y solo-invitados
  shared/components/  componentes reutilizables (encabezado de página, alerta de error)
  layout/          header, menú lateral por rol y footer
  features/
    auth/          login y registro de pacientes
    home/          pantalla principal (con y sin sesión)
    perfil/        Mi perfil
    paciente/ medico/ operador/ admin/   secciones por rol
    errors/        acceso denegado, página no encontrada y "En construcción"
```

## Funcionalidades de la semana 1

- Registro de pacientes con cobertura cargada desde `GET /coberturas`.
- Inicio y cierre de sesión (`POST /auth/login`); el token se guarda en `localStorage` y la sesión se mantiene al recargar.
- Mi perfil con los datos de `GET /auth/perfil`.
- Menú de navegación según el rol (administrador, médico, operador, paciente); las funciones de próximas semanas muestran "En construcción".
- Rutas protegidas por sesión y por rol (`/paciente`, `/medico`, `/operador`, `/admin`), con redirección al login o a "Acceso denegado".
- Página "No encontrada" para rutas inexistentes.
- La campana de notificaciones del header queda ubicada; su funcionalidad se completa en la semana 3.

## Endpoints consumidos

| Método | Ruta              | Uso                         |
| ------ | ----------------- | --------------------------- |
| POST   | `/auth/registro`  | Registro de paciente        |
| POST   | `/auth/login`     | Inicio de sesión (DNI + contraseña) |
| GET    | `/auth/perfil`    | Datos del usuario logueado  |
| GET    | `/coberturas`     | Listado de coberturas       |
