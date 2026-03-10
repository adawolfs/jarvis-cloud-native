# Development Runbook

## Setup local

```bash
npm install
npm run dev
```

Define `OPENAI_API_KEY` en tu entorno.

## Tests

- Unit tests: `npm test`
- E2E: `npx playwright test`
- Typecheck: `npm run build-check`
- Lint: `npm run lint`

## Agregar o cambiar MCP

1. Actualiza `JARVIS_MCP_SERVER_LABELS` en `src/features/jarvis/agent.ts`.
2. Ajusta `tools` en `src/app/server/token.action.tsx`.
3. Ejecuta tests y build-check.

## Troubleshooting

- Error de token: verifica `OPENAI_API_KEY`.
- Audio no funciona: revisa permisos del navegador.
- MCP sin respuesta: valida la URL del server y su disponibilidad.
