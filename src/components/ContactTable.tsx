import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  MessageSquare, 
  Mail, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  UserPlus, 
  ExternalLink,
  ChevronDown,
  Check,
  AlertCircle,
  Copy,
  Edit2,
  History
} from 'lucide-react';
import { Contact, ContactStatus } from '../types';
import { formatPhoneDisplay, generateWhatsAppLink, generateMailtoLink, isValidEmail } from '../utils/phoneUtils';
import { compileMessage } from '../utils/templateUtils';

interface ContactTableProps {
  contacts: Contact[];
  whatsappText: string;
  emailSubject: string;
  emailBody: string;
  useWhatsAppWeb: boolean;
  onUpdateContactStatus: (id: string, channel: 'whatsapp' | 'email', status: ContactStatus) => void;
  onDeleteContact: (id: string) => void;
  onDeleteSelected: (ids: string[]) => void;
  onMarkSelectedStatus: (ids: string[], channel: 'whatsapp' | 'email', status: ContactStatus) => void;
  onOpenAddModal: () => void;
  onSelectSampleContact: (contact: Contact) => void;
  onOpenActivityLog?: () => void;
}

export function ContactTable({
  contacts,
  whatsappText,
  emailSubject,
  emailBody,
  useWhatsAppWeb,
  onUpdateContactStatus,
  onDeleteContact,
  onDeleteSelected,
  onMarkSelectedStatus,
  onOpenAddModal,
  onSelectSampleContact,
  onOpenActivityLog,
}: ContactTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'pending_wa' | 'pending_email' | 'sent'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      // Search matching
      const term = searchTerm.toLowerCase();
      const matchSearch =
        c.name.toLowerCase().includes(term) ||
        c.phone.includes(term) ||
        c.cleanPhone.includes(term) ||
        c.email.toLowerCase().includes(term);

      if (!matchSearch) return false;

      if (filterTab === 'pending_wa') return c.whatsappStatus === 'pending';
      if (filterTab === 'pending_email') return c.emailStatus === 'pending';
      if (filterTab === 'sent') return c.whatsappStatus === 'sent' || c.emailStatus === 'sent';

      return true;
    });
  }, [contacts, searchTerm, filterTab]);

  const allSelected = filteredContacts.length > 0 && filteredContacts.every((c) => selectedIds.includes(c.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredContacts.map((c) => c.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Dispatch WhatsApp single
  const handleSendWhatsApp = (contact: Contact) => {
    if (!contact.cleanPhone) {
      alert('Este contato não possui um número de telefone válido.');
      return;
    }
    const message = compileMessage(whatsappText, contact);
    const link = generateWhatsAppLink(contact.cleanPhone, message, useWhatsAppWeb);
    window.open(link, '_blank', 'noopener,noreferrer');
    onUpdateContactStatus(contact.id, 'whatsapp', 'sent');
  };

  // Dispatch Email single
  const handleSendEmail = (contact: Contact) => {
    if (!contact.email) {
      alert('Este contato não possui um e-mail cadastrado.');
      return;
    }
    const subject = compileMessage(emailSubject, contact);
    const body = compileMessage(emailBody, contact);
    const link = generateMailtoLink(contact.email, subject, body);
    window.location.href = link;
    onUpdateContactStatus(contact.id, 'email', 'sent');
  };

  const handleCopyPhone = (phone: string, id: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(`phone_${id}`);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleCopyEmail = (email: string, id: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(`email_${id}`);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Counts for filter tabs
  const countAll = contacts.length;
  const countPendingWa = contacts.filter((c) => c.whatsappStatus === 'pending').length;
  const countPendingEmail = contacts.filter((c) => c.emailStatus === 'pending').length;
  const countSent = contacts.filter((c) => c.whatsappStatus === 'sent' || c.emailStatus === 'sent').length;

  return (
    <div className="bg-[#161920] rounded-2xl border border-[#262A34] shadow-xs overflow-hidden">
      
      {/* Top Filter & Search Controls */}
      <div className="p-4 sm:p-6 border-b border-[#262A34] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-contacts"
              type="text"
              placeholder="Buscar por nome, telefone ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs sm:text-sm pl-9 pr-4 py-2 bg-[#101217] border border-[#2A2E3B] rounded-xl text-slate-200 placeholder-slate-500 focus:bg-[#0D0F14] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Add contact manual and activity log button */}
          <div className="flex items-center space-x-2">
            {onOpenActivityLog && (
              <button
                id="btn-table-activity-log"
                type="button"
                onClick={onOpenActivityLog}
                className="inline-flex items-center px-3 py-2 text-xs font-semibold text-slate-200 bg-[#1E222B] hover:bg-[#262B37] border border-[#2E3342] rounded-xl shadow-xs transition-colors cursor-pointer"
                title="Ver log de envios"
              >
                <History className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                Histórico
              </button>
            )}

            <button
              id="btn-add-contact-manual"
              type="button"
              onClick={onOpenAddModal}
              className="inline-flex items-center px-3 py-2 text-xs font-semibold text-slate-200 bg-[#1E222B] hover:bg-[#262B37] border border-[#2E3342] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              Novo Contato
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              id="filter-all"
              type="button"
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterTab === 'all'
                  ? 'bg-slate-100 text-slate-900 shadow-xs'
                  : 'bg-[#1A1D25] text-slate-400 hover:bg-[#222632] hover:text-slate-200'
              }`}
            >
              Todos ({countAll})
            </button>

            <button
              id="filter-pending-wa"
              type="button"
              onClick={() => setFilterTab('pending_wa')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer inline-flex items-center border ${
                filterTab === 'pending_wa'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                  : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20'
              }`}
            >
              <MessageSquare className="w-3 h-3 mr-1" />
              Pendentes WhatsApp ({countPendingWa})
            </button>

            <button
              id="filter-pending-email"
              type="button"
              onClick={() => setFilterTab('pending_email')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer inline-flex items-center border ${
                filterTab === 'pending_email'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                  : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20'
              }`}
            >
              <Mail className="w-3 h-3 mr-1" />
              Pendentes E-mail ({countPendingEmail})
            </button>

            <button
              id="filter-sent"
              type="button"
              onClick={() => setFilterTab('sent')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                filterTab === 'sent'
                  ? 'bg-slate-700 text-white border-slate-600 shadow-xs'
                  : 'bg-[#1A1D25] text-slate-400 hover:bg-[#222632] hover:text-slate-200 border-[#282C37]'
              }`}
            >
              Já Contatados ({countSent})
            </button>
          </div>

          {/* Batch Actions Bar (if selected) */}
          {selectedIds.length > 0 && (
            <div className="flex items-center space-x-2 bg-emerald-500/10 text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-500/30 text-xs animate-in fade-in duration-150">
              <span className="font-semibold">{selectedIds.length} selecionados:</span>
              
              <button
                type="button"
                onClick={() => onMarkSelectedStatus(selectedIds, 'whatsapp', 'sent')}
                className="px-2.5 py-0.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-500 cursor-pointer shadow-xs"
              >
                Marcar WhatsApp
              </button>

              <button
                type="button"
                onClick={() => onMarkSelectedStatus(selectedIds, 'email', 'sent')}
                className="px-2.5 py-0.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 cursor-pointer shadow-xs"
              >
                Marcar E-mail
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm(`Deseja remover os ${selectedIds.length} contatos selecionados?`)) {
                    onDeleteSelected(selectedIds);
                    setSelectedIds([]);
                  }
                }}
                className="p-1 text-rose-400 hover:bg-rose-500/20 rounded-lg cursor-pointer transition-colors"
                title="Excluir selecionados"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#121419] text-slate-400 font-semibold border-b border-[#262A34] uppercase tracking-wider text-[11px]">
            <tr>
              <th className="p-3.5 w-10 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="rounded text-emerald-500 bg-[#121419] border-[#2A2E3B] focus:ring-emerald-500/30 cursor-pointer"
                />
              </th>
              <th className="p-3.5">Nome / Contato</th>
              <th className="p-3.5">Telefone / WhatsApp</th>
              <th className="p-3.5">E-mail</th>
              <th className="p-3.5 text-center">Status WhatsApp</th>
              <th className="p-3.5 text-center">Status E-mail</th>
              <th className="p-3.5 text-right pr-4">Ações de Envio</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#222632]">
            {filteredContacts.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-1.5">
                    <AlertCircle className="w-8 h-8 text-slate-600" />
                    <p className="text-sm font-medium text-slate-300">Nenhum contato encontrado</p>
                    <p className="text-xs text-slate-500">Tente ajustar a busca ou os filtros acima.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredContacts.map((contact) => {
                const isSelected = selectedIds.includes(contact.id);
                const hasValidPhone = Boolean(contact.cleanPhone);
                const hasValidEmail = isValidEmail(contact.email);

                return (
                  <tr
                    key={contact.id}
                    className={`hover:bg-[#1C202A] transition-colors ${
                      isSelected ? 'bg-emerald-500/10' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(contact.id)}
                        className="rounded text-emerald-500 bg-[#121419] border-[#2A2E3B] focus:ring-emerald-500/30 cursor-pointer"
                      />
                    </td>

                    {/* Name */}
                    <td className="p-3.5">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#242834] text-slate-200 border border-[#2F3444] font-bold flex items-center justify-center text-xs uppercase flex-shrink-0">
                          {contact.name.charAt(0) || 'C'}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span
                              onClick={() => onSelectSampleContact(contact)}
                              className="font-semibold text-slate-100 hover:text-emerald-400 cursor-pointer transition-colors"
                              title="Clique para ver a prévia das mensagens com este contato"
                            >
                              {contact.name}
                            </span>
                            {contact.company && (
                              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-[#1D222C] text-emerald-400 border border-emerald-500/20">
                                {contact.company}
                              </span>
                            )}
                          </div>
                          {contact.notes && (
                            <span className="text-[10px] text-slate-500 block truncate max-w-[200px]">
                              {contact.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <span className={`font-mono ${hasValidPhone ? 'text-slate-200' : 'text-slate-500 italic'}`}>
                          {hasValidPhone ? formatPhoneDisplay(contact.cleanPhone) : (contact.phone || 'Sem número')}
                        </span>
                        {hasValidPhone && (
                          <button
                            type="button"
                            onClick={() => handleCopyPhone(contact.cleanPhone, contact.id)}
                            className="text-slate-500 hover:text-slate-300 p-0.5 rounded cursor-pointer transition-colors"
                            title="Copiar número"
                          >
                            {copiedId === `phone_${contact.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Email */}
                    <td className="p-3.5">
                      <div className="flex items-center space-x-1.5">
                        <span className={`truncate max-w-[180px] ${hasValidEmail ? 'text-slate-200' : 'text-slate-500 italic'}`}>
                          {contact.email || 'Sem e-mail'}
                        </span>
                        {contact.email && (
                          <button
                            type="button"
                            onClick={() => handleCopyEmail(contact.email, contact.id)}
                            className="text-slate-500 hover:text-slate-300 p-0.5 rounded cursor-pointer transition-colors"
                            title="Copiar e-mail"
                          >
                            {copiedId === `email_${contact.id}` ? (
                              <Check className="w-3.5 h-3.5 text-blue-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Status WhatsApp */}
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          const nextStatus: ContactStatus =
                            contact.whatsappStatus === 'pending'
                              ? 'sent'
                              : contact.whatsappStatus === 'sent'
                              ? 'skipped'
                              : 'pending';
                          onUpdateContactStatus(contact.id, 'whatsapp', nextStatus);
                        }}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors cursor-pointer border ${
                          contact.whatsappStatus === 'sent'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : contact.whatsappStatus === 'skipped'
                            ? 'bg-slate-800 text-slate-400 border-slate-700'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                        title="Clique para alternar status (Pendente / Enviado / Ignorado)"
                      >
                        {contact.whatsappStatus === 'sent' && (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" />
                            Enviado
                          </>
                        )}
                        {contact.whatsappStatus === 'pending' && (
                          <>
                            <Clock className="w-3 h-3 mr-1 text-amber-400" />
                            Pendente
                          </>
                        )}
                        {contact.whatsappStatus === 'skipped' && (
                          <span>Ignorado</span>
                        )}
                      </button>
                    </td>

                    {/* Status Email */}
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          const nextStatus: ContactStatus =
                            contact.emailStatus === 'pending'
                              ? 'sent'
                              : contact.emailStatus === 'sent'
                              ? 'skipped'
                              : 'pending';
                          onUpdateContactStatus(contact.id, 'email', nextStatus);
                        }}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors cursor-pointer border ${
                          contact.emailStatus === 'sent'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : contact.emailStatus === 'skipped'
                            ? 'bg-slate-800 text-slate-400 border-slate-700'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                        title="Clique para alternar status (Pendente / Enviado / Ignorado)"
                      >
                        {contact.emailStatus === 'sent' && (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1 text-blue-400" />
                            Enviado
                          </>
                        )}
                        {contact.emailStatus === 'pending' && (
                          <>
                            <Clock className="w-3 h-3 mr-1 text-amber-400" />
                            Pendente
                          </>
                        )}
                        {contact.emailStatus === 'skipped' && (
                          <span>Ignorado</span>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right pr-4 whitespace-nowrap">
                      <div className="inline-flex items-center space-x-1.5">
                        {/* WhatsApp Send Button */}
                        <button
                          type="button"
                          disabled={!hasValidPhone}
                          onClick={() => handleSendWhatsApp(contact)}
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg font-semibold text-xs transition-colors cursor-pointer shadow-xs ${
                            hasValidPhone
                              ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white'
                              : 'bg-[#1A1D25] text-slate-600 border border-[#242834] cursor-not-allowed'
                          }`}
                          title={hasValidPhone ? 'Abrir conversa e enviar mensagem no WhatsApp' : 'Sem telefone válido'}
                        >
                          <MessageSquare className="w-3 h-3 mr-1" />
                          <span>WhatsApp</span>
                          <ExternalLink className="w-2.5 h-2.5 ml-1 opacity-70" />
                        </button>

                        {/* Email Send Button */}
                        <button
                          type="button"
                          disabled={!hasValidEmail}
                          onClick={() => handleSendEmail(contact)}
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg font-semibold text-xs transition-colors cursor-pointer shadow-xs ${
                            hasValidEmail
                              ? 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white'
                              : 'bg-[#1A1D25] text-slate-600 border border-[#242834] cursor-not-allowed'
                          }`}
                          title={hasValidEmail ? 'Abrir aplicativo de e-mail com mensagem pronta' : 'Sem e-mail válido'}
                        >
                          <Mail className="w-3 h-3 mr-1" />
                          <span>E-mail</span>
                        </button>

                        {/* Delete Row */}
                        <button
                          type="button"
                          onClick={() => onDeleteContact(contact.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Excluir este contato"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-[#14161E] border-t border-[#262A34] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
        <div>
          Exibindo <strong className="text-slate-200">{filteredContacts.length}</strong> de <strong className="text-slate-200">{contacts.length}</strong> contatos
        </div>
        <div className="flex items-center space-x-3 text-[11px]">
          <span className="text-slate-500">💡 <strong className="text-slate-400">Dica:</strong> Clicar no botão verde ou azul abre o WhatsApp/E-mail com a mensagem pré-preenchida e atualiza o status automaticamente.</span>
        </div>
      </div>

    </div>
  );
}
