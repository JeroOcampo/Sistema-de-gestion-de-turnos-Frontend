# Clínica Virtual — Frontend del Sistema de Gestión de Turnos

Frontend en Angular del Sistema de Gestión de Turnos Médicos (Programación 2).
Consume la API del backend: <https://github.com/S4nti21/Sistema-de-gestion-de-turnos-Backend>.

La aplicación cubre los cuatro roles (paciente, médico, operador y administrador) y está pensada para usarse en una PC de escritorio.

## Versiones utilizadas

| Herramienta      | Versión                                         |
| ---------------- | ----------------------------------------------- |
| Node.js          | 24.22.1 (compatible: `^20.19`, `^22.12`, `^24`) |
| npm              | 11.x                                            |
| Angular CLI      | 21.2.x                                          |
| Angular          | 21.2.x                                          |
| Angular Material | 21.2.x                                          |
| TypeScript       | 5.9.x                                           |
| ng2-charts       | 10.0.0                                          |
| Chart.js         | 4.x                                             |
| MySQL / MariaDB  | MySQL 8 o MariaDB 10.4+ (la de XAMPP)           |

Sin SSR, estilos en SCSS, formularios con Reactive Forms y estado con signals.

**Librería de gráficos:** [ng2-charts](https://github.com/valor-software/ng2-charts) 10 sobre Chart.js 4. Es la versión de ng2-charts compatible con Angular 21; la 11 ya exige Angular 22. Se usa en la pantalla de Reportes y se carga solo al entrar a esa pantalla.

## Cómo levantar el sistema desde cero

Requisitos: Node.js 22.12+ o 24 LTS, Angular CLI 21 (`npm install -g @angular/cli@21`), Git y un servidor MySQL o MariaDB (por ejemplo, XAMPP).

### 1. Base de datos

1. Iniciar MySQL (en XAMPP: *Start* en el módulo MySQL).
2. Importar el script del backend `database/clinica.sql`, que crea la base `clinica` con todas las tablas y los datos de prueba:
   - con phpMyAdmin: *Importar* → elegir `database/clinica.sql` → *Continuar*;
   - o por consola: `mysql -u root -p < database/clinica.sql` (en XAMPP: `C:\xampp\mysql\bin\mysql.exe -u root < database\clinica.sql`).

> Las fechas de los datos de prueba (agenda, turnos, historial y notificaciones) se calculan a partir del **día en que se importa el script**. Siempre hay turnos de hoy, futuros y pasados. Para volver al estado inicial, alcanza con importarlo de nuevo.

### 2. Backend (puerto 3000)

```bash
git clone https://github.com/S4nti21/Sistema-de-gestion-de-turnos-Backend.git
cd Sistema-de-gestion-de-turnos-Backend
npm install
cp .env.example .env      # y completar los valores (ver tabla)
npm run dev               # o npm start
```

Para comprobar que está funcionando: <http://localhost:3000/health> devuelve `{"codigo":200,"estado":"ok","datos":{"db":"conectada"}}`.

### 3. Frontend (puerto 4200)

```bash
npm install
ng serve
```

La aplicación queda en <http://localhost:4200>.

Otros comandos:

```bash
ng build   # compilación de producción en dist/
ng test    # pruebas unitarias (Vitest)
```

## Variables de entorno

**Backend** (archivo `.env`, a partir de `.env.example`):

| Variable         | Ejemplo                 | Uso                                                 |
| ---------------- | ----------------------- | --------------------------------------------------- |
| `PORT`           | `3000`                  | Puerto de la API                                    |
| `DB_HOST`        | `localhost`             | Servidor MySQL                                      |
| `DB_PORT`        | `3306`                  | Puerto de MySQL                                     |
| `DB_USER`        | `root`                  | Usuario de MySQL                                    |
| `DB_PASSWORD`    | *(vacío en XAMPP)*      | Contraseña de MySQL                                 |
| `DB_NAME`        | `clinica`               | Base creada por `clinica.sql`                       |
| `JWT_SECRET`     | `un_secreto_largo`      | Clave con la que se firman los tokens               |
| `JWT_EXPIRES_IN` | `1d`                    | Duración del token (al vencer, el front vuelve al login) |

**Frontend:** no usa variables de entorno. La URL de la API está definida en un único archivo, [`src/app/core/config/api.config.ts`](src/app/core/config/api.config.ts) (`API_BASE_URL = 'http://localhost:3000'`).

## Usuarios de prueba

Todos tienen la contraseña **`Password123!`** y se ingresa con el DNI.

| Rol           | DNI        | Usuario         | Para probar                                                                                                   |
| ------------- | ---------- | --------------- | ------------------------------------------------------------------------------------------------------------- |
| Administrador | `10000001` | Marcos Gomez    | ABM de sedes, especialidades y coberturas; usuarios; auditoría; reportes con gráficos                        |
| Médico        | `10000002` | Ana Lopez       | Atiende hoy en **Sede Centro (mañana) y Sede Norte (tarde)**: agenda en dos sedes, turnos del día, historial |
| Médico        | `10000004` | Diego Ramirez   | Cardiología y Clínica Médica en Sede Norte                                                                    |
| Médico        | `10000005` | Valeria Sosa    | Pediatría y Dermatología en Sede Sur                                                                          |
| Operador      | `10000003` | Juan Perez      | Operador de Sede Centro: agenda y turnos de su sede, alta de pacientes, asignar turnos                        |
| Operador      | `10000006` | Carla Diaz      | Operador de Sede Norte                                                                                        |
| Paciente      | `36000960` | Franco Friggeri | Tiene turnos en los tres estados, historial clínico y notificaciones sin leer                                 |
| Paciente      | `41222333` | Lucia Molina    | Otro paciente para pedir turnos                                                                               |

## Funcionalidades

**Todos los roles**

- Login, registro de pacientes, perfil y menú según el rol. Las rutas están protegidas por sesión y por rol, también si se escribe la URL a mano.
- La campana del header muestra las notificaciones no leídas (el contador se oculta si no hay ninguna). Al abrirla se ven de la más reciente a la más antigua y se pueden marcar como leídas. El contador se actualiza al navegar y después de confirmar, cancelar o atender un turno.
- Si el token vence durante el uso, se vuelve al login. Si el backend no responde, se muestra un mensaje en lugar de dejar la pantalla en blanco.

**Paciente**

- *Sacar turno*: especialidad → sede → médico → fecha → horario disponible → nota y confirmación, con un resumen que incluye la cobertura del paciente. Cada paso filtra el siguiente. Si el horario se ocupó mientras tanto, se muestra el motivo y se vuelve a elegir horario.
- *Mis turnos*: los próximos primero y después los anteriores, con el detalle desplegable y el estado distinguido por color e ícono. Los turnos confirmados se pueden cancelar; los atendidos muestran el historial clínico.
- *Historial clínico* y *Mis datos personales*: solo se pueden modificar el email, la contraseña (hay que repetirla), el teléfono y la cobertura.

**Médico**

- *Mi agenda*: rangos horarios por día en todas sus sedes, con alta, modificación y baja. Puede cargar varios rangos el mismo día, la especialidad se elige entre las suyas y la sede propia viene preseleccionada.
- *Turnos programados*: turnos del día en todas sus sedes, con filtro de sede, edad del paciente y la nota desplegable. Desde ahí puede **marcar como atendido**, cargando diagnóstico, tratamiento y observaciones, o cancelar.
- *Historial clínico*: búsqueda de pacientes por DNI o apellido; solo ve los registros de los turnos que atendió él.

**Operador**

- *Agenda y turnos*: médicos con agenda en la fecha y sede elegidas. En su propia sede puede cargar una nueva agenda (para cualquier médico, aunque todavía no tenga agenda), editar los rangos (lápiz) y ver y cancelar los turnos confirmados (ojo). Las otras sedes son solo de consulta.
- *Asignar turno*: busca al paciente y sigue el mismo flujo que "Sacar turno", con la sede fija en la suya.
- *Alta de paciente*: el mismo formulario del registro.

**Administrador**

- *Sedes, Especialidades y Coberturas*: tabla con filtro, alta y modificación con validaciones, y baja con confirmación. Si el backend rechaza la baja por dependencias, se muestra su mensaje.
- *Usuarios*: listado paginado con filtros por nombre, apellido, tipo y sede. Permite dar de alta operadores, médicos (con sus especialidades) y administradores, y editar cualquier usuario.
- *Auditoría*: registro de solo lectura, paginado, con filtros por usuario, entidad, acción y rango de fechas.
- *Reportes*: indicadores (turnos, atendidos, pendientes y tasa de cancelación), barras apiladas por estado para turnos por especialidad y por sede (cada una con su tabla) y ranking de médicos. Un filtro de rango de fechas actualiza todo a la vez.

Las fechas se muestran en formato `dd/mm/aaaa` y los datepickers aceptan fechas escritas con ese mismo formato.

## Estructura del proyecto

```
src/app/
  core/
    config/        URL de la API, adaptador de fechas dd/mm/aaaa y textos del paginador
    models/        interfaces de cada recurso de la API
    services/      un servicio por recurso (sedes, agenda, turnos, notificaciones…)
    interceptors/  envío del token JWT y traducción de errores del backend
    guards/        acceso por sesión, por rol y solo-invitados
    utils/         fechas y query params
  shared/
    components/    formulario de paciente, diálogo de rango horario, tabla de historial,
                   confirmación, selector de fecha, cargando, estado vacío, etc.
    pipes/         edad y nombre del rol
  layout/          header (con la campana), menú por rol y footer
  features/
    auth/          login y registro
    turnos/        "Nuevo turno", compartido entre el paciente y el operador
    paciente/ medico/ operador/ admin/   pantallas de cada rol
    perfil/        Mi perfil / Mis datos personales
    errors/        acceso denegado y página no encontrada
```

## Endpoints consumidos

| Método | Ruta                                  | Uso                                                      |
| ------ | ------------------------------------- | -------------------------------------------------------- |
| POST   | `/auth/registro`, `/auth/login`       | Registro e inicio de sesión                              |
| GET    | `/auth/perfil`                        | Datos del usuario logueado                               |
| GET    | `/sedes`, `/especialidades`, `/coberturas` | Listados para elegir opciones                       |
| POST/PUT/DELETE | `/sedes`, `/especialidades`, `/coberturas` | ABM del administrador                          |
| GET    | `/medicos`, `/medicos/:id`            | Médicos con sus especialidades                           |
| GET    | `/disponibilidad/fechas`, `/disponibilidad/horarios` | Fechas y horarios libres para pedir turno  |
| GET/POST/PUT/DELETE | `/agenda`                | Agenda del médico y del operador                         |
| POST   | `/turnos`                             | Pedir / asignar un turno                                 |
| GET    | `/turnos/mis-turnos`, `/turnos/medico`, `/turnos/sede` | Turnos del paciente, del médico y de la sede |
| PATCH  | `/turnos/:id/cancelar`, `/turnos/:id/atender` | Cancelar y atender (con historial clínico)       |
| GET    | `/historial-clinico/paciente/:id`     | Historial clínico                                        |
| GET/POST | `/pacientes`                        | Búsqueda de pacientes y alta por el operador             |
| PUT    | `/pacientes/mis-datos`                | Datos personales del paciente                            |
| GET/POST/PUT | `/usuarios`, `/usuarios/:id`    | Gestión de usuarios                                      |
| GET    | `/notificaciones`, PATCH `/notificaciones/:id/leida` | Campana de notificaciones                 |
| GET    | `/auditoria`                          | Auditoría                                                |
| GET    | `/reportes/*`                         | Indicadores del dashboard                                |

## Cambios hechos en el backend para el frontend

Todos respetan la respuesta `{ codigo, estado, datos }`, están protegidos por rol y documentados en la colección de Postman del backend (carpeta **"Entrega frontend - Cambios del backend"**).

- **Lectura de sedes y especialidades** para cualquier usuario con sesión. El alta, la modificación y la baja siguen siendo del administrador.
- **Nuevos endpoints:**
  - `GET /medicos` (con filtros por especialidad, sede y `con_agenda`) y `GET /medicos/:id`, sin datos personales.
  - `GET /disponibilidad/fechas` y `GET /disponibilidad/horarios`, para paciente y operador. Los turnos duran 30 minutos y solo se devuelven fechas y horas, ningún dato de otros pacientes.
  - `GET /pacientes?busqueda=` (operador, médico y administrador), `POST /pacientes` (alta por el operador, auditada a su nombre) y `PUT /pacientes/mis-datos` (paciente: email, contraseña, teléfono y cobertura).
- **Agenda:**
  - El listado trae los nombres del médico, la especialidad y la sede.
  - Se valida el formato, que la fecha no sea pasada, que la salida sea posterior a la entrada, que la especialidad sea del médico y que no se superponga con otro rango del mismo médico.
  - El operador solo modifica su sede (403).
  - No se puede eliminar un rango con turnos confirmados, ni modificarlo dejando alguno afuera (409).
- **Turnos:**
  - La hora tiene que ser un horario de la grilla de la agenda y se guarda `id_agenda`.
  - Se notifica también al médico.
  - El médico opera sobre sus propios turnos en cualquier sede donde atiende.
  - "Atender" registra el historial clínico en la misma transacción.
- **Usuarios:** listado paginado con filtros por nombre y apellido; especialidades del médico en el alta y la edición. Cada alta y modificación se registra en la auditoría.
- **Auditoría:** filtro por nombre del usuario.
- **Fechas:**
  - Las columnas `DATE` se devuelven como `YYYY-MM-DD`, sin corrimientos por zona horaria.
  - Los mensajes de las notificaciones usan `dd/mm/aaaa`.
  - Los datos de prueba se generan relativos a la fecha de importación, con un médico que atiende en dos sedes y turnos en los tres estados.
