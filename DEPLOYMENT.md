# 🚀 Guía de Despliegue

## Pasos para subir a GitHub y Vercel

### 1. Preparar el repositorio local

```bash
cd "/Volumes/SSD-EXTERNO/code/pumas con cultura2/pumas-con-cultura"
git init
git add .
git commit -m "Initial commit: Plataforma Pumas con Cultura"
```

### 2. Crear repositorio en GitHub

1. Ve a [GitHub](https://github.com) y crea un nuevo repositorio
2. NO inicialices con README, .gitignore o licencia (ya los tenemos)
3. Copia la URL del repositorio

### 3. Subir código a GitHub

```bash
git branch -M main
git remote add origin https://github.com/tu-usuario/pumas-con-cultura.git
git push -u origin main
```

### 4. Desplegar en Vercel

1. Ve a [Vercel](https://vercel.com)
2. Haz clic en "New Project"
3. Importa tu repositorio de GitHub
4. Configura las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`: Tu URL de Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Tu clave anon de Supabase
   - `SUPABASE_SERVICE_ROLE_KEY`: Tu service role key
5. Haz clic en "Deploy"

### 5. Configurar dominio (opcional)

1. En Vercel, ve a Settings → Domains
2. Agrega tu dominio personalizado

## Variables de Entorno en Supabase

Las credenciales de Supabase que necesitas:

```
URL: https://nxzfeumoirqoobzvmyeu.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Verificar el deployment

Después de que Vercel termine el deployment:

1. Visita la URL proporcionada
2. Prueba el login de estudiantes y personal
3. Verifica que los dashboards funcionen correctamente
4. Crea una actividad de prueba

## Problemas comunes

### Error de autenticación
- Verifica que las variables de entorno estén configuradas correctamente
- Asegúrate de que Supabase Auth esté habilitado

### Error 404 en rutas
- Verifica que el middleware.ts esté correctamente configurado
- Revisa que las rutas protegidas tengan el patrón correcto

### Base de datos no conecta
- Verifica las credenciales de Supabase
- Asegúrate de que RLS esté configurado correctamente

## Actualizar el sitio

Cada vez que hagas cambios:

```bash
git add .
git commit -m "Descripción de cambios"
git push origin main
```

Vercel automáticamente detectará los cambios y hará un nuevo deployment.

