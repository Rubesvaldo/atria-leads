/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  MessageSquare, 
  Mail, 
  CheckCircle2, 
  Sparkles, 
  Play, 
  UploadCloud, 
  HelpCircle,
  FileCheck,
  History,
  ArrowRight
} from 'lucide-react';
import { Contact, ContactStatus, ActivityLog } from './types';
import { ParsedSheetData, generateDemoContacts } from './utils/excelUtils';
import { DEFAULT_TEMPLATES, compileMessage } from './utils/templateUtils';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { ColumnMapperModal } from './components/ColumnMapperModal';
import { MessageComposer } from './components/MessageComposer';
import { ContactTable } from './components/ContactTable';
import { GuidedDispatcherModal } from './components/GuidedDispatcherModal';
import { AddContactModal } from './components/AddContactModal';
import { ActivityLogModal } from './components/ActivityLogModal';

const STORAGE_CONTACTS_KEY = 'disparador_excel_contacts_list';
const STORAGE_WA_KEY = 'disparador_excel_wa_template';
const STORAGE_EMAIL_SUBJ_KEY = 'disparador_excel_email_subj';
const STORAGE_EMAIL_BODY_KEY = 'disparador_excel_email_body';
const STORAGE_LOGS_KEY = 'atria_leads_activity_logs_v1';

export default function App() {
  // Contacts state with local storage fallback
  const [contacts, setContacts] = useState<Contact[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CONTACTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Message template states
  const [whatsappText, setWhatsappText] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_WA_KEY);
      if (saved) return saved;
    } catch (e) {}
    return DEFAULT_TEMPLATES[0].whatsappBody;
  });

  const [emailSubject, setEmailSubject] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_EMAIL_SUBJ_KEY);
      if (saved) return saved;
    } catch (e) {}
    return DEFAULT_TEMPLATES[0].emailSubject;
  });

  const [emailBody, setEmailBody] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_EMAIL_BODY_KEY);
      if (saved) return saved;
    } catch (e) {}
    return DEFAULT_TEMPLATES[0].emailBody;
  });

  const [useWhatsAppWeb, setUseWhatsAppWeb] = useState<boolean>(true);

  // Modals state
  const [parsedData, setParsedData] = useState<ParsedSheetData | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [isGuidedModalOpen, setIsGuidedModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isActivityLogModalOpen, setIsActivityLogModalOpen] = useState<boolean>(false);
  const [selectedPreviewContact, setSelectedPreviewContact] = useState<Contact | undefined>(undefined);

  // Activity logs state
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LOGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CONTACTS_KEY, JSON.stringify(contacts));
    } catch (e) {
      console.error(e);
    }
  }, [contacts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(activityLogs));
    } catch (e) {
      console.error(e);
    }
  }, [activityLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_WA_KEY, whatsappText);
    } catch (e) {}
  }, [whatsappText]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_EMAIL_SUBJ_KEY, emailSubject);
    } catch (e) {}
  }, [emailSubject]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_EMAIL_BODY_KEY, emailBody);
    } catch (e) {}
  }, [emailBody]);

  // Handlers
  const handleFileParsed = (data: ParsedSheetData, fileName: string) => {
    setParsedData(data);
    setUploadedFileName(fileName);
  };

  const handleConfirmMapping = (newContacts: Contact[]) => {
    setContacts(newContacts);
    setParsedData(null);
    setUploadedFileName('');
    if (newContacts.length > 0) {
      setSelectedPreviewContact(newContacts[0]);
    }
  };

  const handleLoadDemo = () => {
    const demos = generateDemoContacts();
    setContacts(demos);
    setSelectedPreviewContact(demos[0]);

    if (activityLogs.length === 0) {
      const demoLogs: ActivityLog[] = [
        {
          id: `log_demo_1`,
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          contactId: demos[0].id,
          contactName: demos[0].name,
          company: demos[0].company,
          channel: 'whatsapp',
          status: 'sent',
          destination: demos[0].cleanPhone,
          messagePreview: 'Olá Carlos, tudo bem? Apresentamos a Atria Soluções...',
        },
        {
          id: `log_demo_2`,
          timestamp: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
          contactId: demos[1].id,
          contactName: demos[1].name,
          company: demos[1].company,
          channel: 'email',
          status: 'sent',
          destination: demos[1].email,
          messagePreview: 'Apresentação Comercial Exclusiva para Mariana',
        },
      ];
      setActivityLogs(demoLogs);
    }
  };

  const handleClearContacts = () => {
    if (confirm('Tem certeza de que deseja limpar todos os contatos carregados?')) {
      setContacts([]);
      setSelectedPreviewContact(undefined);
    }
  };

  const handleClearActivityLogs = () => {
    setActivityLogs([]);
    try {
      localStorage.removeItem(STORAGE_LOGS_KEY);
    } catch (e) {}
  };

  const handleUpdateContactStatus = (id: string, channel: 'whatsapp' | 'email', status: ContactStatus) => {
    const contact = contacts.find((c) => c.id === id);
    if (contact && (status === 'sent' || status === 'skipped')) {
      const newLog: ActivityLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        contactId: id,
        contactName: contact.name,
        company: contact.company,
        channel,
        status,
        destination: channel === 'whatsapp' ? contact.cleanPhone || contact.phone : contact.email,
        messagePreview: channel === 'whatsapp'
          ? compileMessage(whatsappText, contact).slice(0, 80)
          : compileMessage(emailSubject, contact).slice(0, 80),
      };
      setActivityLogs((prev) => [newLog, ...prev.slice(0, 199)]);
    }

    setContacts((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            [channel === 'whatsapp' ? 'whatsappStatus' : 'emailStatus']: status,
            lastContactedAt: new Date().toISOString(),
          };
        }
        return c;
      })
    );
  };

  const handleDeleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    if (selectedPreviewContact?.id === id) {
      setSelectedPreviewContact(undefined);
    }
  };

  const handleDeleteSelected = (ids: string[]) => {
    setContacts((prev) => prev.filter((c) => !ids.includes(c.id)));
  };

  const handleMarkSelectedStatus = (ids: string[], channel: 'whatsapp' | 'email', status: ContactStatus) => {
    if (status === 'sent' || status === 'skipped') {
      const selectedContacts = contacts.filter((c) => ids.includes(c.id));
      const newLogs: ActivityLog[] = selectedContacts.map((c) => ({
        id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}_${c.id}`,
        timestamp: new Date().toISOString(),
        contactId: c.id,
        contactName: c.name,
        company: c.company,
        channel,
        status: status as 'sent' | 'skipped',
        destination: channel === 'whatsapp' ? c.cleanPhone || c.phone : c.email,
        messagePreview: channel === 'whatsapp'
          ? compileMessage(whatsappText, c).slice(0, 80)
          : compileMessage(emailSubject, c).slice(0, 80),
      }));
      setActivityLogs((prev) => [...newLogs, ...prev].slice(0, 200));
    }

    setContacts((prev) =>
      prev.map((c) => {
        if (ids.includes(c.id)) {
          return {
            ...c,
            [channel === 'whatsapp' ? 'whatsappStatus' : 'emailStatus']: status,
            lastContactedAt: new Date().toISOString(),
          };
        }
        return c;
      })
    );
  };

  const handleAddContact = (newContact: Contact) => {
    setContacts((prev) => [newContact, ...prev]);
    setSelectedPreviewContact(newContact);
  };

  // Metrics
  const total = contacts.length;
  const whatsappSent = contacts.filter((c) => c.whatsappStatus === 'sent').length;
  const emailSent = contacts.filter((c) => c.emailStatus === 'sent').length;
  const anySent = contacts.filter((c) => c.whatsappStatus === 'sent' || c.emailStatus === 'sent').length;
  const completionRate = total > 0 ? Math.round((anySent / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0F1115] flex flex-col font-sans text-slate-200">
      
      {/* Header */}
      <Header
        contacts={contacts}
        activityCount={activityLogs.length}
        onClearContacts={handleClearContacts}
        onLoadDemo={handleLoadDemo}
        onStartGuidedDispatch={() => setIsGuidedModalOpen(true)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenActivityLog={() => setIsActivityLogModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Upload Excel Banner or Mini Re-upload area */}
        {total === 0 ? (
          <FileUpload
            onFileParsed={handleFileParsed}
            onLoadDemo={handleLoadDemo}
            hasContacts={false}
          />
        ) : (
          <div className="bg-[#161920] rounded-2xl border border-[#262A34] p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-100">
                  Planilha Carregada com Sucesso
                </h2>
                <p className="text-xs text-slate-400">
                  {total} contatos prontos para envio. Você pode personalizar as mensagens abaixo ou disparar contatos.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label
                htmlFor="input-replace-file"
                className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-slate-200 bg-[#1E222B] hover:bg-[#262B37] border border-[#2E3342] rounded-xl cursor-pointer transition-colors"
              >
                <UploadCloud className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                Subir Outra Planilha
              </label>
              <input
                id="input-replace-file"
                type="file"
                accept=".xlsx, .xls, .csv"
                className="hidden"
                onChange={async (e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    const file = e.target.files[0];
                    const { parseExcelFile } = await import('./utils/excelUtils');
                    const data = await parseExcelFile(file);
                    handleFileParsed(data, file.name);
                    e.target.value = '';
                  }
                }}
              />

              <button
                type="button"
                onClick={() => setIsGuidedModalOpen(true)}
                className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-950/30 transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                Iniciar Disparador Guiado
              </button>
            </div>
          </div>
        )}

        {/* Quick Stats Grid (when contacts loaded) */}
        {total > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-[#161920] p-4 rounded-xl border border-[#262A34] shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total na Planilha
              </span>
              <div className="text-xl sm:text-2xl font-black text-slate-100 mt-1">
                {total}
              </div>
              <span className="text-[11px] text-slate-400">contatos importados</span>
            </div>

            <div className="bg-[#161920] p-4 rounded-xl border border-[#262A34] shadow-xs">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block flex items-center">
                <MessageSquare className="w-3 h-3 mr-1" />
                WhatsApp Enviados
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
                {whatsappSent}
              </div>
              <span className="text-[11px] text-slate-400">
                {total > 0 ? Math.round((whatsappSent / total) * 100) : 0}% dos contatos
              </span>
            </div>

            <div className="bg-[#161920] p-4 rounded-xl border border-[#262A34] shadow-xs">
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block flex items-center">
                <Mail className="w-3 h-3 mr-1" />
                E-mails Enviados
              </span>
              <div className="text-xl sm:text-2xl font-black text-blue-400 mt-1">
                {emailSent}
              </div>
              <span className="text-[11px] text-slate-400">
                {total > 0 ? Math.round((emailSent / total) * 100) : 0}% dos contatos
              </span>
            </div>

            <div className="bg-[#161920] p-4 rounded-xl border border-[#262A34] shadow-xs">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" />
                Progresso Geral
              </span>
              <div className="text-xl sm:text-2xl font-black text-slate-100 mt-1">
                {completionRate}%
              </div>
              <div className="w-full bg-[#242833] rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Quick Activity Banner / Last Actions Panel */}
        {activityLogs.length > 0 && (
          <div className="bg-[#161920] rounded-2xl border border-[#262A34] p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <History className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-100">
                    Última Ação de Envio
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    • {new Date(activityLogs[0].timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span
                    className={`text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded-md ${
                      activityLogs[0].channel === 'whatsapp'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}
                  >
                    {activityLogs[0].channel === 'whatsapp' ? 'WhatsApp' : 'E-mail'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  <span className="font-semibold text-slate-200">{activityLogs[0].contactName}</span>
                  {activityLogs[0].company && (
                    <span className="text-slate-400"> ({activityLogs[0].company})</span>
                  )}
                  <span className="mx-1.5 text-slate-600">•</span>
                  <span className="text-slate-300 font-mono text-[11px]">{activityLogs[0].destination}</span>
                  <span className="mx-1.5 text-slate-600">•</span>
                  <span className={activityLogs[0].status === 'sent' ? 'text-emerald-400 font-medium' : 'text-amber-400'}>
                    {activityLogs[0].status === 'sent' ? 'Enviado com sucesso' : 'Ignorado'}
                  </span>
                </p>
              </div>
            </div>

            <button
              id="btn-view-all-activities"
              type="button"
              onClick={() => setIsActivityLogModalOpen(true)}
              className="inline-flex items-center justify-center px-3.5 py-2 text-xs font-semibold text-slate-200 bg-[#1E222B] hover:bg-[#262B37] border border-[#2E3342] hover:border-emerald-500/40 rounded-xl transition-colors cursor-pointer flex-shrink-0"
            >
              <span>Ver Log de Atividades ({activityLogs.length})</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-emerald-400" />
            </button>
          </div>
        )}

        {/* Message Composer */}
        <MessageComposer
          whatsappText={whatsappText}
          setWhatsappText={setWhatsappText}
          emailSubject={emailSubject}
          setEmailSubject={setEmailSubject}
          emailBody={emailBody}
          setEmailBody={setEmailBody}
          useWhatsAppWeb={useWhatsAppWeb}
          setUseWhatsAppWeb={setUseWhatsAppWeb}
          sampleContact={selectedPreviewContact || contacts[0]}
        />

        {/* Contacts Table (only if contacts exist) */}
        {total > 0 && (
          <ContactTable
            contacts={contacts}
            whatsappText={whatsappText}
            emailSubject={emailSubject}
            emailBody={emailBody}
            useWhatsAppWeb={useWhatsAppWeb}
            onUpdateContactStatus={handleUpdateContactStatus}
            onDeleteContact={handleDeleteContact}
            onDeleteSelected={handleDeleteSelected}
            onMarkSelectedStatus={handleMarkSelectedStatus}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onSelectSampleContact={(contact) => setSelectedPreviewContact(contact)}
            onOpenActivityLog={() => setIsActivityLogModalOpen(true)}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-[#262A34] bg-[#161920] text-center text-xs text-slate-400">
        <p>
          Atria Leads • Integração com <strong className="text-emerald-400">WhatsApp Business</strong> & <strong className="text-blue-400">E-mail</strong>
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          Seus dados e planilhas são processados 100% no seu navegador com total privacidade e segurança.
        </p>
      </footer>

      {/* Column Mapper Modal */}
      {parsedData && (
        <ColumnMapperModal
          parsedData={parsedData}
          fileName={uploadedFileName}
          onConfirm={handleConfirmMapping}
          onCancel={() => {
            setParsedData(null);
            setUploadedFileName('');
          }}
        />
      )}

      {/* Guided Dispatcher Modal */}
      {isGuidedModalOpen && contacts.length > 0 && (
        <GuidedDispatcherModal
          contacts={contacts}
          whatsappText={whatsappText}
          emailSubject={emailSubject}
          emailBody={emailBody}
          useWhatsAppWeb={useWhatsAppWeb}
          onUpdateStatus={handleUpdateContactStatus}
          onClose={() => setIsGuidedModalOpen(false)}
        />
      )}

      {/* Add Contact Modal */}
      {isAddModalOpen && (
        <AddContactModal
          onAddContact={handleAddContact}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      {/* Activity Log Modal */}
      {isActivityLogModalOpen && (
        <ActivityLogModal
          logs={activityLogs}
          onClearLogs={handleClearActivityLogs}
          onClose={() => setIsActivityLogModalOpen(false)}
        />
      )}

    </div>
  );
}
