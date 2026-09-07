export type ContactStatus = 'pending' | 'sent' | 'skipped';

export interface Contact {
  id: string;
  name: string;
  company?: string;
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
  companyColumn?: string;
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

export interface ActivityLog {
  id: string;
  timestamp: string; // ISO date string
  contactId: string;
  contactName: string;
  company?: string;
  channel: DispatchChannel;
  status: 'sent' | 'skipped';
  destination: string; // phone or email
  messagePreview?: string;
}
