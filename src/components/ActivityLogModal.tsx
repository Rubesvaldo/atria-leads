import { useState, useMemo } from 'react';
import { 
  X, 
  History, 
  MessageSquare, 
  Mail, 
  Trash2, 
  Search, 
  CheckCircle2, 
  Building2, 
  Clock, 
  Download,
  Filter
} from 'lucide-react';
import { ActivityLog } from '../types';
import { formatPhoneDisplay } from '../utils/phoneUtils';

interface ActivityLogModalProps {
  logs: ActivityLog[];
  onClearLogs: () => void;
  onClose: () => void;
}

export function ActivityLogModal({
  logs,
  onClearLogs,
  onClose,
}: ActivityLogModalProps) {
  const [filterChannel, setFilterChannel] = useState<'all' | 'whatsapp' | 'email'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesChannel =
        filterChannel === 'all' || log.channel === filterChannel;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        log.contactName.toLowerCase().includes(q) ||
        (log.company && log.company.toLowerCase().includes(q)) ||
        log.destination.toLowerCase().includes(q);

      return matchesChannel && matchesSearch;
    });
  }, [logs, filterChannel, searchQuery]);

  // Counts
  const totalCount = logs.length;
  const whatsappCount = logs.filter((l) => l.channel === 'whatsapp').length;
  const emailCount = logs.filter((l) => l.channel === 'email').length;

  const formatTimestamp = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

      const timeStr = date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      if (isToday) {
        return `Hoje às ${timeStr}`;
      }

      const dateStr = date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      });
      return `${dateStr} às ${timeStr}`;
    } catch {
      return isoString;
    }
  };

  const handleExportLogs = () => {
    if (logs.length === 0) return;

    const headers = ['Data e Hora', 'Canal', 'Status', 'Nome do Contato', 'Empresa', 'Destino', 'Prévia da Mensagem'];
    const rows = logs.map((l) => [
      `"${new Date(l.timestamp).toLocaleString('pt-BR')}"`,
      `"${l.channel.toUpperCase()}"`,
      `"${l.status === 'sent' ? 'Enviado' : 'Ignorado'}"`,
      `"${l.contactName.replace(/"/g, '""')}"`,
      `"${(l.company || '').replace(/"/g, '""')}"`,
      `"${l.destination}"`,
      `"${(l.messagePreview || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atria_leads_log_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#161920] rounded-2xl shadow-2xl border border-[#262A34] w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] text-slate-200">
        
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-[#262A34] bg-[#14161E] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-100">
                  Log de Atividades & Envios
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#1E222C] text-slate-300 border border-[#2B303C] font-semibold">
                  {totalCount} {totalCount === 1 ? 'registro' : 'registros'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Histórico detalhado das ações de envio disparadas no sistema
              </p>
            </div>
          </div>

          <button
            id="btn-close-activity-log"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-[#1E222B] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-3 divide-x divide-[#242833] border-b border-[#262A34] bg-[#12141A] text-xs">
          <div className="px-4 py-2.5 flex items-center justify-between">
            <span className="text-slate-400">Total de Ações:</span>
            <span className="font-bold text-slate-100">{totalCount}</span>
          </div>
          <div className="px-4 py-2.5 flex items-center justify-between">
            <span className="text-emerald-400 flex items-center">
              <MessageSquare className="w-3.5 h-3.5 mr-1" />
              WhatsApp:
            </span>
            <span className="font-bold text-emerald-400">{whatsappCount}</span>
          </div>
          <div className="px-4 py-2.5 flex items-center justify-between">
            <span className="text-blue-400 flex items-center">
              <Mail className="w-3.5 h-3.5 mr-1" />
              E-mail:
            </span>
            <span className="font-bold text-blue-400">{emailCount}</span>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-4 border-b border-[#262A34] bg-[#14161E] flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Channel Filters */}
          <div className="flex items-center space-x-1.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setFilterChannel('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                filterChannel === 'all'
                  ? 'bg-slate-200 text-slate-900 border-white'
                  : 'bg-[#1A1D25] text-slate-400 border-[#2A2E3B] hover:text-slate-200'
              }`}
            >
              Todos ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterChannel('whatsapp')}
              className={`flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                filterChannel === 'whatsapp'
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-[#1A1D25] text-emerald-400 border-[#2A2E3B] hover:border-emerald-500/30'
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              <span>WhatsApp ({whatsappCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterChannel('email')}
              className={`flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                filterChannel === 'email'
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-[#1A1D25] text-blue-400 border-[#2A2E3B] hover:border-blue-500/30'
              }`}
            >
              <Mail className="w-3 h-3" />
              <span>E-mail ({emailCount})</span>
            </button>
          </div>

          {/* Search box & Actions */}
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <div className="relative flex-1 sm:w-52">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar no histórico..."
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-[#101217] border border-[#2A2E3B] rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {totalCount > 0 && (
              <>
                <button
                  id="btn-export-activity-csv"
                  type="button"
                  onClick={handleExportLogs}
                  className="p-1.5 text-slate-400 hover:text-slate-200 bg-[#1A1D25] hover:bg-[#202530] border border-[#2A2E3B] rounded-lg transition-colors cursor-pointer"
                  title="Exportar histórico como CSV"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  id="btn-clear-activity-logs"
                  type="button"
                  onClick={() => {
                    if (confirm('Deseja limpar todo o histórico de atividades?')) {
                      onClearLogs();
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-400 bg-[#1A1D25] hover:bg-rose-500/10 border border-[#2A2E3B] hover:border-rose-500/30 rounded-lg transition-colors cursor-pointer"
                  title="Limpar histórico de atividades"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Logs List Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5">
          {filteredLogs.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#1D212B] text-slate-500 border border-[#2A2E3B] mx-auto flex items-center justify-center mb-3">
                <Clock className="w-6 h-6 text-slate-400" />
              </div>
              <h4 className="text-sm font-bold text-slate-200">
                {totalCount === 0
                  ? 'Nenhum envio registrado ainda'
                  : 'Nenhum registro encontrado para este filtro'}
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                {totalCount === 0
                  ? 'Assim que você disparar mensagens pelo WhatsApp ou E-mail, cada ação ficará gravada aqui com data e horário.'
                  : 'Tente limpar a busca ou selecionar outro canal no filtro acima.'}
              </p>
            </div>
          ) : (
            filteredLogs.map((item) => {
              const isWhatsApp = item.channel === 'whatsapp';
              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-[#242833] bg-[#14161E] hover:border-[#2F3444] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  {/* Left info */}
                  <div className="flex items-start space-x-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isWhatsApp
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}
                    >
                      {isWhatsApp ? (
                        <MessageSquare className="w-4 h-4" />
                      ) : (
                        <Mail className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-100">
                          {item.contactName}
                        </span>
                        {item.company && (
                          <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#1C202B] text-amber-300 border border-amber-500/20">
                            <Building2 className="w-2.5 h-2.5 mr-1 text-amber-400" />
                            {item.company}
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded-md ${
                            isWhatsApp
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}
                        >
                          {isWhatsApp ? 'WhatsApp' : 'E-mail'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1">
                        <span className="font-mono text-slate-300">
                          {isWhatsApp
                            ? formatPhoneDisplay(item.destination) || item.destination
                            : item.destination}
                        </span>
                        {item.messagePreview && (
                          <span className="truncate max-w-xs sm:max-w-md text-slate-400 italic">
                            "{item.messagePreview}"
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right metadata / status */}
                  <div className="flex items-center justify-between sm:justify-end space-x-3 text-xs flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#222530]">
                    <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{item.status === 'sent' ? 'Disparado' : 'Ignorado'}</span>
                    </div>

                    <div className="text-right text-[11px] text-slate-400 font-mono flex items-center">
                      <Clock className="w-3 h-3 mr-1 text-slate-500" />
                      {formatTimestamp(item.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#12141A] border-t border-[#262A34] flex items-center justify-between text-xs text-slate-400">
          <span>
            Registros mantidos com segurança no seu navegador.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#1E222B] hover:bg-[#282D3A] text-slate-200 font-semibold transition-colors cursor-pointer border border-[#2E3342]"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
