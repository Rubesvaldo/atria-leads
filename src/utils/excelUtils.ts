import * as XLSX from 'xlsx';
import { Contact } from '../types';
import { sanitizePhoneNumber } from './phoneUtils';

export interface ParsedSheetData {
  headers: string[];
  rawRows: Record<string, any>[];
  detectedMapping: {
    nameColumn: string;
    phoneColumn: string;
    emailColumn: string;
  };
}

/**
 * Normalizes string for easy matching
 */
function normalizeHeader(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Automatically detects column matching based on common Portuguese & English terms
 */
export function autoDetectColumns(headers: string[]): {
  nameColumn: string;
  phoneColumn: string;
  emailColumn: string;
} {
  let nameColumn = '';
  let phoneColumn = '';
  let emailColumn = '';

  const nameKeywords = ['nome', 'name', 'cliente', 'contato', 'razao', 'pessoa', 'lead'];
  const phoneKeywords = ['telefone', 'whatsapp', 'celular', 'numero', 'phone', 'fone', 'tel', 'zap', 'mobile', 'wpp'];
  const emailKeywords = ['email', 'mail', 'correio', 'eletronico'];

  for (const header of headers) {
    const norm = normalizeHeader(header);

    if (!nameColumn && nameKeywords.some((k) => norm.includes(k))) {
      nameColumn = header;
    }
    if (!phoneColumn && phoneKeywords.some((k) => norm.includes(k))) {
      phoneColumn = header;
    }
    if (!emailColumn && emailKeywords.some((k) => norm.includes(k))) {
      emailColumn = header;
    }
  }

  // Fallbacks if not detected
  if (!nameColumn && headers.length > 0) nameColumn = headers[0];
  if (!phoneColumn && headers.length > 1) phoneColumn = headers[1];
  if (!emailColumn && headers.length > 2) emailColumn = headers[2];

  return { nameColumn, phoneColumn, emailColumn };
}

/**
 * Parses an Excel or CSV file buffer into headers and raw rows
 */
export async function parseExcelFile(file: File): Promise<ParsedSheetData> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('A planilha está vazia ou sem abas legíveis.');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

  if (!rawRows || rawRows.length === 0) {
    throw new Error('Nenhum dado encontrado na planilha.');
  }

  // Extract all unique headers across rows
  const headersSet = new Set<string>();
  rawRows.forEach((row) => {
    Object.keys(row).forEach((k) => headersSet.add(k));
  });

  const headers = Array.from(headersSet);
  const detectedMapping = autoDetectColumns(headers);

  return {
    headers,
    rawRows,
    detectedMapping,
  };
}

/**
 * Converts raw sheet rows into Contact models using selected column mappings
 */
export function convertRowsToContacts(
  rawRows: Record<string, any>[],
  mapping: { nameColumn: string; phoneColumn: string; emailColumn: string }
): Contact[] {
  return rawRows
    .map((row, index) => {
      const name = String(row[mapping.nameColumn] || '').trim();
      const rawPhone = String(row[mapping.phoneColumn] || '').trim();
      const email = String(row[mapping.emailColumn] || '').trim();
      const cleanPhone = sanitizePhoneNumber(rawPhone);

      // Skip completely empty rows
      if (!name && !rawPhone && !email) {
        return null;
      }

      const contact: Contact = {
        id: `contact_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 7)}`,
        name: name || `Contato ${index + 1}`,
        phone: rawPhone,
        cleanPhone,
        email,
        whatsappStatus: 'pending',
        emailStatus: 'pending',
        notes: '',
      };
      return contact;
    })
    .filter((c): c is Contact => c !== null);
}

/**
 * Downloads a sample Excel file ready to be filled
 */
export function downloadSampleExcel() {
  const sampleData = [
    {
      Nome: 'Carlos Eduardo Klein',
      Telefone: '51999887766',
      Email: 'carlos.klein@exemplo.com.br',
      Observacao: 'Interessado em soluções digitais',
    },
    {
      Nome: 'Mariana Silva Souza',
      Telefone: '11988776655',
      Email: 'mariana.silva@exemplo.com',
      Observacao: 'Cliente VIP - Enviar proposta',
    },
    {
      Nome: 'Roberto Mendes',
      Telefone: '21977665544',
      Email: 'roberto.mendes@empresa.com.br',
      Observacao: 'Aguardando retorno sobre orçamento',
    },
    {
      Nome: 'Ana Paula Ferreira',
      Telefone: '31966554433',
      Email: 'anapaula@consultoria.com.br',
      Observacao: 'Pediu contato pelo WhatsApp Business',
    },
    {
      Nome: 'Lucas Oliveira',
      Telefone: '41955443322',
      Email: 'lucas.oliveira@tech.com',
      Observacao: 'Contato via formulário',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 25 }, // Nome
    { wch: 18 }, // Telefone
    { wch: 30 }, // Email
    { wch: 35 }, // Observacao
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Contatos');

  XLSX.writeFile(workbook, 'modelo_planilha_contatos.xlsx');
}

/**
 * Exports contacts to an Excel file with their interaction statuses
 */
export function exportContactsToExcel(contacts: Contact[]) {
  const exportData = contacts.map((c) => ({
    Nome: c.name,
    Telefone: c.phone,
    WhatsApp_Formatado: c.cleanPhone,
    Email: c.email,
    Status_WhatsApp: c.whatsappStatus === 'sent' ? 'Enviado' : c.whatsappStatus === 'skipped' ? 'Ignorado' : 'Pendente',
    Status_Email: c.emailStatus === 'sent' ? 'Enviado' : c.emailStatus === 'skipped' ? 'Ignorado' : 'Pendente',
    Ultimo_Contato: c.lastContactedAt ? new Date(c.lastContactedAt).toLocaleString('pt-BR') : 'Nunca',
    Notas: c.notes || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  worksheet['!cols'] = [
    { wch: 25 },
    { wch: 18 },
    { wch: 20 },
    { wch: 30 },
    { wch: 16 },
    { wch: 16 },
    { wch: 22 },
    { wch: 30 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatorio_Contatos');

  XLSX.writeFile(workbook, `contatos_disparo_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Generates sample demo contacts for immediate testing
 */
export function generateDemoContacts(): Contact[] {
  return [
    {
      id: 'demo_1',
      name: 'Carlos Eduardo',
      phone: '(51) 99988-7766',
      cleanPhone: '5551999887766',
      email: 'carlos.eduardo@exemplo.com.br',
      whatsappStatus: 'pending',
      emailStatus: 'pending',
      notes: 'Lead interessado em propostas comerciais',
    },
    {
      id: 'demo_2',
      name: 'Mariana Souza',
      phone: '11988776655',
      cleanPhone: '5511988776655',
      email: 'mariana.souza@empresa.com.br',
      whatsappStatus: 'pending',
      emailStatus: 'pending',
      notes: 'Solicitou contato no WhatsApp Business',
    },
    {
      id: 'demo_3',
      name: 'Roberto Mendes',
      phone: '+55 21 97766-5544',
      cleanPhone: '5521977665544',
      email: 'roberto.mendes@negocios.com.br',
      whatsappStatus: 'sent',
      emailStatus: 'pending',
      lastContactedAt: new Date(Date.now() - 3600000).toISOString(),
      notes: 'Primeiro contato realizado pelo WhatsApp',
    },
    {
      id: 'demo_4',
      name: 'Ana Paula Ribeiro',
      phone: '31 96655-4433',
      cleanPhone: '5531966554433',
      email: 'anapaula@consultoria.com.br',
      whatsappStatus: 'pending',
      emailStatus: 'sent',
      lastContactedAt: new Date(Date.now() - 7200000).toISOString(),
      notes: 'E-mail com apresentação enviado',
    },
    {
      id: 'demo_5',
      name: 'Juliana Castro',
      phone: '41991234567',
      cleanPhone: '5541991234567',
      email: 'juliana.castro@startup.com',
      whatsappStatus: 'pending',
      emailStatus: 'pending',
      notes: 'Novo cadastro via campanha',
    },
  ];
}
