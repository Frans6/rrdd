import createEvent from "../utils/api/createEvent";
import eventLogin from "../utils/api/eventLogin";
import staffLogin from "../utils/api/staffLogin";

// Função noop (no operation) para casos em que não precisamos de uma função real
const noop = async (args: any) => {
  console.log('Função noop chamada com:', args);
  return;
};

// Configurações centralizadas para todos os componentes de evento
export const eventConfigurations = {
  'create': {
    title: "Criar um evento",
    description: "Insira abaixo o nome do evento e o token fornecido pelo organizador do evento.",
    optionalph: "Ex: Nome do evento",
    placeholder: "Ex: RRDD-TOKEN-1234",
    useEmail: true,
    type: "create",
    function: createEvent
  },
  'join': {
    title: "Participar de um evento",
    description: "Insira abaixo o e-mail utilizado na inscrição do evento e o token.",
    optionalph: "Ex: example@email.com",
    placeholder: "Ex: RRDD-TOKEN-1234",
    useEmail: true,
    type: "join",
    function: eventLogin
  },
  'staff': {
    title: "Entrar como staff",
    description: "Insira abaixo o e-mail utilizado na inscrição do evento e o token.",
    placeholder: "Ex: RRDD-TOKEN-1234",
    useEmail: false,
    type: "staff",
    function: staffLogin
  },
  'active-events': {
    title: "Eventos ativos",
    description: "",
    placeholder: "",
    useEmail: false,
    type: "active-events",
    function: noop
  },
  'past-events': {
    title: "Eventos passados",
    description: "",
    placeholder: "",
    useEmail: false,
    type: "past-events",
    function: noop
  }
};

// Mapeamento de views para configurações
export const viewToConfigMap = {
  'new-event': 'create',
  'join-event': 'join',
  'staff': 'staff',
  'active-events': 'active-events',
  'past-events': 'past-events'
};