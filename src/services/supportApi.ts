import axios from 'axios';
import apiClient from './apiClient';

export interface SupportTicketDTO {
  id: number;
  ticketNumber: string;
  userId: number;
  userName: string;
  userEmail: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  description: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketRequest {
  subject: string;
  category: string;
  priority?: string;
  description: string;
}

// User-facing Axios instance with AuthContext token
const getAuthHeaders = () => {
  const token = localStorage.getItem('spendsense_auth_token') || localStorage.getItem('spendsense_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Admin-facing Axios instance
const getAdminHeaders = () => {
  const token = localStorage.getItem('spendsense_admin_token') || localStorage.getItem('spendsense_auth_token') || localStorage.getItem('spendsense_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const supportApi = {
  // User: Raise a ticket
  createTicket: async (request: CreateTicketRequest): Promise<SupportTicketDTO> => {
    const response = await apiClient.post('/support/tickets', request);
    return response.data;
  },

  // User: Get my tickets
  getMyTickets: async (): Promise<SupportTicketDTO[]> => {
    const response = await apiClient.get('/support/tickets/my');
    return response.data;
  },

  // User: Edit a ticket
  updateTicket: async (id: number, request: CreateTicketRequest): Promise<SupportTicketDTO> => {
    const response = await apiClient.put(`/user/support/tickets/${id}`, request);
    return response.data;
  },

  // User: Delete a ticket
  deleteTicket: async (id: number): Promise<void> => {
    await apiClient.delete(`/user/support/tickets/${id}`);
  },

  // Admin: Get all tickets
  getAllTickets: async (): Promise<SupportTicketDTO[]> => {
    const response = await axios.get('/api/v1/admin/support/tickets', {
      headers: getAdminHeaders(),
    });
    return response.data;
  },

  // Admin: Update ticket status/notes
  updateTicketStatus: async (
    id: number,
    status: string,
    adminNotes?: string
  ): Promise<SupportTicketDTO> => {
    const response = await axios.put(
      `/api/v1/admin/support/tickets/${id}`,
      { status, adminNotes },
      { headers: getAdminHeaders() }
    );
    return response.data;
  },
};
