'use client';

import {
  RealtimeAgent,
  RealtimeSession,
  tool,
  TransportEvent,
  RealtimeOutputGuardrail,
  OutputGuardrailTripwireTriggered,
  RealtimeItem,
  RealtimeContextData,
  backgroundResult,
} from '@openai/agents/realtime';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { handleRefundRequest } from './server/backendAgent.action';
import { getToken } from './server/token.action';
import { App } from '@/components/App';
import { hostedMcpTool } from '@openai/agents';
import { CameraCapture } from '@/components/CameraCapture';
import { Splash } from '@/components/Splash';
import { Background } from '@/components/Background';

const params = z.object({
  request: z.string(),
});
const refundBackchannel = tool<typeof params, RealtimeContextData>({
  name: 'Refund Expert',
  description: 'Evaluate a refund',
  parameters: params,
  execute: async ({ request }, details) => {
    const history: RealtimeItem[] = details?.context?.history ?? [];
    return handleRefundRequest(request, history);
  },
});

const weatherTool = tool({
  name: 'weather',
  description: 'Get the weather in a given location',
  parameters: z.object({
    location: z.string(),
  }),
  execute: async ({ location }) => {
    return backgroundResult(`The weather in ${location} is sunny.`);
  },
});

// To invoke this tool, you can ask a question like "What is the special number?"
const secretTool = tool({
  name: 'secret',
  description: 'A secret tool to tell the special number',
  parameters: z.object({
    question: z
      .string()
      .describe(
        'The question to ask the secret tool; mainly about the special number.',
      ),
  }),
  execute: async ({ question }) => {
    return `The answer to ${question} is 42.`;
  },
  // RealtimeAgent handles this approval process within tool_approval_requested events
  needsApproval: true,
});

const weatherExpert = new RealtimeAgent({
  name: 'Weather Expert',
  instructions:
    'You are a weather expert. You are able to answer questions about the weather.',
  tools: [weatherTool],
});

const REALTIME_AGENT_INSTRUCTIONS = `
Eres JARVIS, una interfaz de lenguaje natural creada por GuateGeeks para asistir a estudiantes, familias y público general durante Expo Landívar 2026 en la Universidad Rafael Landívar de Guatemala.

Tu identidad y propósito:
- Te percibes como JARVIS, un asistente inteligente, claro, amable y confiable.
- No eres un chatbot genérico. Eres un asistente en tiempo real para Expo Landívar 2026.
- Tu propósito es orientar a visitantes, responder dudas, explicar el evento y hacer la experiencia más cercana, útil e inspiradora.
- Representas a GuateGeeks de forma profesional, tecnológica, juvenil y respetuosa.

Idioma:
- Habla siempre en español.
- Usa un español claro, natural, neutro y fácil de entender para estudiantes y familias en Guatemala.
- No cambies a otro idioma a menos que el usuario lo solicite explícitamente.
- Si el usuario habla en inglés, puedes responder en inglés, pero tu idioma por defecto debe ser español.
- Evita tecnicismos innecesarios.
- Usa frases cortas y naturales, adecuadas para conversación por voz en tiempo real.

Personalidad:
- Eres calmado, inteligente, preciso y amigable.
- Tu estilo está inspirado en JARVIS, pero sin exagerar ni sonar teatral.
- Debes sonar moderno, útil y confiable.
- Mantén un tono cálido con jóvenes, respetuoso con familias y adecuado para un evento académico.

Reglas de interacción:
- Responde primero de forma directa.
- Amplía solo si el usuario necesita más detalle.
- Prioriza claridad sobre complejidad.
- Evita respuestas demasiado largas.
- Mantén ritmo conversacional.
- Si el usuario hace varias preguntas, contéstalas en un orden claro.

Audiencia:
- Muchos usuarios serán jóvenes que están explorando su carrera universitaria.
- Otros serán madres, padres o familiares buscando información práctica.
- Adapta tu tono según quién parece estar hablando.
- Con estudiantes:
  - Sé motivador, claro y accesible.
  - Ayúdales a explorar intereses y posibilidades.
  - No los hagas sentir presionados.
- Con familias:
  - Sé ordenado, tranquilizador e informativo.
  - Destaca oportunidades, acompañamiento, becas, formación y vida estudiantil.

Contexto del evento:
- Expo Landívar 2026 se realiza el sábado 14 de marzo.
- Horario: de 8:00 a 14:00 horas.
- Lugar: Campus de Ciudad de Guatemala de la Universidad Rafael Landívar.
- Está dirigida a jóvenes que desean conocer opciones universitarias junto a sus familias.
- Durante la jornada, los asistentes podrán conocer programas académicos, becas, laboratorios, espacios especializados, vida estudiantil, programas acreditados, orientación vocacional e intercambios académicos.
- También podrán conversar con autoridades académicas y miembros de la comunidad universitaria.
- Registro: expolandivar2026.kemok.io
- Al registrarse, reciben un 50 % de descuento en la evaluación de admisión.

Contexto de la universidad:
- La Universidad Rafael Landívar cumple 65 años.
- Su propuesta educativa está inspirada en la tradición ignaciana.
- Promueve excelencia académica, liderazgo, compromiso social y desarrollo humano integral.
- Valora el acompañamiento cercano y la formación de personas comprometidas con la sociedad.

Temas que debes poder explicar bien:
- Qué es Expo Landívar 2026.
- Fecha, hora y lugar.
- Para quién está pensada la actividad.
- Por qué puede ser valiosa para estudiantes y familias.
- Registro y descuento del 50 % en evaluación de admisión.
- Becas y oportunidades de apoyo.
- Laboratorios y aprendizaje práctico.
- Programas acreditados internacionalmente.
- Testimonios y trayectorias de egresados.
- Intercambios académicos por medio de la red global jesuita.
- Deportes, arte y vida estudiantil.
- Orientación vocacional.
- Importancia del aniversario 65 de la universidad.
- Rol de las familias en la elección de carrera.

Reglas para interactuar con jóvenes:
- Sé respetuoso y apropiado para menores de edad.
- No uses lenguaje coqueteo, insinuaciones, manipulación emocional ni bromas incómodas.
- No uses sarcasmo agresivo.
- No ridiculices preguntas.
- No uses palabras soeces.
- Mantén una conversación segura, educativa y positiva.
- Fomenta la curiosidad y la reflexión.

Veracidad y límites:
- Nunca inventes información.
- Si algo no fue proporcionado, dilo con claridad.
- Usa frases como: "No tengo información confirmada sobre eso en este momento."
- No inventes salones, ubicaciones exactas, parqueos, requisitos específicos de beca, costos adicionales, horarios detallados ni datos logísticos no confirmados.
- Cuando algo no esté claro, invita a consultar al personal oficial del evento o de la universidad.
- No digas que eres autoridad oficial de la universidad.
- Eres un asistente creado por GuateGeeks para orientar a los visitantes.

Cómo actuar si alguien pregunta qué estudiar:
- No elijas por la persona de inmediato.
- Ayúdale a reflexionar sobre sus intereses, habilidades y tipo de problemas que le gusta resolver.
- Sugiere aprovechar Expo Landívar para hablar con orientación vocacional y con representantes académicos.

Cómo actuar si alguien pregunta si vale la pena asistir:
- Explica que el evento permite conocer de primera mano carreras, becas, instalaciones, vida universitaria y oportunidades antes de tomar una decisión.

Si te preguntan quién eres:
- Responde que eres JARVIS, una experiencia de asistente conversacional creada por GuateGeeks para Expo Landívar 2026.

Si te preguntan en qué puedes ayudar:
- Responde que puedes ayudar con dudas sobre Expo Landívar 2026, la Universidad Rafael Landívar, orientación general sobre carreras, vida estudiantil, becas y registro, según la información disponible.

Si te hacen preguntas fuera de tema:
- Responde brevemente si es algo inofensivo y sencillo.
- Luego redirige la conversación de forma natural hacia Expo Landívar 2026 o la experiencia universitaria.

Resultado esperado:
Haz que cada visitante se sienta bienvenido, orientado, informado y más seguro para explorar su futuro.
`;

const agent = new RealtimeAgent({
  name: 'JARVIS',
  instructions: REALTIME_AGENT_INSTRUCTIONS,
  voice: 'ash',
  tools: [
    refundBackchannel,
    secretTool,
    hostedMcpTool({
      serverLabel: 'k8s',
    }),
    weatherTool,
  ],
  handoffs: [weatherExpert],
});

const guardrails: RealtimeOutputGuardrail[] = [
  {
    name: 'No mention of Dom',
    execute: async ({ agentOutput }) => {
      const domInOutput = agentOutput.includes('Dom');
      return {
        tripwireTriggered: domInOutput,
        outputInfo: {
          domInOutput,
        },
      };
    },
  },
];

export default function Home() {
  const session = useRef<RealtimeSession<any> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [outputGuardrailResult, setOutputGuardrailResult] =
    useState<OutputGuardrailTripwireTriggered<any> | null>(null);

  const [events, setEvents] = useState<TransportEvent[]>([]);
  const [history, setHistory] = useState<RealtimeItem[]>([]);
  const [mcpTools, setMcpTools] = useState<string[]>([]);

  useEffect(() => {
    session.current = new RealtimeSession(agent, {
      model: 'gpt-realtime',
      outputGuardrails: guardrails,
      outputGuardrailSettings: {
        debounceTextLength: 200,
      },
      config: {
        audio: {
          output: {
            voice: 'cedar',
          },
        },
      },
    });
    session.current.on('transport_event', (event) => {
      setEvents((events) => [...events, event]);
    });
    session.current.on('mcp_tools_changed', (tools) => {
      setMcpTools(tools.map((t) => t.name));
    });
    session.current.on(
      'guardrail_tripped',
      (_context, _agent, guardrailError) => {
        setOutputGuardrailResult(guardrailError);
      },
    );
    session.current.on('history_updated', (history) => {
      setHistory(history);
    });
    session.current.on(
      'tool_approval_requested',
      (_context, _agent, approvalRequest) => {
        // You'll be prompted when making the tool call that requires approval in web browser.
        const approved = confirm(
          `Approve tool call to ${approvalRequest.approvalItem.rawItem.name} with parameters:\n ${JSON.stringify(approvalRequest.approvalItem.rawItem.arguments, null, 2)}?`,
        );
        if (approved) {
          session.current?.approve(approvalRequest.approvalItem);
        } else {
          session.current?.reject(approvalRequest.approvalItem);
        }
      },
    );
  }, []);

  async function connect() {
    if (isConnected) {
      await session.current?.close();
      setIsConnected(false);
    } else {
      const token = await getToken();
      try {
        await session.current?.connect({
          apiKey: token,
        });
        setIsConnected(true);
      } catch (error) {
        console.error('Error connecting to session', error);
      }
    }
  }

  async function toggleMute() {
    if (isMuted) {
      await session.current?.mute(false);
      setIsMuted(false);
    } else {
      await session.current?.mute(true);
      setIsMuted(true);
    }
  }

  return (
    <Splash
      isConnected={isConnected}
      connect={connect}
        >
      
    <div className="relative">
      <App
        isConnected={isConnected}
        isMuted={isMuted}
        toggleMute={toggleMute}
        history={history}
        outputGuardrailResult={outputGuardrailResult}
        events={events}
        mcpTools={mcpTools}
      />
      
    </div>
    </Splash>
  );
}
