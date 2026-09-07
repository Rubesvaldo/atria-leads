import { 
  FileSpreadsheet, 
  Download, 
  FileDown, 
  Trash2, 
  Sparkles, 
  Send, 
  MessageSquare, 
  Mail,
  Play,
  History
} from 'lucide-react';
import { Contact } from '../types';
import { downloadSampleExcel, exportContactsToExcel } from '../utils/excelUtils';

interface HeaderProps {
  contacts: Contact[];
  activityCount: number;
  onClearContacts: () => void;
  onLoadDemo: () => void;
  onStartGuidedDispatch: () => void;
  onOpenAddModal: () => void;
  onOpenActivityLog: () => void;
}

export function Header({
  contacts,
  activityCount,
  onClearContacts,
  onLoadDemo,
  onStartGuidedDispatch,
  onOpenAddModal,
  onOpenActivityLog,
}: HeaderProps) {
  const total = contacts.length;
  const whatsappSent = contacts.filter((c) => c.whatsappStatus === 'sent').length;
  const emailSent = contacts.filter((c) => c.emailStatus === 'sent').length;
  const pending = contacts.filter((c) => c.whatsappStatus === 'pending' || c.emailStatus === 'pending').length;

  return (
    <header className="bg-[#161920]/95 backdrop-blur-md border-b border-[#262A34] sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-950/40">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-slate-100 tracking-tight">
                  Atria Leads <span className="text-emerald-400">WhatsApp & Email</span>
                </h1>
                <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Business Hub
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Importe sua planilha com Nome, Telefone e E-mail para contato rápido
              </p>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {total > 0 && (
              <>
                <div className="hidden sm:flex items-center space-x-2.5 text-xs bg-[#1A1D25] rounded-xl px-3.5 py-1.5 border border-[#282C37]">
                  <span className="font-semibold text-slate-200">{total} contatos</span>
                  <span className="text-slate-600">|</span>
                  <span className="flex items-center text-emerald-400 font-medium">
                    <MessageSquare className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                    {whatsappSent}
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="flex items-center text-blue-400 font-medium">
                    <Mail className="w-3.5 h-3.5 mr-1 text-blue-400" />
                    {emailSent}
                  </span>
                </div>

                <button
                  id="btn-guided-dispatch"
                  onClick={onStartGuidedDispatch}
                  className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl shadow-md shadow-emerald-950/30 transition-all cursor-pointer"
                  title="Avançar contato por contato de forma rápida"
                >
                  <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                  Modo Disparo Guiado
                </button>

                <button
                  id="btn-export-excel"
                  onClick={() => exportContactsToExcel(contacts)}
                  className="inline-flex items-center px-3 py-2 text-xs font-medium text-slate-200 bg-[#1E222B] hover:bg-[#262B37] border border-[#2E3342] rounded-xl shadow-xs transition-colors cursor-pointer"
                  title="Exportar contatos e status para Excel"
                >
                  <FileDown className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                  Exportar
                </button>

                <button
                  id="btn-open-activity-log"
                  onClick={onOpenActivityLog}
                  className="inline-flex items-center px-3 py-2 text-xs font-semibold text-slate-200 bg-[#1E222B] hover:bg-[#262B37] border border-[#2E3342] hover:border-emerald-500/40 rounded-xl shadow-xs transition-colors cursor-pointer"
                  title="Ver histórico e log de atividades"
                >
                  <History className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                  <span>Log de Atividades</span>
                  {activityCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      {activityCount}
                    </span>
                  )}
                </button>

                <button
                  id="btn-clear-contacts"
                  onClick={onClearContacts}
                  className="inline-flex items-center p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                  title="Limpar todos os contatos"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}

            {total === 0 && (
              <>
                <button
                  id="btn-open-activity-log-empty"
                  onClick={onOpenActivityLog}
                  className="inline-flex items-center px-3 py-2 text-xs font-semibold text-slate-300 bg-[#1E222B] hover:bg-[#262B37] border border-[#2E3342] rounded-xl shadow-xs transition-colors cursor-pointer"
                  title="Ver histórico e log de atividades"
                >
                  <History className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                  <span>Log de Atividades</span>
                  {activityCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      {activityCount}
                    </span>
                  )}
                </button>

                <button
                  id="btn-download-sample"
                  onClick={downloadSampleExcel}
                  className="inline-flex items-center px-3.5 py-2 text-xs font-medium text-slate-200 bg-[#1E222B] hover:bg-[#262B37] border border-[#2E3342] rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                  Baixar Modelo Excel
                </button>

                <button
                  id="btn-load-demo"
                  onClick={onLoadDemo}
                  className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                  Carregar Dados Exemplo
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
