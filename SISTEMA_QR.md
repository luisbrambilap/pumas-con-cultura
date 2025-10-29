# Sistema de Códigos QR - Pumas con Cultura

## 📱 Descripción General

El sistema implementa dos tipos de códigos QR:

1. **QR de Actividad** - Los estudiantes escanean para registrar su participación
2. **QR de Estudiante** - Los responsables escanean para validar la identidad del estudiante

---

## 🏗️ Arquitectura Implementada

### APIs Creadas

#### 1. `/api/actividades/generar-qr` (POST)
- **Propósito**: Genera código QR para una actividad
- **Input**: `{ actividad_id: string }`
- **Output**: `{ qr_code_url: string, participacion_url: string }`
- **Seguridad**: Requiere autenticación
- **Proceso**:
  1. Valida autenticación del usuario
  2. Obtiene datos de la actividad
  3. Genera URL de participación (`/a/{clave_actividad}`)
  4. Crea QR como Data URL
  5. Actualiza la actividad con el QR generado

#### 2. `/api/usuarios/generar-qr` (POST)
- **Propósito**: Genera código QR para un estudiante
- **Input**: Ninguno (usa sesión del usuario)
- **Output**: `{ qr_code_url: string }`
- **Seguridad**: Requiere autenticación
- **Proceso**:
  1. Valida autenticación del usuario
  2. Obtiene datos del usuario
  3. Crea objeto JSON con información del estudiante
  4. Genera QR con los datos del estudiante
  5. Actualiza el usuario con el QR generado

---

### Páginas Creadas

#### `/a/[clave]/page.tsx` - Página de Participación
- **Propósito**: Permite a los estudiantes registrar su participación al escanear el QR de una actividad
- **Funcionalidades**:
  - Carga datos de la actividad usando la clave
  - Verifica autenticación del estudiante
  - Maneja límite de participantes
  - Permite subir evidencia (foto/video/documento)
  - Registra participación con estado pendiente o validada
  - Guarda logs de escaneo
  - Redirige al dashboard después del registro

---

### Componentes Creados

#### `components/QRDisplay.tsx`
- **Propósito**: Muestra y gestiona el QR de una actividad
- **Props**:
  - `actividadId`: ID de la actividad
  - `claveActividad`: Código de la actividad
  - `qrCodeUrl`: URL del QR existente (opcional)
  - `onQRGenerated`: Callback al generar QR (opcional)
- **Funcionalidades**:
  - Genera QR si no existe
  - Descarga QR como imagen
  - Imprime QR en formato optimizado
  - Regenera QR si es necesario
  - Manejo de estados (loading, error)

#### `components/GenerarQREstudiante.tsx`
- **Propósito**: Botón para generar el QR personal del estudiante
- **Props**:
  - `onQRGenerated`: Callback al generar QR (opcional)
- **Funcionalidades**:
  - Llama a la API de generación
  - Recarga la página para mostrar el QR
  - Manejo de errores
  - Estado de carga

---

## 🔧 Configuración Necesaria

### Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Application URL (used for QR code generation)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ Importante**: En producción, cambia `NEXT_PUBLIC_APP_URL` a tu dominio real.

### Dependencias Instaladas

```json
{
  "qrcode": "^1.5.4",
  "@types/qrcode": "^1.5.5"
}
```

---

## 📊 Flujo de Uso

### Flujo de Actividad (QR de Actividad)

1. **Admin/Responsable crea actividad** en `/dashboard/super-admin/actividades/crear`
2. **Admin genera QR de la actividad** usando el componente `QRDisplay`
3. **Admin imprime o proyecta el QR** en el evento
4. **Estudiante escanea el QR** con su celular
5. **Sistema abre** `/a/{clave_actividad}` en el navegador
6. **Estudiante confirma participación** (opcionalmente sube evidencia)
7. **Sistema registra participación**:
   - Si requiere validación: estado `pendiente`
   - Si no requiere validación: estado `validada` + puntos otorgados
8. **Sistema guarda log de escaneo**
9. **Estudiante es redirigido** a su dashboard

### Flujo de Estudiante (QR de Estudiante)

1. **Estudiante ingresa** a su dashboard
2. **Estudiante genera su QR personal** (si no existe)
3. **Responsable escanea el QR del estudiante** (funcionalidad futura)
4. **Sistema valida identidad** y permite registro manual

---

## 🎨 Características del QR Generado

### Configuración Técnica

```typescript
{
  width: 500,           // 500x500 píxeles
  margin: 2,            // Margen de 2 módulos
  color: {
    dark: '#003366',    // Azul UNAM
    light: '#FFFFFF'    // Fondo blanco
  }
}
```

### Formato de Salida
- **Tipo**: Data URL (base64)
- **Formato**: PNG
- **Almacenamiento**: En la base de datos (campo `qr_code_url`)

---

## 🔒 Seguridad

### Validaciones Implementadas

1. **Autenticación requerida** en todas las APIs
2. **Verificación de rol** para acciones sensibles
3. **Validación de límite de participantes**
4. **Prevención de registros duplicados** (si `registro_multiple = false`)
5. **Logs de escaneo** para auditoría

### Datos en QR de Estudiante

```json
{
  "id": "uuid-del-usuario",
  "folio": "DM25-MATRICULA-NOMBRE-APELLIDO",
  "matricula": "B202500000000010",
  "nombre": "Juan Pérez",
  "grupo": "1A"
}
```

---

## 📝 Tablas de Base de Datos Utilizadas

### `actividades`
- `qr_code_url`: Almacena el QR generado
- `clave_actividad`: Código único para la URL

### `usuarios`
- `qr_code_url`: Almacena el QR personal del estudiante
- `folio_unico`: Identificador único del estudiante

### `participaciones`
- `metodo_registro`: 'qr' cuando se usa escaneo
- `estado`: 'pendiente' o 'validada'
- `evidencia_url`: URL de la evidencia subida (opcional)

### `logs_escaneo`
- `tipo_escaneo`: 'actividad' o 'estudiante'
- `exitoso`: true/false
- `razon_fallo`: Mensaje de error si falla

---

## 🚀 Próximos Pasos / Mejoras Futuras

1. **Escáner de QR de Estudiante**
   - Componente para que responsables escaneen QR de estudiantes
   - Validación en tiempo real de identidad
   - Registro rápido de participación

2. **Estadísticas de Escaneos**
   - Dashboard de análisis de escaneos
   - Horarios pico de participación
   - Detección de QR fraudulentos

3. **QR Dinámicos**
   - QR con expiración temporal
   - QR con límite de usos
   - QR geolocalizado (solo funciona en el lugar del evento)

4. **App Móvil Nativa**
   - Escaneo más rápido
   - Notificaciones push
   - Funcionamiento offline

5. **Impresión en Lote**
   - Generar múltiples QR de actividades
   - Plantillas de impresión personalizadas
   - Exportar a PDF

---

## 🐛 Troubleshooting

### Error: "QR no se genera"
- **Verificar** que `NEXT_PUBLIC_APP_URL` esté configurado
- **Verificar** que el usuario esté autenticado
- **Revisar** logs del servidor

### Error: "Actividad no encontrada"
- **Verificar** que la clave de actividad sea correcta
- **Verificar** que la actividad esté activa
- **Revisar** que la URL sea correcta

### Error: "Ya te has registrado"
- **Normal** si `registro_multiple = false`
- **Solución**: Cambiar configuración de la actividad o usar otra cuenta

### QR no se descarga
- **Verificar** que el navegador permita descargas
- **Intentar** con otro navegador
- **Usar** botón de imprimir como alternativa

---

## 📞 Soporte

Para reportar bugs o sugerir mejoras:
1. Crear issue en el repositorio
2. Incluir capturas de pantalla
3. Incluir logs de consola (si aplica)
4. Describir pasos para reproducir el error

---

## ✅ Checklist de Implementación

- [x] Instalar librería qrcode
- [x] Crear API de generación de QR de actividades
- [x] Crear API de generación de QR de estudiantes
- [x] Crear página de participación (`/a/[clave]`)
- [x] Crear componente QRDisplay
- [x] Crear componente GenerarQREstudiante
- [x] Integrar en dashboard de estudiante
- [ ] Configurar variables de entorno en producción
- [ ] Crear bucket de Storage para evidencias
- [ ] Implementar escáner de QR de estudiantes
- [ ] Agregar al dashboard de admin

---

## 📚 Referencias

- [qrcode npm package](https://www.npmjs.com/package/qrcode)
- [Next.js Dynamic Routes](https://nextjs.org/docs/routing/dynamic-routes)
- [Supabase Storage](https://supabase.com/docs/guides/storage)

