import React, { useState } from 'react';
import { 
  MessageSquare, 
  Mail, 
  Eye, 
  Tag, 
  Check, 
  Sparkles,
  ExternalLink,
  Laptop,
  Smartphone,
  Copy,
  Info
} from 'lucide-react';
import { Contact, MessageTemplate } from '../types';
import { DEFAULT_TEMPLATES, compileMessage } from '../utils/templateUtils';
import { formatPhoneDisplay } from '../utils/phoneUtils';

interface MessageComposerProps {
  whatsappText: string;
  setWhatsappText: (val: string) => void;
  emailSubject: string;
  setEmailSubject: (val: string) => void;
  emailBody: string;
  setEmailBody: (val: string) => void;
  useWhatsAppWeb: boolean;
  setUseWhatsAppWeb: (val: boolean) => void;
  sampleContact?: Contact;
}

export function MessageComposer({
  whatsappText,
  setWhatsappText,
  emailSubject,
  setEmailSubject,
  emailBody,
  setEmailBody,
  useWhatsAppWeb,
  setUseWhatsAppWeb,
  sampleContact,
}: MessageComposerProps) {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'email' | 'preview'>('whatsapp');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('comercial');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  const fallbackContact: Contact = {
    id: 'sample',
    name: 'Carlos Eduardo Klein',
    phone: '51999887766',
    cleanPhone: '5551999887766',
    email: 'carlos.klein@exemplo.com.br',
    whatsappStatus: 'pending',
    emailStatus: 'pending',
  };

  const previewContact = sampleContact || fallbackContact;

  const handleApplyTemplate = (template: MessageTemplate) => {
    setSelectedTemplateId(template.id);
    setWhatsappText(template.whatsappBody);
    setEmailSubject(template.emailSubject);
    setEmailBody(template.emailBody);
  };

  const insertVariable = (variable: string, target: 'whatsapp' | 'emailSubject' | 'emailBody') => {
    if (target === 'whatsapp') {
      setWhatsappText(whatsappText + variable);
    } else if (target === 'emailSubject') {
      setEmailSubject(emailSubject + variable);
    } else if (target === 'emailBody') {
      setEmailBody(emailBody + variable);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotification(label);
    setTimeout(() => setCopiedNotification(null), 2000);
  };

  const compiledWhatsApp = compileMessage(whatsappText, previewContact);
  const compiledEmailSubject = compileMessage(emailSubject, previewContact);
  const compiledEmailBody = compileMessage(emailBody, previewContact);

  return (
    <div className="bg-[#161920] rounded-2xl border border-[#262A34] shadow-xs overflow-hidden">
      
      {/* Top Header with Tab Switcher */}
      <div className="px-6 py-4 border-b border-[#262A34] bg-[#14161E] flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-100">
              Personalização das Mensagens
            </h2>
            <p className="text-xs text-slate-400">
              Crie a mensagem padrão com variáveis automáticas (Nome, WhatsApp, E-mail)
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center space-x-1 bg-[#0F1115] p-1 rounded-xl border border-[#262A34]">
          <button
            id="tab-whatsapp"
            type="button"
            onClick={() => setActiveTab('whatsapp')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'whatsapp'
                ? 'bg-[#1E222B] text-emerald-400 shadow-sm border border-[#2E3342]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp</span>
          </button>

          <button
            id="tab-email"
            type="button"
            onClick={() => setActiveTab('email')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'email'
                ? 'bg-[#1E222B] text-blue-400 shadow-sm border border-[#2E3342]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-blue-400" />
            <span>E-mail</span>
          </button>

          <button
            id="tab-preview"
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-[#1E222B] text-slate-100 shadow-sm border border-[#2E3342]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>Ver Prévia Real</span>
          </button>
        </div>
      </div>

      {/* Templates Selector Quick Bar */}
      <div className="px-6 py-3 bg-[#13151C] border-b border-[#262A34] flex items-center justify-between overflow-x-auto gap-2 text-xs">
        <span className="text-slate-400 font-medium whitespace-nowrap flex items-center">
          <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
          Modelos Prontos:
        </span>
        <div className="flex items-center space-x-2">
          {DEFAULT_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => handleApplyTemplate(tmpl)}
              className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                selectedTemplateId === tmpl.id
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                  : 'bg-[#1E222B] text-slate-300 border-[#2E3342] hover:bg-[#262B37]'
              }`}
            >
              {tmpl.title}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="p-6">
        
        {/* WHATSAPP TAB */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center">
                  <Tag className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                  Inserir Variáveis Automáticas:
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => insertVariable('{{primeiro_nome}}', 'whatsapp')}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                >
                  + Primeiro Nome
                </button>
                <button
                  type="button"
                  onClick={() => insertVariable('{{nome}}', 'whatsapp')}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                >
                  + Nome Completo
                </button>
                <button
                  type="button"
                  onClick={() => insertVariable('{{numero}}', 'whatsapp')}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                >
                  + Telefone
                </button>
                <button
                  type="button"
                  onClick={() => insertVariable('{{email}}', 'whatsapp')}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                >
                  + E-mail
                </button>
              </div>
            </div>

            {/* Textarea */}
            <div>
              <textarea
                id="textarea-whatsapp"
                rows={5}
                value={whatsappText}
                onChange={(e) => setWhatsappText(e.target.value)}
                placeholder="Escreva sua mensagem do WhatsApp... Use {{primeiro_nome}} para saudar o cliente pelo primeiro nome."
                className="w-full text-xs sm:text-sm p-3.5 bg-[#101217] border border-[#2A2E3B] rounded-xl text-slate-200 placeholder-slate-500 focus:bg-[#0D0F14] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 font-sans leading-relaxed"
              />
              <div className="flex items-center justify-between mt-1.5 text-[11px] text-slate-500">
                <span>Dica: Quebras de linha e emojis são mantidos no link do WhatsApp.</span>
                <span className="font-mono">{whatsappText.length} caracteres</span>
              </div>
            </div>

            {/* WhatsApp Target Preference */}
            <div className="p-3.5 bg-[#13151C] rounded-xl border border-[#262A34] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-slate-300 flex items-center">
                Destino do link ao clicar em Enviar WhatsApp:
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setUseWhatsAppWeb(true)}
                  className={`inline-flex items-center px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    useWhatsAppWeb
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-[#1E222B] text-slate-300 border border-[#2E3342] hover:bg-[#262B37]'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5 mr-1" />
                  WhatsApp Web (Navegador)
                </button>
                <button
                  type="button"
                  onClick={() => setUseWhatsAppWeb(false)}
                  className={`inline-flex items-center px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    !useWhatsAppWeb
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-[#1E222B] text-slate-300 border border-[#2E3342] hover:bg-[#262B37]'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 mr-1" />
                  App WhatsApp / Celular
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EMAIL TAB */}
        {activeTab === 'email' && (
          <div className="space-y-4">
            {/* Subject */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Assunto do E-mail
                </label>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => insertVariable('{{nome}}', 'emailSubject')}
                    className="px-2.5 py-0.5 text-[11px] font-medium rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/30 hover:bg-blue-500/20 transition-colors cursor-pointer"
                  >
                    + Nome no Assunto
                  </button>
                </div>
              </div>
              <input
                id="input-email-subject"
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Ex: Contato importante para {{nome}}"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-[#101217] border border-[#2A2E3B] rounded-xl text-slate-200 placeholder-slate-500 focus:bg-[#0D0F14] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 font-sans"
              />
            </div>

            {/* Email Body */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Corpo do E-mail
                </label>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => insertVariable('{{primeiro_nome}}', 'emailBody')}
                    className="px-2.5 py-0.5 text-[11px] font-medium rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/30 hover:bg-blue-500/20 transition-colors cursor-pointer"
                  >
                    + Primeiro Nome
                  </button>
                  <button
                    type="button"
                    onClick={() => insertVariable('{{nome}}', 'emailBody')}
                    className="px-2.5 py-0.5 text-[11px] font-medium rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/30 hover:bg-blue-500/20 transition-colors cursor-pointer"
                  >
                    + Nome Completo
                  </button>
                  <button
                    type="button"
                    onClick={() => insertVariable('{{numero}}', 'emailBody')}
                    className="px-2.5 py-0.5 text-[11px] font-medium rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/30 hover:bg-blue-500/20 transition-colors cursor-pointer"
                  >
                    + Telefone
                  </button>
                </div>
              </div>
              <textarea
                id="textarea-email-body"
                rows={5}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Escreva a mensagem do e-mail..."
                className="w-full text-xs sm:text-sm p-3.5 bg-[#101217] border border-[#2A2E3B] rounded-xl text-slate-200 placeholder-slate-500 focus:bg-[#0D0F14] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 font-sans leading-relaxed"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Ao clicar em enviar e-mail, seu aplicativo padrão (Gmail, Outlook) abrirá pronto para envio.</span>
                <span className="font-mono">{emailBody.length} caracteres</span>
              </div>
            </div>
          </div>
        )}

        {/* PREVIEW TAB */}
        {activeTab === 'preview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* WhatsApp Balloon Preview (Dark WhatsApp Simulation) */}
            <div className="rounded-2xl border border-[#262A34] overflow-hidden bg-[#12141A]">
              <div className="bg-[#1f2c34] text-slate-100 px-4 py-2.5 flex items-center justify-between text-xs font-semibold border-b border-[#262A34]">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <span>Prévia WhatsApp ({previewContact.name})</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(compiledWhatsApp, 'whatsapp')}
                  className="hover:bg-white/10 px-2.5 py-1 rounded-lg text-[11px] inline-flex items-center cursor-pointer transition-colors text-slate-300"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  {copiedNotification === 'whatsapp' ? 'Copiado!' : 'Copiar'}
                </button>
              </div>

              {/* Chat background simulation */}
              <div className="p-4 bg-[#0b141a] min-h-[180px] flex flex-col justify-end">
                <div className="max-w-[85%] self-end bg-[#005c4b] text-slate-100 rounded-2xl rounded-tr-none px-4 py-3 shadow-md text-xs sm:text-sm whitespace-pre-wrap leading-relaxed relative">
                  {compiledWhatsApp || 'Mensagem do WhatsApp vazia...'}
                  <div className="text-[10px] text-emerald-200/60 text-right mt-1.5 flex items-center justify-end space-x-1">
                    <span>10:30</span>
                    <span className="text-emerald-300 font-bold">✓✓</span>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-[#161920] border-t border-[#262A34] text-xs text-slate-400">
                Número destino: <strong className="text-slate-200">{formatPhoneDisplay(previewContact.cleanPhone) || previewContact.phone}</strong>
              </div>
            </div>

            {/* Email Preview */}
            <div className="rounded-2xl border border-[#262A34] overflow-hidden bg-[#161920] flex flex-col">
              <div className="bg-[#1a2333] text-slate-100 px-4 py-2.5 flex items-center justify-between text-xs font-semibold border-b border-[#262A34]">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <span>Prévia E-mail ({previewContact.email})</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(`${compiledEmailSubject}\n\n${compiledEmailBody}`, 'email')}
                  className="hover:bg-white/10 px-2.5 py-1 rounded-lg text-[11px] inline-flex items-center cursor-pointer transition-colors text-slate-300"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  {copiedNotification === 'email' ? 'Copiado!' : 'Copiar'}
                </button>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col">
                <div className="text-xs pb-2.5 border-b border-[#262A34] space-y-1.5">
                  <div>
                    <span className="text-slate-500">Para:</span>{' '}
                    <span className="font-semibold text-slate-300">{previewContact.email || 'cliente@exemplo.com'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Assunto:</span>{' '}
                    <span className="font-bold text-slate-100">{compiledEmailSubject || 'Sem assunto'}</span>
                  </div>
                </div>

                <div className="flex-1 text-xs sm:text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {compiledEmailBody || 'Corpo do e-mail vazio...'}
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
