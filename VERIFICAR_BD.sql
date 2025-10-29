-- ================================
-- Script para Verificar la Base de Datos
-- Pumas con Cultura
-- ================================

-- 1. Verificar tablas existentes
SELECT 
  table_name as "Tabla",
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as "Columnas"
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('usuarios', 'eventos', 'actividades', 'participaciones', 'ranking', 'logs_escaneo')
ORDER BY table_name;

-- 2. Conteo de registros por tabla
SELECT 'usuarios' as tabla, COUNT(*) as total_registros FROM usuarios
UNION ALL
SELECT 'eventos', COUNT(*) FROM eventos
UNION ALL
SELECT 'actividades', COUNT(*) FROM actividades
UNION ALL
SELECT 'participaciones', COUNT(*) FROM participaciones
UNION ALL
SELECT 'ranking', COUNT(*) FROM ranking
UNION ALL
SELECT 'logs_escaneo', COUNT(*) FROM logs_escaneo;

-- 3. Ver usuarios por rol
SELECT 
  rol,
  COUNT(*) as cantidad,
  json_agg(json_build_object(
    'nombre', nombre || ' ' || apellido_paterno,
    'email', email,
    'grupo', grupo
  )) FILTER (WHERE rol != 'alumno') as usuarios_destacados
FROM usuarios
GROUP BY rol
ORDER BY rol;

-- 4. Ver evento activo
SELECT 
  nombre,
  codigo_evento,
  fecha_inicio,
  fecha_fin,
  estado,
  (SELECT COUNT(*) FROM actividades WHERE evento_id = eventos.id) as total_actividades
FROM eventos
WHERE estado = 'activo';

-- 5. Ver todas las actividades con detalles
SELECT 
  a.nombre as actividad,
  a.clave_actividad as clave,
  a.puntaje as puntos,
  a.estado,
  a.limite_participantes as limite,
  a.ubicacion,
  a.horario_inicio,
  a.horario_fin,
  e.nombre as evento
FROM actividades a
JOIN eventos e ON a.evento_id = e.id
ORDER BY a.puntaje DESC;

-- 6. Verificar que NO haya participaciones aún (debería estar vacío)
SELECT COUNT(*) as participaciones_registradas FROM participaciones;

-- 7. Ver el usuario administrador
SELECT 
  matricula_interna,
  nombre || ' ' || apellido_paterno as nombre_completo,
  email,
  rol,
  activo
FROM usuarios
WHERE rol = 'admin';

-- 8. Ver algunos estudiantes de muestra
SELECT 
  matricula_interna,
  nombre || ' ' || apellido_paterno as nombre_completo,
  email,
  grupo,
  turno,
  activo
FROM usuarios
WHERE rol = 'alumno'
ORDER BY RANDOM()
LIMIT 5;

-- ================================
-- Estado Final
-- ================================
SELECT 
  '✅ Base de datos configurada correctamente' as estado,
  (SELECT COUNT(*) FROM usuarios) as total_usuarios,
  (SELECT COUNT(*) FROM eventos WHERE estado = 'activo') as eventos_activos,
  (SELECT COUNT(*) FROM actividades WHERE estado = 'activa') as actividades_activas;

