# KanTrack Conductor (piloto)

Aplicación móvil independiente para Android e iOS, construida con React Native, Expo y TypeScript. Implementa un **piloto local con datos ficticios** mientras evolucionan los contratos de CONNECT. No representa un sistema de operación real: las entregas, el SOS y las demás acciones no se transmiten.

## Probar en iPhone con Expo Go

Requisitos: Node.js 22.13 o superior, npm, Expo Go para SDK 58 en el iPhone y una cuenta gratuita de Expo. El equipo y el iPhone deben estar en la misma red Wi-Fi. Inicia sesión con la misma cuenta en Expo Go y en la terminal.

```powershell
npm install
npx expo login
npm run start:go
```

Escanea el QR con la Cámara del iPhone. Si la red local impide la conexión, detén el servidor con `Ctrl+C` y ejecuta `npm run start:go -- --tunnel`. El proyecto usa Expo SDK 58; `--go` fuerza la apertura en Expo Go aunque esté instalada la dependencia `expo-dev-client`.

Para verificar el proyecto localmente:

```powershell
npm run typecheck
npm run test:domain
```

El piloto local puede ejecutarse en Expo Go. Las capacidades nativas avanzadas que se activen en el futuro, como rastreo en segundo plano y push remoto, requerirán una **compilación de desarrollo** con EAS o `npx expo run:ios`. `eas.json` incluye perfiles de desarrollo y prueba. Antes de distribuir la app, sustituir los identificadores `com.kantrack.driver` por los definitivos y configurar credenciales de firma y proyecto EAS.

## Qué funciona en el piloto

- Resumen, viajes asignados, secuencia de paradas, llegada, entrega con foto opcional u obligatoria, no entrega con motivo y cierre de viaje.
- Reglas de transición de estados y una sola ruta activa a la vez.
- Cola SQLite por tenant y conductor: persistencia antes de actualizar la pantalla, reproducción al reiniciar, prioridad de SOS en el orden futuro de envío e identificadores para idempotencia.
- Acceso a cámara, galería y mapas mediante acciones explícitas del usuario.
- Formularios locales de combustible, gastos, incidencias e inspecciones, con validación básica y foto opcional.
- SOS local con pulsación sostenida de dos segundos y aviso claro de que **no se envía**.
- Reinicio de datos de demostración.
- Adaptador OIDC/PKCE y política de rastreo preparados como código aislado, sin activación en la UI.

## Límites actuales

La app no autentica a usuarios reales ni consulta o sincroniza con el backend. No activa rastreo, push o SOS remoto. Las fotos se copian al almacenamiento privado local, pero no están cifradas ni subidas al servidor; no constituyen una prueba de entrega remota. SQLite tampoco está cifrada y contiene datos ficticios únicamente. La cola **no debe enviarse** automáticamente cuando aparezcan endpoints: primero se deben cerrar los contratos, la política de reintentos y la seguridad descritos en [MOBILE_CONTRACT_GAPS.md](docs/MOBILE_CONTRACT_GAPS.md).

El alcance y las decisiones se detallan en [ARCHITECTURE.md](docs/ARCHITECTURE.md). Para modificar la interfaz en futuras iteraciones, consulta [UI_COMPONENTS.md](docs/UI_COMPONENTS.md). Los documentos de especificación y roadmap del backend se consultaron sin modificarlos.

## Revisión de dependencias

`npm audit --omit=dev --audit-level=high` detectó cinco entradas de severidad alta por `node-forge` y `zod` transitivos de Expo CLI (`GHSA-86w9-cpqp-85rv` y `GHSA-mrhx-c7xc-m3w5`). La recomendación automática de npm rebaja Expo a SDK 44, por lo que no se aplicó. Estas dependencias deben revisarse antes de distribuir builds; el resultado de `npm audit` no es verde.
