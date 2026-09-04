import React, { useState, useEffect } from 'react';
import { 
  X, 
  MessageSquare, 
  Mail, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  ExternalLink,
  FastForward,
  User,
  Sparkles,
  Phone,
  AtSign
} from 'lucide-react';
import { Contact, ContactStatus } from '../types';
import { compileMessage } from '../utils/templateUtils';
import { generateWhatsAppLink, generateMailtoLink, formatPhoneDisplay } from '../utils/phoneUtils';

interface GuidedDispatcherModalProps {
  contacts: Contact[];
  whatsappText: string;
  emailSubject: string;
  emailBody: string;
  useWhatsAppWeb: boolean;
  onUpdateStatus: (id: string, channel: 'whatsapp' | 'email', status: ContactStatus) => void;
  onClose: () => void;
}

export function GuidedDispatcherModal({
  contacts,
  whatsappText,
  emailSubject,
  emailBody,
  useWhatsAppWeb,
  onUpdateStatus,
  onClose,
}: GuidedDispatcherModalProps) {
  // Start from first pending or first contact
  const initialIndex = contacts.findIndex((c) => c.whatsappStatus === 'pending') !== -1
    ? contacts.findIndex((c) => c.whatsappStatus === 'pending')
    : 0;

  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [activePreviewChannel, setActivePreviewChannel] = useState<'whatsapp' | 'email'>('whatsapp');

  const currentContact: Contact | undefined = contacts[currentIndex];
  const total = contacts.length;
  const progressPercent = total > 0 ? Math.round(((currentIndex + 1) / total) * 100) : 0;

  if (!currentContact) {
    return null;
  }

  const compiledWhatsApp = compileMessage(whatsappText, currentContact);
  const compiledEmailSubject = compileMessage(emailSubject, currentContact);
  const compiledEmailBody = compileMessage(emailBody, currentContact);

  const handleSendWhatsAppAndNext = () => {
    if (!currentContact.cleanPhone) {
      alert('Contato sem telefone cadastrado.');
      return;
    }
    const link = generateWhatsAppLink(currentContact.cleanPhone, compiledWhatsApp, useWhatsAppWeb);
    window.open(link, '_blank', 'noopener,noreferrer');
    onUpdateStatus(currentContact.id, 'whatsapp', 'sent');

    if (currentIndex < total - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSendEmailAndNext = () => {
    if (!currentContact.email) {
      alert('Contato sem e-mail cadastrado.');
      return;
    }
    const link = generateMailtoLink(currentContact.email, compiledEmailSubject, compiledEmailBody);
    window.location.href = link;
    onUpdateStatus(currentContact.id, 'email', 'sent');

    if (currentIndex < total - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSkipNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#161920] rounded-2xl shadow-2xl border border-[#262A34] w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] text-slate-200">
        
        {/* Modal Header with Progress */}
        <div className="px-6 py-4 border-b border-[#262A34] bg-[#14161E] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {currentIndex + 1}/{total}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <span>Modo Disparo Guiado</span>
                <span className="text-xs font-normal text-slate-400">
                  ({progressPercent}% concluído)
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Dispare 1 a 1 de forma segura e personalizada sem risco de bloqueio
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-[#1E222B] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#242833] h-1.5 overflow-hidden">
          <div
            className="bg-emerald-500 h-1.5 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Current Contact Info Card */}
          <div className="p-4 rounded-xl bg-[#1A1D25] border border-[#262A34] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#242834] text-slate-200 border border-[#2F3444] font-bold text-lg flex items-center justify-center shadow-xs">
                {currentContact.name.charAt(0) || 'C'}
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-100">
                  {currentContact.name}
                </h4>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-400">
                  <span className="flex items-center">
                    <Phone className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                    {currentContact.cleanPhone
                      ? formatPhoneDisplay(currentContact.cleanPhone)
                      : currentContact.phone || 'Sem telefone'}
                  </span>
                  <span className="flex items-center">
                    <AtSign className="w-3.5 h-3.5 mr-1 text-blue-400" />
                    {currentContact.email || 'Sem e-mail'}
                  </span>
                </div>
              </div>
            </div>

            {/* Current Status Badges */}
            <div className="flex items-center space-x-2">
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                  currentContact.whatsappStatus === 'sent'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-[#262A34] text-slate-300 border-[#323746]'
                }`}
              >
                WhatsApp: {currentContact.whatsappStatus === 'sent' ? '✓ Enviado' : 'Pendente'}
              </span>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                  currentContact.emailStatus === 'sent'
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                    : 'bg-[#262A34] text-slate-300 border-[#323746]'
                }`}
              >
                E-mail: {currentContact.emailStatus === 'sent' ? '✓ Enviado' : 'Pendente'}
              </span>
            </div>
          </div>

          {/* Channel Preview Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setActivePreviewChannel('whatsapp')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5 ${
                    activePreviewChannel === 'whatsapp'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-[#1E222B] text-slate-400 hover:bg-[#262B37] hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Mensagem WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePreviewChannel('email')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5 ${
                    activePreviewChannel === 'email'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-[#1E222B] text-slate-400 hover:bg-[#262B37] hover:text-slate-200'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Mensagem E-mail</span>
                </button>
              </div>

              <span className="text-[11px] text-slate-400">
                Variáveis já substituídas para {currentContact.name}
              </span>
            </div>

            {/* Preview Box */}
            {activePreviewChannel === 'whatsapp' ? (
              <div className="p-4 bg-[#0b141a] rounded-xl border border-[#262A34] min-h-[140px] flex flex-col justify-end">
                <div className="max-w-[90%] self-end bg-[#005c4b] text-slate-100 rounded-2xl rounded-tr-none px-4 py-3 shadow-md text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                  {compiledWhatsApp}
                  <div className="text-[10px] text-emerald-200/60 text-right mt-1.5">
                    Agora • WhatsApp Business
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#1A1D25] rounded-xl border border-[#262A34] text-xs sm:text-sm space-y-2">
                <div className="font-semibold text-slate-200 pb-2 border-b border-[#262A34]">
                  Assunto: {compiledEmailSubject}
                </div>
                <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {compiledEmailBody}
                </div>
              </div>
            )}
          </div>

          {/* Primary Guided Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              id="btn-guided-send-whatsapp"
              type="button"
              onClick={handleSendWhatsAppAndNext}
              className="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-950/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Abrir WhatsApp & Avançar</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>

            <button
              id="btn-guided-send-email"
              type="button"
              onClick={handleSendEmailAndNext}
              className="px-5 py-3.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-950/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>Abrir E-mail & Avançar</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>

        </div>

        {/* Modal Navigation Footer */}
        <div className="px-6 py-3.5 bg-[#14161E] border-t border-[#262A34] flex items-center justify-between text-xs">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={handlePrev}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              currentIndex === 0
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-slate-300 hover:bg-[#1E222B] cursor-pointer'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <span className="text-slate-400 font-medium">
            Contato {currentIndex + 1} de {total}
          </span>

          <button
            type="button"
            disabled={currentIndex >= total - 1}
            onClick={handleSkipNext}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              currentIndex >= total - 1
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-slate-300 hover:bg-[#1E222B] cursor-pointer'
            }`}
          >
            <span>Pular Contato</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
