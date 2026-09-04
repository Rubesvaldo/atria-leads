import { Contact, MessageTemplate } from '../types';
import { formatPhoneDisplay } from './phoneUtils';

export const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: 'comercial',
    title: 'Apresentação Comercial & Atendimento',
    description: 'Ideal para o primeiro contato com clientes da sua planilha',
    whatsappBody: `Olá, {{primeiro_nome}}! Tudo bem?\n\nMeu nome é da equipe comercial. Encontrei seu contato e gostaria de apresentar nossas soluções e novidades.\n\nVocê teria alguns minutinhos para conversarmos por aqui?`,
    emailSubject: `Oportunidade e Apresentação para {{nome}}`,
    emailBody: `Prezado(a) {{nome}},\n\nEspero que este e-mail o(a) encontre bem!\n\nEstamos entrando em contato para apresentar nossas soluções pensadas especialmente para otimizar seus resultados.\n\nFicamos à disposição caso deseje agendar uma breve conversa ou receber mais detalhes.\n\nAtenciosamente,\nEquipe de Relacionamento`,
  },
  {
    id: 'proposta',
    title: 'Envio de Orçamento / Proposta',
    description: 'Para enviar valores, propostas e detalhes combinados',
    whatsappBody: `Olá, {{primeiro_nome}}! Conforme conversamos, estou entrando em contato para disponibilizar as informações e a proposta exclusiva para você.\n\nFico à disposição para tirar qualquer dúvida e fecharmos as melhores condições!`,
    emailSubject: `Proposta Especial para {{nome}}`,
    emailBody: `Olá, {{nome}},\n\nConforme nosso contato prévio, temos o prazer de encaminhar as condições e detalhes da nossa proposta.\n\nEstamos à inteira disposição para esclarecer qualquer ponto e avançar na parceria.\n\nUm abraço,\nEquipe Comercial`,
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

export function compileMessage(templateText: string, contact: Partial<Contact>): string {
  if (!templateText) return '';

  const fullName = contact.name?.trim() || 'Cliente';
  const firstName = fullName.split(' ')[0] || fullName;
  const phone = contact.cleanPhone ? formatPhoneDisplay(contact.cleanPhone) : (contact.phone || '');
  const email = contact.email || '';

  return templateText
    .replace(/\{\{nome\}\}/gi, fullName)
    .replace(/\{\{primeiro_nome\}\}/gi, firstName)
    .replace(/\{\{numero\}\}/gi, phone)
    .replace(/\{\{telefone\}\}/gi, phone)
    .replace(/\{\{email\}\}/gi, email);
}
