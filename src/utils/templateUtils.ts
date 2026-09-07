import { Contact, MessageTemplate } from '../types';
import { formatPhoneDisplay } from './phoneUtils';

export const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: 'comercial',
    title: 'Apresentação Comercial & Atendimento',
    description: 'Ideal para o primeiro contato com clientes da sua planilha',
    whatsappBody: `Olá, {{primeiro_nome}}! Tudo bem?\n\nMeu nome é da equipe comercial. Vi o trabalho da {{empresa}} e gostaria de apresentar nossas soluções exclusivas.\n\nVocê teria alguns minutinhos para conversarmos por aqui?`,
    emailSubject: `Oportunidade e Apresentação para {{nome}} na {{empresa}}`,
    emailBody: `Prezado(a) {{nome}},\n\nEspero que este e-mail o(a) encontre bem!\n\nEstamos entrando em contato para apresentar à {{empresa}} soluções pensadas especialmente para otimizar seus resultados e comunicação comercial.\n\nFicamos à disposição caso deseje agendar uma breve conversa ou receber mais detalhes.\n\nAtenciosamente,\nEquipe de Relacionamento`,
  },
  {
    id: 'proposta',
    title: 'Envio de Orçamento / Proposta',
    description: 'Para enviar valores, propostas e detalhes combinados',
    whatsappBody: `Olá, {{primeiro_nome}}! Conforme conversamos, estou entrando em contato para disponibilizar a proposta exclusiva preparada para a {{empresa}}.\n\nFico à disposição para tirar qualquer dúvida e fecharmos as melhores condições!`,
    emailSubject: `Proposta Especial para {{nome}} • {{empresa}}`,
    emailBody: `Olá, {{nome}},\n\nConforme nosso contato prévio, temos o prazer de encaminhar as condições e detalhes da nossa proposta para a {{empresa}}.\n\nEstamos à inteira disposição para esclarecer qualquer ponto e avançar na parceria.\n\nUm abraço,\nEquipe Comercial`,
  },
  {
    id: 'followup',
    title: 'Follow-up / Acompanhamento',
    description: 'Para retomar contato com contatos que não responderam',
    whatsappBody: `Oi, {{primeiro_nome}}, tudo certo por aí?\n\nPassando apenas para saber se você conseguiu dar uma olhada na nossa última mensagem. Como podemos te ajudar hoje?`,
    emailSubject: `Acompanhamento: {{nome}}, conseguiu avaliar nossa mensagem?`,
    emailBody: `Olá {{nome}},\n\nTudo bem? Passando para checar se você teve a oportunidade de avaliar nossa mensagem anterior.\n\nSe preferir, podemos conversar via WhatsApp no número {{numero}} ou por aqui mesmo.\n\nAbraços!`,
  },
  {
    id: 'lembrete',
    title: 'Lembrete / Notificação Importante',
    description: 'Avisos de vencimento, eventos ou compromissos',
    whatsappBody: `Olá, {{primeiro_nome}}! Este é um lembrete importante referente ao seu cadastro. Por favor, confirme o recebimento desta mensagem assim que possível. Obrigado!`,
    emailSubject: `Aviso Importante para {{nome}}`,
    emailBody: `Prezado(a) {{nome}},\n\nEste é um comunicado de rotina para atualizar informações importantes referentes ao seu cadastro.\n\nCaso tenha dúvidas, basta responder a este e-mail.\n\nAtenciosamente,\nEquipe de Suporte`,
  },
];

export interface VariableOption {
  tag: string;
  label: string;
  description: string;
  example: string;
  category: 'personal' | 'business' | 'contact';
}

export const AVAILABLE_VARIABLES: VariableOption[] = [
  {
    tag: '{{primeiro_nome}}',
    label: 'Primeiro Nome',
    description: 'Primeiro nome do contato (ideal para saudações)',
    example: 'Carlos',
    category: 'personal',
  },
  {
    tag: '{{nome}}',
    label: 'Nome Completo',
    description: 'Nome completo cadastrado',
    example: 'Carlos Eduardo Klein',
    category: 'personal',
  },
  {
    tag: '{{empresa}}',
    label: 'Empresa',
    description: 'Nome da empresa ou organização do lead',
    example: 'Atria Soluções',
    category: 'business',
  },
  {
    tag: '{{telefone}}',
    label: 'Telefone / WhatsApp',
    description: 'Número de telefone formatado do lead',
    example: '(51) 99988-7766',
    category: 'contact',
  },
  {
    tag: '{{email}}',
    label: 'E-mail',
    description: 'Endereço de e-mail do contato',
    example: 'carlos@empresa.com.br',
    category: 'contact',
  },
  {
    tag: '{{observacao}}',
    label: 'Observação / Notas',
    description: 'Notas ou observações salvas do contato',
    example: 'Interessado em soluções digitais',
    category: 'business',
  },
];

export function compileMessage(templateText: string, contact: Partial<Contact>): string {
  if (!templateText) return '';

  const fullName = contact.name?.trim() || 'Cliente';
  const firstName = fullName.split(' ')[0] || fullName;
  const company = contact.company?.trim() || 'sua empresa';
  const phone = contact.cleanPhone ? formatPhoneDisplay(contact.cleanPhone) : (contact.phone || '');
  const email = contact.email || '';
  const notes = contact.notes || '';

  return templateText
    .replace(/\{\{nome\}\}/gi, fullName)
    .replace(/\{\{primeiro_nome\}\}/gi, firstName)
    .replace(/\{\{empresa\}\}/gi, company)
    .replace(/\{\{company\}\}/gi, company)
    .replace(/\{\{numero\}\}/gi, phone)
    .replace(/\{\{telefone\}\}/gi, phone)
    .replace(/\{\{email\}\}/gi, email)
    .replace(/\{\{observacao\}\}/gi, notes)
    .replace(/\{\{notas\}\}/gi, notes);
}
