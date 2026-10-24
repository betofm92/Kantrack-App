# Identidad visual de la app

La app usa la paleta clara predeterminada de la plataforma web. La referencia es `packages/ui/src/tokens/tokens.css` del proyecto `KanTrackFinal-Hexagonal` (incluido el valor de marca heredado de `:root`). Los colores de la app están centralizados en `src/ui/theme.ts`; las pantallas consumen componentes compartidos y no definen una paleta propia.

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

El logo entregado se conserva en `assets/brand/kantrack-mark.png`. El componente reutilizable `BrandLogo` lo presenta en la cabecera; `app.json` lo declara como icono para la app compilada. Expo Go mantiene el icono de Expo Go en la pantalla de inicio del iPhone.

Este cambio afecta la presentación visual. Los flujos, datos, contratos y acciones de la aplicación siguen en sus módulos existentes.
