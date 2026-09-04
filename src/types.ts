export type ContactStatus = 'pending' | 'sent' | 'skipped';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  cleanPhone: string;
  email: string;
  whatsappStatus: ContactStatus;
  emailStatus: ContactStatus;
  lastContactedAt?: string;
  notes?: string;
}

export interface ColumnMapping {
  nameColumn: string;
  phoneColumn: string;
  emailColumn: string;
}

export interface MessageTemplate {
  id: string;
  title: string;
  description: string;
  whatsappBody: string;
  emailSubject: string;
  emailBody: string;
}

export type DispatchChannel = 'whatsapp' | 'email';
