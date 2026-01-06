# Endpoint: Obtener Agentes Disponibles

## Problema Identificado

Actualmente, cuando un usuario con rol **Administrador** intenta asignar o reasignar solicitudes de tipo "Otro" en la sección de administración, no le aparecen los agentes de área disponibles. Esto ocurre porque la función del frontend usa el endpoint `/api/admin/usuarios`, que está restringido solo para **SuperAdministradores**.

## Solución

Crear un nuevo endpoint específico para obtener agentes de área, accesible tanto para Administradores como para SuperAdministradores.

---

## Especificación del Endpoint

### Ruta

```
GET /api/admin/agentes
```

### Permisos Requeridos

- **Administrador** (rol = 2)
- **SuperAdministrador** (rol = 3)

### Descripción

Retorna una lista de todos los usuarios con rol de **Agente de Área** (rol = 4), independientemente del área a la que pertenezcan.

### Respuesta Exitosa (200 OK)

```json
[
  {
    "id": 5,
    "nombreUsuario": "agente.sistemas",
    "nombre": "Juan Pérez",
    "email": "juan.perez@empresa.com",
    "rol": 4,
    "rolNombre": "Agente de Área",
    "areaId": 1,
    "areaNombre": "Sistemas",
    "activo": true,
    "fechaCreacion": "2024-01-15T10:30:00Z",
    "codigoEmpleado": "EMP-001"
  },
  {
    "id": 8,
    "nombreUsuario": "agente.rrhh",
    "nombre": "María García",
    "email": "maria.garcia@empresa.com",
    "rol": 4,
    "rolNombre": "Agente de Área",
    "areaId": 2,
    "areaNombre": "Recursos Humanos",
    "activo": true,
    "fechaCreacion": "2024-02-20T14:45:00Z",
    "codigoEmpleado": "EMP-008"
  }
]
```

### Campos del Objeto Agente

| Campo            | Tipo             | Descripción                          |
| ---------------- | ---------------- | ------------------------------------ |
| `id`             | `number`         | ID único del usuario                 |
| `nombreUsuario`  | `string`         | Username para login                  |
| `nombre`         | `string`         | Nombre completo del agente           |
| `email`          | `string`         | Correo electrónico                   |
| `rol`            | `number`         | ID del rol (siempre 4 para agentes)  |
| `rolNombre`      | `string`         | Nombre del rol ("Agente de Área")    |
| `areaId`         | `number \| null` | ID del área asignada                 |
| `areaNombre`     | `string \| null` | Nombre del área asignada             |
| `activo`         | `boolean`        | Estado del usuario (activo/inactivo) |
| `fechaCreacion`  | `string`         | Fecha de creación en formato ISO     |
| `codigoEmpleado` | `string`         | Código del empleado (opcional)       |

### Errores Posibles

#### 401 Unauthorized

```json
{
  "mensaje": "Token no válido o expirado"
}
```

#### 403 Forbidden

```json
{
  "mensaje": "No tienes permisos para acceder a este recurso. Requiere rol de Administrador o SuperAdministrador."
}
```

#### 500 Internal Server Error

```json
{
  "mensaje": "Error al obtener agentes",
  "error": "Detalle del error"
}
```

---

## Implementación Recomendada (Backend)

### Ejemplo en Node.js + Express

```javascript
// routes/admin.routes.js
router.get('/agentes',
  authMiddleware,
  roleMiddleware([2, 3]), // Admin o SuperAdmin
  adminController.obtenerAgentes
);

// controllers/admin.controller.js
async obtenerAgentes(req, res) {
  try {
    // Consulta para obtener usuarios con rol = 4 (Agente de Área)
    const agentes = await db.query(`
      SELECT
        u.id,
        u.nombreUsuario,
        u.nombre,
        u.email,
        u.rol,
        r.nombre as rolNombre,
        u.areaId,
        a.nombre as areaNombre,
        u.activo,
        u.fechaCreacion,
        u.codigoEmpleado
      FROM usuarios u
      LEFT JOIN roles r ON u.rol = r.id
      LEFT JOIN areas a ON u.areaId = a.id
      WHERE u.rol = 4
      ORDER BY u.nombre ASC
    `);

    res.json(agentes);
  } catch (error) {
    console.error('Error al obtener agentes:', error);
    res.status(500).json({
      mensaje: 'Error al obtener agentes',
      error: error.message
    });
  }
}
```

### Ejemplo en C# + ASP.NET Core

```csharp
// Controllers/AdminController.cs
[HttpGet("agentes")]
[Authorize(Roles = "Administrador,SuperAdministrador")]
public async Task<IActionResult> ObtenerAgentes()
{
    try
    {
        var agentes = await _context.Usuarios
            .Where(u => u.Rol == 4) // Agentes de Área
            .Include(u => u.RolNavigation)
            .Include(u => u.Area)
            .Select(u => new
            {
                u.Id,
                u.NombreUsuario,
                u.Nombre,
                u.Email,
                u.Rol,
                RolNombre = u.RolNavigation.Nombre,
                u.AreaId,
                AreaNombre = u.Area != null ? u.Area.Nombre : null,
                u.Activo,
                u.FechaCreacion,
                u.CodigoEmpleado
            })
            .OrderBy(u => u.Nombre)
            .ToListAsync();

        return Ok(agentes);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error al obtener agentes");
        return StatusCode(500, new { mensaje = "Error al obtener agentes", error = ex.Message });
    }
}
```

---

## Notas Adicionales

1. **Filtrado en el Frontend**: El frontend ya filtra los agentes por área activa y estado activo, pero es recomendable también aplicar estos filtros en el backend por performance.

2. **Cache**: Considera implementar cache para este endpoint ya que la lista de agentes no cambia frecuentemente.

3. **Paginación**: Si el número de agentes es muy grande, considera añadir paginación al endpoint.

4. **Seguridad**: Asegúrate de validar el token JWT y los roles en el middleware de autenticación.

---

## Testing

### Prueba con cURL (Admin)

```bash
curl -X GET "http://localhost:3000/api/admin/agentes" \
  -H "Authorization: Bearer <token_admin>" \
  -H "Content-Type: application/json"
```

### Prueba con cURL (SuperAdmin)

```bash
curl -X GET "http://localhost:3000/api/admin/agentes" \
  -H "Authorization: Bearer <token_superadmin>" \
  -H "Content-Type: application/json"
```

### Prueba con cURL (Usuario sin permisos)

```bash
curl -X GET "http://localhost:3000/api/admin/agentes" \
  -H "Authorization: Bearer <token_usuario>" \
  -H "Content-Type: application/json"
# Debería retornar 403 Forbidden
```

---

## Checklist de Implementación

- [ ] Crear el endpoint GET `/api/admin/agentes` en el backend
- [ ] Configurar middleware de autenticación
- [ ] Configurar middleware de autorización (roles 2 y 3)
- [ ] Implementar lógica de consulta a la base de datos
- [ ] Incluir joins con tablas de roles y áreas
- [ ] Ordenar resultados por nombre
- [ ] Manejar errores apropiadamente
- [ ] Probar con diferentes roles (Admin, SuperAdmin, Usuario)
- [ ] Verificar que el frontend puede consumir el endpoint
- [ ] Documentar en la API

---

**Fecha de creación**: 6 de enero de 2026  
**Prioridad**: Alta  
**Estado**: Pendiente de implementación en backend
