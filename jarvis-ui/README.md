# Jarvis UI

Interfaz web para el agente JARVIS con OpenAI Agents SDK y MCP k8s.
La UI principal usa un nucleo sci-fi de particulas y modo debug para historial textual.

## Requisitos

- Node.js 20+
- OPENAI_API_KEY con acceso a realtime

## Inicio rapido

```bash
npm install
npm run dev
```

Abre http://localhost:3000 y presiona "Start J.A.R.V.I.S".

## Configuracion

Variables de entorno:

- `OPENAI_API_KEY`: clave API para crear el client secret de realtime.

MCP configurado:

- `k8s` -> `https://jarvis-mcp.adawolfs.com/sse`

La configuracion del token se encuentra en `src/app/server/token.action.tsx`.

## Scripts

- `npm run dev`: servidor local
- `npm run build`: build de produccion
- `npm run start`: iniciar build
- `npm run lint`: lint
- `npm run build-check`: typecheck
- `npm test`: unit tests (Vitest)
- `npm run test:e2e`: e2e (Playwright)

## Arquitectura

Consulta `docs/architecture.md` y `docs/development-runbook.md`.

## Kubernetes

Secret para desplegar:

```bash
kubectl create secret generic jarvis-ui-secret \
  --from-literal=OPENAI_API_KEY="$OPENAI_API_KEY" \
  --namespace=jarvis-mcp
```
