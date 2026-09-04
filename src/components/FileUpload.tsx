import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Download, 
  Sparkles, 
  AlertCircle,
  FileCheck,
  CheckCircle2
} from 'lucide-react';
import { parseExcelFile, downloadSampleExcel, ParsedSheetData } from '../utils/excelUtils';

interface FileUploadProps {
  onFileParsed: (parsedData: ParsedSheetData, fileName: string) => void;
  onLoadDemo: () => void;
  hasContacts: boolean;
}

export function FileUpload({ onFileParsed, onLoadDemo, hasContacts }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setErrorMessage('Por favor, selecione um arquivo Excel (.xlsx, .xls) ou .csv válido.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      const parsedData = await parseExcelFile(file);
      onFileParsed(parsedData, file.name);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Erro ao processar o arquivo Excel. Verifique se não está corrompido.');
    } finally {
      setIsLoading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFile(e.target.files[0]);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="bg-[#161920] rounded-2xl border border-[#262A34] shadow-xs p-6 md:p-8">
      <div className="max-w-2xl mx-auto text-center">
        
        {/* Upload Box */}
        <div
          id="dropzone-excel"
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 transition-all cursor-pointer flex flex-col items-center justify-center text-center group ${
            isDragging
              ? 'border-emerald-500 bg-emerald-500/10 scale-[1.01]'
              : 'border-[#2E3342] hover:border-emerald-500/60 hover:bg-[#1A1D26]'
          }`}
        >
          <input
            ref={fileInputRef}
            id="input-file-excel"
            type="file"
            accept=".xlsx, .xls, .csv"
            className="hidden"
            onChange={onFileChange}
          />

          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-950/30">
            {isLoading ? (
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-100 mb-1">
            {isLoading ? 'Lendo planilha Excel...' : 'Clique ou arraste seu arquivo Excel (.xlsx, .csv)'}
          </h3>
          <p className="text-sm text-slate-400 max-w-md mb-4">
            A planilha deve conter colunas com <strong className="text-slate-200 font-semibold">Nome</strong>, <strong className="text-slate-200 font-semibold">Telefone/WhatsApp</strong> e <strong className="text-slate-200 font-semibold">E-mail</strong> para contato.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              Mapeamento Automático
            </span>
            <span className="inline-flex items-center text-xs font-medium text-slate-300 bg-[#1E222B] border border-[#2E3342] px-2.5 py-1 rounded-lg">
              WhatsApp Business & Pessoal
            </span>
            <span className="inline-flex items-center text-xs font-medium text-slate-300 bg-[#1E222B] border border-[#2E3342] px-2.5 py-1 rounded-lg">
              Disparo por E-mail
            </span>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start space-x-2 text-left">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action helper bar */}
        <div className="mt-6 pt-5 border-t border-[#262A34] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center space-x-1.5">
            <span>Precisa de um modelo para preencher?</span>
            <button
              id="btn-download-sample-helper"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                downloadSampleExcel();
              }}
              className="font-semibold text-emerald-400 hover:text-emerald-300 underline inline-flex items-center cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Baixar Modelo Excel (.xlsx)
            </button>
          </div>

          <button
            id="btn-quick-demo"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onLoadDemo();
            }}
            className="text-slate-200 hover:text-emerald-300 font-semibold inline-flex items-center bg-[#1E222B] hover:bg-emerald-500/10 px-3.5 py-1.5 rounded-xl border border-[#2E3342] hover:border-emerald-500/30 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            Testar com Dados de Exemplo
          </button>
        </div>

      </div>
    </div>
  );
}
