#  Pumas con Cultura

Sistema de gestión de actividades culturales para preparatoria.

##  Características

- **Sistema de autenticación separado** para estudiantes y personal
- **3 tipos de roles**: Estudiantes, Administradores (Responsables) y Super Administradores
- **Sistema dual de QR**: Cada alumno tiene su QR personal y cada actividad tiene su propio QR
- **Gestión de actividades**: Creación, edición y asignación de actividades culturales
- **Sistema de puntos y ranking**: Los estudiantes acumulan puntos por participar
- **Validación de participaciones**: Los responsables pueden validar participaciones escaneando QR o manualmente
- **Dashboards personalizados** para cada tipo de usuario

##  Requisitos

- Node.js 18+ 
- Cuenta de Supabase
- Cuenta de Vercel (para deployment)

##  Instalación

1. Clonar el repositorio:
```bash
git clone <tu-repositorio>
cd pumas-con-cultura
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
Crea un archivo `.env.local` en la raíz del proyecto con:
```env
NEXT_PUBLIC_SUPABASE_URL=tu-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

4. Ejecutar en modo desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

##  Estructura del Proyecto

```
pumas-con-cultura/
├── app/
│   ├── auth/
│   │   ├── login/
│   │   │   ├── estudiante/    # Login para estudiantes
│   │   │   └── personal/       # Login para personal
│   │   └── register/
│   │       └── estudiante/     # Registro de estudiantes
│   ├── dashboard/
│   │   ├── estudiante/         # Dashboard de estudiante
│   │   ├── admin/              # Dashboard de admin/responsable
│   │   └── super-admin/        # Dashboard de super admin
│   └── page.tsx                # Página principal
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Cliente de Supabase
│   │   ├── server.ts           # Servidor de Supabase
│   │   └── middleware.ts       # Middleware de autenticación
│   └── types.ts                # Tipos TypeScript
└── middleware.ts               # Middleware global
```

##  Roles y Permisos

### Estudiantes (alumno)
- Ver actividades disponibles
- Participar en actividades escaneando QR o ingresando clave
- Ver su ranking y puntos
- Ver historial de participaciones
- Acceso a su QR personal

### Administradores/Responsables (admin/responsable)
- Ver actividades asignadas
- Validar participaciones pendientes
- Escanear QR de estudiantes
- Registrar participaciones manualmente
- Ver estadísticas de sus actividades

### Super Administradores (admin)
- Todas las funciones de administrador +
- Crear y gestionar eventos
- Crear y asignar actividades
- Ver ranking completo
- Gestionar usuarios
- Acceso a reportes y estadísticas globales

##  Autenticación

El sistema utiliza Supabase Auth con logins separados:

- **Estudiantes**: `/auth/login/estudiante`
- **Personal**: `/auth/login/personal`

El middleware verifica el rol del usuario y redirige al dashboard correspondiente.

##  Base de Datos

El esquema de la base de datos incluye las siguientes tablas principales:

- `usuarios`: Información de todos los usuarios (estudiantes y personal)
- `eventos`: Eventos culturales
- `actividades`: Actividades dentro de los eventos
- `participaciones`: Registro de participaciones de estudiantes
- `ranking`: Clasificación de estudiantes por puntos
- `logs_escaneo`: Registro de todos los escaneos de QR

##  Deployment en Vercel

1. Push del código a GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <tu-repositorio>
git push -u origin main
```

2. Conectar con Vercel:
   - Ir a [vercel.com](https://vercel.com)
   - Importar el repositorio de GitHub
   - Configurar las variables de entorno
   - Hacer deploy

##  Uso del Sistema

### Para Estudiantes
1. Registrarse con matrícula y datos personales
2. Iniciar sesión
3. Ver actividades disponibles
4. Participar escaneando el QR de la actividad o ingresando la clave
5. Esperar validación del responsable (si aplica)
6. Ver puntos acumulados en el dashboard

### Para Responsables
1. Iniciar sesión con credenciales de personal
2. Ver actividades asignadas
3. Validar participaciones pendientes
4. Escanear QR de estudiantes para registro directo
5. Registrar participaciones manualmente

### Para Super Administradores
1. Crear eventos (Ej: Festival Día de Muertos)
2. Crear actividades dentro de eventos
3. Asignar responsables a las actividades
4. Monitorear el ranking general
5. Ver reportes y estadísticas

##  Contribuir

Este proyecto fue creado para la Preparatoria [Nombre]. Para contribuir o reportar problemas, contacta al equipo de desarrollo.

##  Licencia

Este proyecto es de uso interno para [Nombre de la Institución].
