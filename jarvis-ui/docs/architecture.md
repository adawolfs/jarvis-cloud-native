# Arquitectura

## Objetivo

Este proyecto entrega una UI para el agente JARVIS y su MCP principal (k8s).
El foco es mantener la sesion realtime estable y la UI simple.

## Estructura

- `src/app/page.tsx`: entrada principal, compone UI y hook de sesion.
- `src/features/jarvis/agent.ts`: instrucciones y configuracion del agente.
- `src/features/jarvis/guardrails.ts`: guardrails de salida.
- `src/features/jarvis/useJarvisSession.ts`: hook de sesion realtime.
- `src/components/*`: UI reutilizable.
- `src/app/server/token.action.tsx`: crea client secret para realtime.

## Flujo realtime

1. UI llama `connect()` desde `useJarvisSession`.
2. Se obtiene client secret en `token.action.tsx`.
3. `RealtimeSession` conecta y emite eventos.
4. El historial se actualiza via `history_updated`.
5. Guardrails y aprobaciones se resuelven en el hook.

## MCP

El agente JARVIS solo registra MCP `k8s`.
La lista de servers se define en `JARVIS_MCP_SERVER_LABELS`.

## Decisiones clave

- Hook dedicado para sesion: aisla estado realtime.
- Configuracion del agente fuera de la pagina.
- UI simple: solo componentes necesarios.
