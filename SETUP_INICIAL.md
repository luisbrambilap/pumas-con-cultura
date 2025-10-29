# 🚀 Setup Inicial - Pumas con Cultura

## ✅ Estado Actual de la Base de Datos

La base de datos está **100% lista y configurada** en Supabase con:

- ✅ **Todas las tablas creadas** (usuarios, eventos, actividades, participaciones, ranking, logs_escaneo)
- ✅ **Todos los tipos ENUM creados** (roles, estados, métodos de registro, etc.)
- ✅ **146 usuarios registrados**:
  - 145 estudiantes importados desde el CSV
  - 1 usuario Super Administrador
- ✅ **1 evento activo**: Festival Día de Muertos 2025 (código: DM25)
- ✅ **5 actividades creadas** para el evento:
  - 🎭 Concurso de Catrines y Catrinas (50 pts) - `DM25-CAT-001`
  - 🏺 Taller de Elaboración de Ofrendas (30 pts) - `DM25-TAL-001`
  - 📷 Exposición Fotográfica (20 pts) - `DM25-EXP-001`
  - 🕯️ Concurso de Altares por Grupo (100 pts) - `DM25-ALT-001`
  - 📚 Conferencia sobre Tradiciones (25 pts) - `DM25-CONF-001`

## 📝 Próximos Pasos IMPORTANTES

### 1. Crear Usuario Administrador en Supabase Auth

El usuario administrador ya está en la base de datos, pero necesitas crear su cuenta en Supabase Auth:

**Opción A: Desde la app (Recomendado)**
1. Ir a: `http://localhost:3000/auth/register/estudiante`
2. Registrarte con estos datos:
   - **Email**: `admin@pumasconcultura.edu`
   - **Matrícula interna**: `ADMIN001`
   - **CURP**: `ADSI900101HDFLRS00`
   - **Nombre**: `Administrador`
   - **Apellido Paterno**: `Sistema`
   - **Apellido Materno**: `Pumas`
   - **Grupo**: `FM`
   - **Turno**: `Matutino`
   - **Contraseña**: (la que tú elijas)

**Opción B: Desde Supabase Dashboard**
1. Ir a: https://supabase.com/dashboard/project/nxzfeumoirqoobzvmyeu/auth/users
2. Clic en "Add user" → "Create new user"
3. Ingresar:
   - Email: `admin@pumasconcultura.edu`
   - Password: (la que elijas)
   - Confirm email: ✓ (marcar)

### 2. Conectar Supabase Auth con la tabla usuarios

Después de crear el usuario en Auth, necesitas actualizar el ID:

```sql
-- Ejecutar en SQL Editor de Supabase
UPDATE usuarios 
SET id = (SELECT id FROM auth.users WHERE email = 'admin@pumasconcultura.edu')
WHERE email = 'admin@pumasconcultura.edu';
```

### 3. Iniciar la Aplicación

```bash
cd "/Volumes/SSD-EXTERNO/code/pumas con cultura2/pumas-con-cultura"
npm run dev
```

Abrir: `http://localhost:3000`

### 4. Iniciar Sesión como Admin

1. Ir a "Personal" → "Iniciar Sesión"
2. Ingresar:
   - Email: `admin@pumasconcultura.edu`
   - Contraseña: (la que configuraste)
3. Deberías entrar al Panel de Super Administrador

---

## 📊 Datos Actuales en la Base de Datos

### Usuarios
- **Total**: 145 estudiantes + 1 administrador
- **Grupos**: 1A, 2A, 3 Humanidades, FM
- **Todos con rol**: `alumno` (excepto el admin)

### Evento Creado
- **Nombre**: Festival Día de Muertos 2025
- **Código**: DM25
- **Fechas**: 1-3 de Noviembre 2025
- **Estado**: Activo

---

## 🔐 Crear Más Usuarios (Opcional)

### Crear un Responsable de Actividad

Si necesitas crear un usuario con rol de responsable:

```sql
-- Ejecutar en SQL Editor de Supabase
INSERT INTO usuarios (
  matricula_externa,
  matricula_interna,
  nombre,
  apellido_paterno,
  email,
  grupo,
  ciclo_escolar,
  turno,
  rol,
  folio_unico,
  activo,
  curp
) VALUES (
  'RESP001',
  'RESP001',
  'María',
  'González',
  'maria.gonzalez@pumasconcultura.edu',
  'FM',
  '2025',
  'Matutino',
  'responsable',
  'RESP-001-MARIA',
  true,
  'GOMA850505MDFLNR00'
);
```

Luego crear su cuenta en Supabase Auth con el mismo email.

---

## 🎯 Flujo Recomendado para Empezar

1. ✅ **Crear cuenta de admin** en Supabase Auth
2. ✅ **Iniciar sesión** como admin
3. ✅ **Crear 2-3 actividades** de ejemplo para el Festival Día de Muertos
4. ✅ **Registrar un estudiante** de prueba desde la app
5. ✅ **Hacer que el estudiante participe** en una actividad
6. ✅ **Validar la participación** como responsable
7. ✅ **Ver el ranking** actualizado

---

## 🐛 Solución de Problemas

### Error: "No autorizado" al iniciar sesión como admin

**Causa**: El usuario en Auth no está conectado con la tabla usuarios.

**Solución**:
```sql
-- Ver los IDs
SELECT id, email FROM auth.users WHERE email = 'admin@pumasconcultura.edu';
SELECT id, email, rol FROM usuarios WHERE email = 'admin@pumasconcultura.edu';

-- Si no coinciden, actualizar:
UPDATE usuarios 
SET id = (SELECT id FROM auth.users WHERE email = 'admin@pumasconcultura.edu')
WHERE email = 'admin@pumasconcultura.edu';
```

### Los estudiantes del CSV no pueden iniciar sesión

**Causa**: Los estudiantes están en la tabla `usuarios` pero no en Supabase Auth.

**Solución**: Cada estudiante debe registrarse por primera vez usando el formulario de registro, o puedes crear sus cuentas masivamente en Supabase Auth.

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs de Supabase: https://supabase.com/dashboard/project/nxzfeumoirqoobzvmyeu/logs/explorer
2. Verifica que las variables de entorno estén configuradas en `.env.local`
3. Revisa la consola del navegador para errores de JavaScript

---

**¡Todo listo para empezar a usar la plataforma! 🎉**

