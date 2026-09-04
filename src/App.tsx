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
  FileCheck
} from 'lucide-react';
import { Contact, ContactStatus } from './types';
import { ParsedSheetData, generateDemoContacts } from './utils/excelUtils';
import { DEFAULT_TEMPLATES } from './utils/templateUtils';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { ColumnMapperModal } from './components/ColumnMapperModal';
import { MessageComposer } from './components/MessageComposer';
import { ContactTable } from './components/ContactTable';
import { GuidedDispatcherModal } from './components/GuidedDispatcherModal';
import { AddContactModal } from './components/AddContactModal';

const STORAGE_CONTACTS_KEY = 'disparador_excel_contacts_list';
const STORAGE_WA_KEY = 'disparador_excel_wa_template';
const STORAGE_EMAIL_SUBJ_KEY = 'disparador_excel_email_subj';
const STORAGE_EMAIL_BODY_KEY = 'disparador_excel_email_body';

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
  const [selectedPreviewContact, setSelectedPreviewContact] = useState<Contact | undefined>(undefined);

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
  };

  const handleClearContacts = () => {
    if (confirm('Tem certeza de que deseja limpar todos os contatos carregados?')) {
      setContacts([]);
      setSelectedPreviewContact(undefined);
    }
  };

  const handleUpdateContactStatus = (id: string, channel: 'whatsapp' | 'email', status: ContactStatus) => {
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
        onClearContacts={handleClearContacts}
        onLoadDemo={handleLoadDemo}
        onStartGuidedDispatch={() => setIsGuidedModalOpen(true)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
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

    </div>
  );
}
