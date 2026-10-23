# KanTrack Conductor (piloto)

Aplicación móvil independiente para Android e iOS, construida con React Native, Expo y TypeScript. Implementa un **piloto local con datos ficticios** mientras evolucionan los contratos de CONNECT. No representa un sistema de operación real: las entregas, el SOS y las demás acciones no se transmiten.

## Ejecutar

Requisitos: Node.js 22.13 o superior, npm, Android Studio o Xcode, y una compilación de desarrollo de Expo. El SDK de Expo se declara en `package.json`.

```powershell
npm install
npm run typecheck
npm run test:domain
npm start
```

La app usa módulos nativos (SQLite, almacenamiento seguro, cámara, ubicación). Para probar sus capacidades nativas hay que crear un **development build** con EAS o `npx expo run:android` / `npx expo run:ios`; Expo Go puede tener limitaciones de versión y de módulos. `eas.json` incluye perfiles de desarrollo y prueba. Antes de publicar, sustituir los identificadores `com.kantrack.driver` por los definitivos y configurar credenciales de firma y proyecto EAS.

Se fijó Expo SDK 57 para este piloto: SDK 58 se publicó el 15 de octubre de 2026 y todavía exige una compilación de desarrollo para probarlo antes de la actualización de Expo Go en las tiendas. La actualización se puede planificar cuando se estabilicen los contratos y se repitan las pruebas en dispositivos.

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

El alcance y las decisiones se detallan en [ARCHITECTURE.md](docs/ARCHITECTURE.md). Los documentos de especificación y roadmap del backend se consultaron sin modificarlos.

## Revisión de dependencias

`npm audit --omit=dev --audit-level=high` detectó cuatro entradas de severidad alta por `node-forge` transitivo de Expo CLI (`GHSA-86w9-cpqp-85rv`). La recomendación automática de npm rebaja Expo a SDK 44, por lo que no se aplicó. Esta dependencia debe revisarse antes de distribuir builds; el resultado de `npm audit` no es verde.
