# Componentes de interfaz

La interfaz está organizada para que un cambio compartido se haga una vez y aparezca en todas las pantallas que usan el componente.

| Quieres cambiar… | Edita… | Se refleja en… |
| --- | --- | --- |
| Colores, espacios, tipografía y estilos comunes | `src/ui/theme.ts` | Toda la app |
| Preferencia de apariencia clara u oscura | `src/ui/ThemeProvider.tsx` | Toda la app y su siguiente apertura |
| Botones, tarjetas, textos, indicadores, campos y avisos | `src/ui/components.tsx` | Todas las pantallas que los usan |
| Cabecera, pestañas, SOS, tarjetas de viaje/parada, métricas y selección de fotos | `src/ui/widgets.tsx` | Inicio, viajes, mapa, paradas, reportes y estructura global |
| Textos de estados y acciones | `src/ui/labels.ts` | Tarjetas, detalles y actividad |
| Flujo de cámara y galería | `src/ui/usePhotoPicker.ts` | POD y reportes de campo |
| Contenido y acciones de una pantalla | `src/ui/screens/<Pantalla>Screen.tsx` | Solo esa pantalla |
| Navegación entre pestañas y detalles | `App.tsx` | Flujo global |

## Convenciones para nuevas iteraciones

1. Crear la pantalla en `src/ui/screens` y componerla con los componentes compartidos. Evitar `StyleSheet` y colores locales dentro de pantallas.
2. Si un patrón aparece en dos pantallas, moverlo a `components.tsx` o `widgets.tsx`. Los componentes básicos no conocen el dominio; los widgets pueden recibir modelos tipados.
3. Mantener acciones y persistencia en `src/application`, reglas en `src/domain` y APIs/almacenamiento en `src/infrastructure`.
4. Centralizar los textos de estados del dominio en `labels.ts`; el resto de textos de pantalla se migrará a un catálogo de internacionalización cuando exista la política de idiomas.
5. Verificar `npm run typecheck`, `npm run test:domain` y exportar los bundles de Android/iOS tras cambios de UI compartida.

`App.tsx` solo selecciona qué pantalla mostrar y pasa callbacks. El diseño visual vive en el sistema de componentes.
