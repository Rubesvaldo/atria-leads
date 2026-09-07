import React, { useState } from 'react';
import { Columns3, CheckCircle2, ArrowRight, X, AlertTriangle } from 'lucide-react';
import { ColumnMapping } from '../types';
import { ParsedSheetData, convertRowsToContacts } from '../utils/excelUtils';
import { Contact } from '../types';

interface ColumnMapperModalProps {
  parsedData: ParsedSheetData;
  fileName: string;
  onConfirm: (contacts: Contact[]) => void;
  onCancel: () => void;
}

export function ColumnMapperModal({
  parsedData,
  fileName,
  onConfirm,
  onCancel,
}: ColumnMapperModalProps) {
  const [mapping, setMapping] = useState<ColumnMapping>({
    nameColumn: parsedData.detectedMapping.nameColumn || parsedData.headers[0] || '',
    companyColumn: parsedData.detectedMapping.companyColumn || '',
    phoneColumn: parsedData.detectedMapping.phoneColumn || parsedData.headers[1] || '',
    emailColumn: parsedData.detectedMapping.emailColumn || parsedData.headers[2] || '',
  });

  const previewRows = parsedData.rawRows.slice(0, 3);

  const handleFinish = () => {
    const contacts = convertRowsToContacts(parsedData.rawRows, mapping);
    onConfirm(contacts);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#161920] rounded-2xl shadow-xl border border-[#262A34] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#262A34] flex items-center justify-between bg-[#14161E]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Columns3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Confirmar Mapeamento de Colunas
              </h3>
              <p className="text-xs text-slate-400">
                Arquivo: <span className="font-semibold text-slate-200">{fileName}</span> ({parsedData.rawRows.length} linhas encontradas)
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-[#1E222B] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          <p className="text-xs sm:text-sm text-slate-400">
            Identificamos automaticamente as colunas da sua planilha. Caso alguma coluna esteja diferente, selecione a coluna correspondente abaixo:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="p-4 rounded-xl border border-[#262A34] bg-[#1A1D25] space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                1. Coluna do Nome <span className="text-rose-400">*</span>
              </label>
              <select
                id="select-col-name"
                value={mapping.nameColumn}
                onChange={(e) => setMapping({ ...mapping, nameColumn: e.target.value })}
                className="w-full text-xs sm:text-sm bg-[#101217] border border-[#2A2E3B] rounded-lg px-2.5 py-2 text-slate-200 font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 cursor-pointer"
              >
                {parsedData.headers.map((h) => (
                  <option key={h} value={h} className="bg-[#161920] text-slate-200">
                    {h}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500">Ex: Nome do cliente ou contato</p>
            </div>

            {/* Empresa */}
            <div className="p-4 rounded-xl border border-[#262A34] bg-[#1A1D25] space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                2. Coluna da Empresa (Opcional)
              </label>
              <select
                id="select-col-company"
                value={mapping.companyColumn || ''}
                onChange={(e) => setMapping({ ...mapping, companyColumn: e.target.value || undefined })}
                className="w-full text-xs sm:text-sm bg-[#101217] border border-[#2A2E3B] rounded-lg px-2.5 py-2 text-slate-200 font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 cursor-pointer"
              >
                <option value="" className="bg-[#161920] text-slate-400">
                  (Não mapear empresa)
                </option>
                {parsedData.headers.map((h) => (
                  <option key={h} value={h} className="bg-[#161920] text-slate-200">
                    {h}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500">Usada para a variável {"{{empresa}}"}</p>
            </div>

            {/* Telefone */}
            <div className="p-4 rounded-xl border border-[#262A34] bg-[#1A1D25] space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                3. Coluna WhatsApp / Celular <span className="text-rose-400">*</span>
              </label>
              <select
                id="select-col-phone"
                value={mapping.phoneColumn}
                onChange={(e) => setMapping({ ...mapping, phoneColumn: e.target.value })}
                className="w-full text-xs sm:text-sm bg-[#101217] border border-[#2A2E3B] rounded-lg px-2.5 py-2 text-slate-200 font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 cursor-pointer"
              >
                {parsedData.headers.map((h) => (
                  <option key={h} value={h} className="bg-[#161920] text-slate-200">
                    {h}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500">Número para WhatsApp Business</p>
            </div>

            {/* Email */}
            <div className="p-4 rounded-xl border border-[#262A34] bg-[#1A1D25] space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                4. Coluna de E-mail
              </label>
              <select
                id="select-col-email"
                value={mapping.emailColumn}
                onChange={(e) => setMapping({ ...mapping, emailColumn: e.target.value })}
                className="w-full text-xs sm:text-sm bg-[#101217] border border-[#2A2E3B] rounded-lg px-2.5 py-2 text-slate-200 font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 cursor-pointer"
              >
                <option value="" className="bg-[#161920] text-slate-400">
                  (Não mapear e-mail)
                </option>
                {parsedData.headers.map((h) => (
                  <option key={h} value={h} className="bg-[#161920] text-slate-200">
                    {h}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500">Endereço de e-mail do contato</p>
            </div>
          </div>

          {/* Data Preview */}
          <div className="border border-[#262A34] rounded-xl overflow-hidden bg-[#101217]">
            <div className="bg-[#14161E] px-4 py-2 text-xs font-semibold text-slate-300 flex items-center justify-between border-b border-[#262A34]">
              <span>Pré-visualização dos primeiros registros:</span>
              <span className="text-slate-500 font-normal">Apenas exibição</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#121419] text-slate-400 font-medium border-b border-[#262A34]">
                  <tr>
                    <th className="px-3 py-2">Nome ({mapping.nameColumn})</th>
                    {mapping.companyColumn && <th className="px-3 py-2">Empresa ({mapping.companyColumn})</th>}
                    <th className="px-3 py-2">Telefone ({mapping.phoneColumn})</th>
                    <th className="px-3 py-2">E-mail ({mapping.emailColumn || 'nenhum'})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222632]">
                  {previewRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#1A1D25] transition-colors">
                      <td className="px-3 py-2 font-medium text-slate-200">
                        {String(row[mapping.nameColumn] || '-')}
                      </td>
                      {mapping.companyColumn && (
                        <td className="px-3 py-2 text-slate-300">
                          {String(row[mapping.companyColumn] || '-')}
                        </td>
                      )}
                      <td className="px-3 py-2 text-slate-300">
                        {String(row[mapping.phoneColumn] || '-')}
                      </td>
                      <td className="px-3 py-2 text-slate-300">
                        {String(row[mapping.emailColumn] || '-')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {!mapping.phoneColumn && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400" />
              <span>Atenção: Selecione a coluna de telefone para permitir os disparos via WhatsApp.</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#14161E] border-t border-[#262A34] flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:bg-[#1E222B] rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            id="btn-confirm-mapping"
            type="button"
            onClick={handleFinish}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl shadow-md shadow-emerald-950/30 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Importar {parsedData.rawRows.length} Contatos</span>
          </button>
        </div>

      </div>
    </div>
  );
}
