# Identidad visual de la app

La app usa las paletas clara y oscura de la plataforma web. La referencia es `packages/ui/src/tokens/tokens.css` del proyecto `KanTrackFinal-Hexagonal` (incluido el valor de marca heredado de `:root`). Los colores y estilos de la app están centralizados en `src/ui/theme.ts`; las pantallas consumen componentes compartidos y no definen una paleta propia.

| Uso | Valor | Token web |
| --- | --- | --- |
| Marca y botones principales | `#F99F0C` | `--kt-color-brand` |
| Marca sobre fondo claro y enlaces | `#8A4A00` | `--kt-color-brand-strong` |
| Texto principal | `#0F2540` | `--kt-text` |
| Texto secundario | `#56667D` | `--kt-muted` |
| Fondo de pantalla | `#E8EFF6` | `--kt-surface` |
| Tarjetas y cabecera | `#FFFFFF` | `--kt-surface-raised`, `--kt-surface-topbar` |
| Bordes | `#D4DEEA` | `--kt-border` |
| Éxito | `#E0F4EA` / `#0B5A33` | `--kt-status-success-bg` / `-fg` |
| Aviso | `#FDEFCF` / `#6A4200` | `--kt-status-warning-bg` / `-fg` |
| Información | `#E6F2FF` / `#084D87` | `--kt-status-info-bg` / `-fg` |
| Error | `#FCE6E8` / `#8A1C2A` | `--kt-status-danger-bg` / `-fg` |

La paleta oscura usa fondo `#0A1626`, superficies `#102039`, texto `#E8EEF8`, borde `#2A4465` y naranja de marca `#F99F0C`, de los mismos tokens web. `ThemeProvider` aplica la paleta a todos los componentes. El interruptor en Perfil guarda la preferencia con `expo-sqlite/kv-store` y sincroniza el estilo de la interfaz nativa.

El logo entregado se conserva en `assets/brand/kantrack-mark.png`. El componente reutilizable `BrandLogo` lo presenta en la cabecera; `app.json` lo declara como icono para la app compilada. Expo Go mantiene el icono de Expo Go en la pantalla de inicio del iPhone.

El rediseño compone componentes compartidos y conserva las reglas de negocio, los contratos y la persistencia de las acciones en sus módulos existentes.
