import React, { useState } from 'react';
import { X, UserPlus, Phone, Mail, User, FileText, Building2 } from 'lucide-react';
import { Contact } from '../types';
import { sanitizePhoneNumber } from '../utils/phoneUtils';

interface AddContactModalProps {
  onAddContact: (contact: Contact) => void;
  onClose: () => void;
}

export function AddContactModal({ onAddContact, onClose }: AddContactModalProps) {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Por favor, informe o nome do contato.');
      return;
    }

    if (!phone.trim() && !email.trim()) {
      setError('Informe pelo menos um número de telefone ou um e-mail.');
      return;
    }

    const cleanPhone = sanitizePhoneNumber(phone);

    const newContact: Contact = {
      id: `contact_manual_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      company: company.trim() || undefined,
      phone: phone.trim(),
      cleanPhone,
      email: email.trim(),
      whatsappStatus: 'pending',
      emailStatus: 'pending',
      notes: notes.trim(),
    };

    onAddContact(newContact);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#161920] rounded-2xl shadow-xl border border-[#262A34] w-full max-w-md overflow-hidden text-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#262A34] bg-[#14161E] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Adicionar Novo Contato
              </h3>
              <p className="text-xs text-slate-400">
                Inserir contato avulso na lista
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-[#1E222B] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-300">
              Nome do Contato <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="input-new-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Carlos Eduardo"
                className="w-full pl-9 pr-3 py-2 bg-[#101217] border border-[#2A2E3B] rounded-xl text-slate-200 placeholder-slate-500 focus:bg-[#0D0F14] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-300">
              Empresa / Organização (Opcional)
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="input-new-company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Ex: Atria Soluções ou ACME Ltda"
                className="w-full pl-9 pr-3 py-2 bg-[#101217] border border-[#2A2E3B] rounded-xl text-slate-200 placeholder-slate-500 focus:bg-[#0D0F14] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Disponível na mensagem através da variável {"{{empresa}}"}.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-300">
              Telefone / WhatsApp Business
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="input-new-phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: 51 99988-7766 ou 11988776655"
                className="w-full pl-9 pr-3 py-2 bg-[#101217] border border-[#2A2E3B] rounded-xl text-slate-200 placeholder-slate-500 focus:bg-[#0D0F14] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Aceita DDD com 9 dígitos. O DDI 55 será ajustado automaticamente.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-300">
              E-mail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="input-new-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: contato@empresa.com.br"
                className="w-full pl-9 pr-3 py-2 bg-[#101217] border border-[#2A2E3B] rounded-xl text-slate-200 placeholder-slate-500 focus:bg-[#0D0F14] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-300">
              Observação / Notas (Opcional)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <textarea
                id="input-new-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Cliente interessado no produto X"
                className="w-full pl-9 pr-3 py-2 bg-[#101217] border border-[#2A2E3B] rounded-xl text-slate-200 placeholder-slate-500 focus:bg-[#0D0F14] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:bg-[#1E222B] rounded-xl cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              id="btn-save-new-contact"
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl shadow-md shadow-emerald-950/30 cursor-pointer transition-colors"
            >
              Salvar Contato
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
