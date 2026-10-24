# Rediseño de pantallas

El diseño de referencia se adaptó a los datos y acciones disponibles en la app móvil:

| Pantalla | Implementación |
| --- | --- |
| Inicio | Cabecera de marca con fotografía generada para la app, aviso de demostración, resumen y siguiente viaje. |
| Viajes | Filtros de asignados, en curso e historial; tarjetas con detalle y acción válida para el estado. |
| Detalle de viaje | Resumen, pestañas Paradas e Información, acceso al mapa y acciones del viaje. |
| Mapa | Mapa nativo con ruta y marcadores ilustrativos para los dos viajes de demostración, progreso derivado de las paradas y acceso a reportes. |
| Métricas | Totales y gráfico semanal calculados de viajes, paradas y acciones guardadas localmente. |
| Actividad | Línea de tiempo de acciones locales y sus conflictos. |
| Perfil | Datos de demostración, acceso a reportes, reinicio y selector persistente de modo oscuro. |
| Reportes y parada | Conservan captura de fotos, validación y almacenamiento local con los nuevos componentes visuales. |

La ruta del mapa usa coordenadas de muestra y **no** representa geocodificación precisa ni seguimiento en vivo. La app no pide ubicación para esta vista. El backend todavía no entrega coordenadas de paradas ni posición del conductor. Al llegar ese contrato, el proveedor de datos del mapa debe sustituir `src/infrastructure/demoMapRoutes.ts`.

La preferencia de apariencia usa la instalación existente de `expo-sqlite`. El modo oscuro está disponible en Perfil; se conserva al cerrar y abrir la app. El resto de acciones y reglas permanecen en `src/application`, `src/domain` y `src/infrastructure`.

La imagen `assets/images/driver-hero.png` se generó con la herramienta integrada de imágenes para esta app. Prompt: "Camión de reparto azul marino en una carretera colombiana cerca de Bogotá al amanecer, montañas andinas al fondo, fotografía editorial realista horizontal, camión a la derecha y espacio negativo oscuro a la izquierda para el texto; paleta azul marino y acentos ámbar; sin logos, texto, personas, matrículas legibles ni marcas de agua".
