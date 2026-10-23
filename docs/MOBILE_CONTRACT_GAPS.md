# Brechas para integrar el piloto con CONNECT

Este documento registra los datos no detallados que se comunicaron antes de implementar. Las decisiones siguientes requieren acuerdo con el equipo de backend y actualización del OpenAPI antes de activar tráfico real.

| Área | Contrato o decisión faltante | Estado en la app |
| --- | --- | --- |
| Identidad móvil | Issuer por entorno, cliente público `kt-driver-mobile`, redirect URI exacta, scopes, audiencia `kt-api`, registro/revocación de dispositivo, refresh/logout y cambio de tenant | Adaptador PKCE aislado; sin login real |
| Viajes y paradas | Lista/detalle por conductor, estados y transiciones permitidas, versiones, filtros y errores | Datos ficticios y reglas locales |
| POD y archivos | Solicitud de subida, tamaño/MIME, expiración, almacenamiento seguro, asociación a parada y rechazo | Selección de foto local; sin subida |
| Cola y sincronización | Idempotency key, orden, confirmación, reintentos, caducidad y tratamiento de 409/401 | SQLite local; no envía |
| Turnos y GPS | Inicio/fin validado, consentimiento, frecuencia, precisión, batería, endpoint de posiciones y `source_seq` monotónico por dispositivo | Política pura; rastreo desactivado |
| Push | Registro/rotación del token, tipos de mensajes, deep links, consentimiento y logout | No registra token ni solicita permiso |
| SOS | Endpoint, prioridad, confirmación de recepción, geolocalización opcional, duplicados y escalamiento | Pulsación de 2 s; evento local claramente rotulado |
| Reportes de campo | Formularios/códigos de validación, fotos, estados de revisión y permisos | Formularios ficticios con validación básica; sin envío |
| Operación | Identificadores finales de paquete, proyecto EAS, entornos, secretos, políticas de privacidad y retención | Valores provisionales sin credenciales |

## Orden sugerido de integración

1. Publicar contratos OpenAPI de autenticación móvil y CONNECT, con ejemplos de éxito/error y versiones.
2. Activar login y aislamiento de tenant; probar revocación y rotación de refresh en dispositivo real.
3. Sustituir repositorio ficticio por API y probar cola offline/online con idempotencia y conflictos.
4. Agregar subida durable de POD y sincronización de archivos.
5. Activar push, ubicación solo en turno y SOS remoto tras pruebas de permisos, batería y recepción real.
6. Ejecutar piloto con dos conductores, tal como pide KT-012-03, y registrar resultados de batería, pérdida de red y entrega de alertas.

No se deducen endpoints de nombres de módulos del backend: `contracts/openapi/connect.yaml` es la fuente para integrarlos cuando estén disponibles.
