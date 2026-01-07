SISTEMA DE SOLICITUDES INTERNAS
Manual de Usuario
________________________________________
1. ¿QUÉ ES EL SISTEMA?
El Sistema de Solicitudes Internas es una plataforma web diseñada para gestionar y dar seguimiento a las solicitudes de servicio dentro de una organización (Mesa de Servicios). Permite a los empleados crear solicitudes, asignarlas a diferentes áreas o agentes específicos, y monitorear su progreso hasta su resolución.
________________________________________
2. OBJETIVO DEL SISTEMA
Centralizar y organizar todas las solicitudes de servicio interno de la empresa, facilitando:
•	La comunicación entre solicitantes y gestores
•	El seguimiento del estado de cada solicitud
•	La asignación eficiente de trabajo a las áreas correspondientes
•	El control administrativo de usuarios, áreas y categorías
•	La generación de métricas y reportes
________________________________________
3. ROLES Y NIVELES DE ACCESO
El sistema maneja 4 tipos de usuarios con diferentes privilegios:
3.1 USUARIO (Rol básico)
Permisos:
•	Crear nuevas solicitudes
•	Ver el estado de sus propias solicitudes
•	Agregar comentarios a sus solicitudes
•	Rechazar solicitudes que no estén conformes
Acceso a:
•	Mis Solicitudes
•	Nueva Solicitud
•	Detalle de solicitud


3.2 AGENTE DE ÁREA (Gestor)
Permisos:
•	Todo lo del Usuario básico
•	Ver todas las solicitudes asignadas a su área
•	Asignar solicitudes entre agentes de su área
•	Cambiar el estado de solicitudes (En Proceso, Resuelta)
•	Gestionar solicitudes de su bandeja de área
Acceso a:
•	Mis Solicitudes
•	Nueva Solicitud
•	Bandeja de Área
•	Detalle de solicitud

3.3 ADMINISTRADOR
Permisos:
•	Todo lo del Agente de Área
•	Gestionar usuarios (crear, editar, activar/desactivar)
•	Gestionar áreas (crear, editar, activar/desactivar)
•	Gestionar categorías de solicitudes
•	Asignar solicitudes tipo "Otro" a cualquier agente
•	Ver solicitudes sin asignar
•	Acceder a reportes y métricas generales
Acceso a:
•	Mis Solicitudes
•	Nueva Solicitud
•	Bandeja de Área
•	Administración (panel completo excepto gestión de usuarios)
•	Detalle de solicitud



3.4 SUPER ADMINISTRADOR
Permisos:
•	Control total del sistema
•	Gestión completa de usuarios (incluyendo eliminación)
•	Gestión de áreas y categorías
•	Asignación flexible de solicitudes
•	Acceso a todas las funcionalidades administrativas
Acceso a:
•	Todas las secciones del sistema
•	Panel de Administración completo
________________________________________
4. FUNCIONALIDADES PRINCIPALES
4.1 GESTIÓN DE SOLICITUDES
Crear Nueva Solicitud
1.	Hacer clic en "Nueva Solicitud" en el menú lateral
2.	Seleccionar el tipo de solicitud (categoría)
3.	Ingresar un asunto descriptivo
4.	Escribir una descripción detallada del problema o requerimiento
5.	Seleccionar la prioridad (Baja, Media, Alta)
6.	(Opcional) Adjuntar un archivo de evidencia
7.	Hacer clic en "Enviar Solicitud"
Estados de una solicitud:
•	Nueva: Recién creada, sin asignar
•	En Proceso: Asignada a un gestor y en atención
•	Resuelta: Completada por el gestor
•	Rechazada: El solicitante no está conforme con la solución
Ver Mis Solicitudes
•	Lista de todas las solicitudes creadas por el usuario
•	Filtros por estado (Nueva, En Proceso, Resuelta, Rechazada)
•	Información resumida: número, asunto, estado, prioridad, fecha
•	Clic en cualquier solicitud para ver detalles completos
Detalle de Solicitud
•	Información completa: asunto, descripción, estado, prioridad
•	Datos del solicitante y del gestor asignado
•	Historial de cambios de estado
•	Sección de comentarios para comunicación
•	Archivo adjunto (si existe)
•	Opciones según el rol:
o	Solicitante: Agregar comentarios, rechazar si no conforme
o	Gestor: Cambiar estado, asignar/reasignar, agregar comentarios
o	Admin: Todas las opciones de gestión
4.2 BANDEJA DE ÁREA (Solo Agentes y Admins)
Panel donde los gestores ven todas las solicitudes de su área:
•	Filtros por estado: Nueva, En Proceso, Resuelta, Rechazada
•	Asignación de solicitudes: Reasignar entre agentes del área
•	Gestión de carga de trabajo: Distribuir solicitudes equitativamente
•	Seguimiento: Monitorear el progreso de todas las solicitudes del área
Nota importante: Las solicitudes tipo "Otro" (sin área específica) solo pueden ser asignadas desde el panel de Administración.
4.3 PANEL DE ADMINISTRACIÓN (Solo Admins y Super Admins)
Gestión de Usuarios
•	Crear usuario: Nombre de usuario, nombre completo, email, contraseña, rol, área
•	Editar usuario: Modificar datos, cambiar rol o área
•	Activar/Desactivar: Habilitar o deshabilitar acceso sin eliminar
•	Eliminar usuario: (Solo Super Admin) Con advertencia si tiene solicitudes asignadas
•	Visualización: Lista con estado (activo/inactivo), rol, área asignada
Gestión de Áreas
•	Crear área: Nombre, descripción, estado inicial
•	Editar área: Modificar nombre o descripción
•	Activar/Desactivar:
o	Al desactivar un área, todos sus agentes se desactivan automáticamente
o	Al activar un área, todos sus agentes se reactivan automáticamente
•	Eliminar área: Solo si no tiene usuarios ni solicitudes asignadas
•	Visualización: Cantidad de agentes, estado (activa/inactiva)
Gestión de Categorías (Tipos de Solicitud)
•	Crear categoría: Nombre, descripción, área relacionada
•	Editar categoría: Modificar nombre, descripción o área
•	Eliminar categoría: Solo si no tiene solicitudes asociadas
•	Visualización: Nombre, descripción, área relacionada, cantidad de solicitudes
Solicitudes Sin Asignar
•	Lista de solicitudes tipo "Otro" que no tienen área definida
•	Requieren asignación manual por un administrador
•	Se pueden asignar a cualquier agente de cualquier área
Solicitudes Tipo Otro
•	TODAS las solicitudes tipo "Otro" (asignadas y sin asignar)
•	Permite reasignar solicitudes ya asignadas
•	Vista completa con estado de asignación
•	Gestión centralizada de este tipo especial de solicitudes
Reportes y Métricas
Dashboard con indicadores clave:
•	Total de Solicitudes: Cantidad total en el sistema
•	En Progreso: Solicitudes actualmente en atención
•	Resueltas: Solicitudes completadas exitosamente
•	Rechazadas: Solicitudes no conformes o canceladas
•	Cada métrica muestra el porcentaje respecto al total
Reportes Disponibles (Próximamente):
•	Reporte de Solicitudes por Área
•	Reporte de Desempeño de Agentes
•	Reporte de Tiempos de Respuesta
•	Reporte Mensual Consolidado



________________________________________
5. FLUJOS DE TRABAJO
5.1 FLUJO ESTÁNDAR DE UNA SOLICITUD
1. Usuario crea solicitud
   ↓
2. Sistema la marca como "Nueva"
   ↓
3. Admin/Agente la asigna a un gestor específico
   ↓
4. Gestor la marca como "En Proceso"
   ↓
5. Gestor trabaja en la solución (agrega comentarios)
   ↓
6. Gestor marca como "Resuelta"
   ↓
7. Solicitante revisa y:
   - Acepta (queda Resuelta)
   - Rechaza (vuelve a En Proceso)

5.2 FLUJO PARA SOLICITUDES TIPO "OTRO"
1. Usuario crea solicitud tipo "Otro"
   ↓
2. Aparece en "Sin Asignar" (Administración)
   ↓
3. Administrador revisa y asigna al agente apropiado
   (puede ser de cualquier área)
   ↓
4. Aparece en "Tipo Otro" con estado "Asignada"
   ↓
5. Continúa flujo normal de gestión

5.3 GESTIÓN DE ÁREAS Y AGENTES
ÁREA ACTIVA:
- Todos sus agentes están activos
- Puede recibir solicitudes
- Los agentes pueden trabajar normalmente

DESACTIVAR ÁREA:
- Todos los agentes se desactivan automáticamente
- No se pueden asignar nuevas solicitudes
- Las solicitudes en proceso continúan

ACTIVAR ÁREA:
- Todos los agentes se reactivan automáticamente
- Puede recibir solicitudes nuevamente
- Los agentes recuperan acceso completo

6. CARACTERÍSTICAS ESPECIALES
6.1 Sistema de Comentarios
•	Comunicación bidireccional entre solicitante y gestor
•	Historial completo visible para ambas partes
•	Cada comentario incluye: autor, fecha/hora, rol del usuario
•	Útil para solicitar información adicional o dar actualizaciones
6.2 Niveles de Prioridad
•	Alta (Rojo): Requiere atención urgente
•	Media (Amarillo): Atención en orden normal
•	Baja (Verde): Puede esperar
6.3 Historial de Estados
•	Registro automático de todos los cambios de estado
•	Incluye: fecha/hora, usuario que realizó el cambio, estado anterior y nuevo
•	Auditoría completa del ciclo de vida de la solicitud

6.4 Archivos Adjuntos
•	Permite adjuntar un archivo por solicitud
•	Útil para enviar capturas de pantalla, documentos, evidencias
•	Accesible desde el detalle de la solicitud
6.5 Validaciones Inteligentes
Al eliminar usuarios:
•	Si tiene solicitudes asignadas: requiere confirmación doble
•	Elimina automáticamente: solicitudes desasignadas, comentarios, historial
Al desactivar áreas:
•	Valida que no tenga solicitudes en proceso
•	Si las tiene: muestra advertencia y no permite desactivar
•	Desactiva automáticamente todos los agentes del área
Al asignar solicitudes:
•	Solo muestra agentes activos
•	Solo muestra agentes de áreas activas
•	Solicitudes tipo "Otro" tienen lógica especial de asignación
________________________________________
7. BUENAS PRÁCTICAS DE USO
Para Solicitantes:
1.	Sea específico en el asunto: Use títulos descriptivos
2.	Detalle el problema: Incluya toda la información relevante
3.	Adjunte evidencia: Capturas de pantalla ayudan mucho
4.	Use comentarios: Para agregar información o hacer seguimiento
5.	Revise las resoluciones: Rechace solo si realmente no resuelve el problema
Para Gestores:
1.	Actualice el estado: Marque "En Proceso" cuando empiece a trabajar
2.	Comuníquese: Use comentarios para pedir información o dar actualizaciones
3.	Sea oportuno: Priorice según la urgencia de las solicitudes
4.	Documente la solución: Explique qué se hizo para resolver
5.	Cierre correctamente: Marque como "Resuelta" con comentario final

Para Administradores:
1.	Mantenga áreas activas: Desactive solo cuando sea necesario
2.	Distribuya carga: Asigne solicitudes equitativamente entre agentes
3.	Monitoree métricas: Revise reportes para identificar cuellos de botella
4.	Gestione categorías: Mantenga tipos de solicitud actualizados y relevantes
5.	Revise "Sin Asignar": Asigne rápidamente las solicitudes tipo "Otro"
________________________________________
8. PREGUNTAS FRECUENTES
¿Puedo editar una solicitud después de crearla?
Si, solo si la solicitud todavía esta en estado ¨Nueva¨, sin asignar a ningún gestor.
¿Qué pasa si rechazo una solicitud?
La solicitud vuelve al estado "En Proceso" para que el gestor la atienda nuevamente.
¿Puedo ver solicitudes de otros usuarios?
Los usuarios básicos solo ven sus propias solicitudes. Los gestores ven las de su área. Los admins ven todas.
¿Qué es una solicitud tipo "Otro"?
Es una solicitud que no encaja en ninguna categoría específica con área asignada. Requiere asignación manual por un administrador.
¿Por qué no puedo asignar una solicitud tipo "Otro" desde Bandeja de Área?
Por diseño del sistema, este tipo de solicitudes debe asignarse desde el panel de Administración para mayor control.
¿Qué pasa con las solicitudes de un usuario eliminado?
Las solicitudes quedan sin gestor asignado y aparecen en "Sin Asignar" para reasignación.
¿Puedo recuperar un usuario o área desactivada?
Sí, use el botón "Activar" para reactivarlos sin perder información.
________________________________________
9. SOPORTE Y CONTACTO
Para asistencia técnica o dudas sobre el uso del sistema, contacte a:
•	Administrador del Sistema: [Nombre/Email]
•	Super Administrador: [Nombre/Email]
•	Mesa de Servicios IT: [Email/Extensión]
________________________________________
Versión del documento: 1.0
Fecha de actualización: 7 de enero de 2026
Sistema: Mesa de Servicios - Solicitudes Internas

