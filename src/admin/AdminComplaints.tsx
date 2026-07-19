import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquareWarning, Search, CheckCircle2, Clock, AlertCircle, Send, User, Calendar, RefreshCw } from 'lucide-react';
import { supportApi, type SupportTicketDTO } from '../services/supportApi';

export function AdminComplaints() {
  const [tickets, setTickets] = useState<SupportTicketDTO[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [noteInput, setNoteInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await supportApi.getAllTickets();
      setTickets(data);
      if (data.length > 0 && selectedId === null) {
        setSelectedId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
      setError('Could not fetch support tickets from backend.');
    } finally {
      setLoading(false);
    }
  };

  const selectedTicket = tickets.find(t => t.id === selectedId);

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.userName.toLowerCase().includes(search.toLowerCase()) || 
                          t.userEmail.toLowerCase().includes(search.toLowerCase()) ||
                          t.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
                          t.subject.toLowerCase().includes(search.toLowerCase());
    
    // Status mapping: OPEN, IN_PROGRESS, RESOLVED
    const statusFormatted = t.status === 'IN_PROGRESS' ? 'In Progress' : (t.status.charAt(0) + t.status.slice(1).toLowerCase());
    const matchesStatus = filterStatus === 'All' || statusFormatted === filterStatus || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      setIsSubmitting(true);
      const updated = await supportApi.updateTicketStatus(id, newStatus, selectedTicket?.adminNotes);
      setTickets(tickets.map(t => t.id === id ? updated : t));
    } catch (err) {
      alert('Failed to update ticket status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !noteInput.trim() || !selectedTicket) return;
    
    try {
      setIsSubmitting(true);
      const existingNotes = selectedTicket.adminNotes || '';
      const dateStr = new Date().toLocaleDateString();
      const updatedNotes = existingNotes 
        ? `${existingNotes}\n\n[Admin - ${dateStr}]: ${noteInput.trim()}`
        : `[Admin - ${dateStr}]: ${noteInput.trim()}`;

      const updated = await supportApi.updateTicketStatus(selectedId, selectedTicket.status, updatedNotes);
      setTickets(tickets.map(t => t.id === selectedId ? updated : t));
      setNoteInput('');
    } catch (err) {
      alert('Failed to add note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'OPEN': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'IN_PROGRESS': return <Clock className="w-4 h-4 text-orange-400" />;
      case 'RESOLVED': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'OPEN': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'IN_PROGRESS': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'RESOLVED': return 'bg-green-500/10 text-green-400 border-green-500/20';
      default: return 'bg-zinc-800 text-zinc-400 border-white/10';
    }
  };

  return (
    <div className="flex-1 p-8 min-h-screen flex flex-col h-screen overflow-hidden">
      <header className="mb-6 flex justify-between items-end shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Support Tickets</h1>
          <p className="text-zinc-400 mt-1">Manage user complaints, bugs, and feedback from database.</p>
        </div>
        <button
          onClick={loadTickets}
          className="p-2.5 bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white rounded-xl transition-colors flex items-center gap-2 text-sm font-bold"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Queue
        </button>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        
        {/* Ticket List (Left Panel) */}
        <div className="lg:col-span-1 bg-zinc-900 border border-white/10 rounded-3xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-black/20 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search tickets..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {['All', 'Open', 'In Progress', 'Resolved'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-colors ${
                    filterStatus === status 
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' 
                      : 'bg-zinc-950 text-zinc-400 border-white/5 hover:border-white/20'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {error && <div className="p-4 bg-red-500/10 text-red-400 text-xs rounded-xl text-center">{error}</div>}
            
            <AnimatePresence>
              {loading ? (
                <div className="p-12 text-center text-zinc-500">
                  <span className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin inline-block mb-2" />
                  <p className="text-xs">Fetching support tickets...</p>
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="text-center text-zinc-500 text-sm mt-8">No support tickets found.</div>
              ) : (
                filteredTickets.map(ticket => (
                  <motion.div
                    key={ticket.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => setSelectedId(ticket.id)}
                    className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                      selectedId === ticket.id 
                        ? 'bg-zinc-800 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                        : 'bg-zinc-950/50 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-indigo-400">{ticket.ticketNumber}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${getStatusColor(ticket.status)}`}>
                        {getStatusIcon(ticket.status)} {ticket.status}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-zinc-200 mb-1">{ticket.subject}</p>
                    <p className="text-xs text-zinc-400 font-medium mb-2">{ticket.userName} • {ticket.category}</p>
                    <p className="text-xs text-zinc-500 line-clamp-2 italic">"{ticket.description}"</p>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Ticket Details (Right Panel) */}
        {selectedTicket ? (
          <div className="lg:col-span-2 bg-zinc-900 border border-white/10 rounded-3xl flex flex-col overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />
            
            {/* Ticket Header */}
            <div className="p-6 border-b border-white/10 bg-black/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-white">{selectedTicket.ticketNumber}: {selectedTicket.subject}</h2>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${getStatusColor(selectedTicket.status)}`}>
                    {getStatusIcon(selectedTicket.status)} {selectedTicket.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-xs font-medium text-zinc-400">
                  <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {selectedTicket.userName} ({selectedTicket.userEmail})</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(selectedTicket.createdAt).toLocaleString()}</span>
                </div>
              </div>
              
              {/* Status Actions */}
              <div className="flex gap-2">
                {selectedTicket.status !== 'OPEN' && (
                  <button 
                    onClick={() => updateStatus(selectedTicket.id, 'OPEN')} 
                    disabled={isSubmitting}
                    className="px-3 py-1.5 text-xs font-bold bg-zinc-800 hover:bg-red-500/20 text-zinc-300 hover:text-red-400 rounded-lg border border-white/5 transition-colors disabled:opacity-50"
                  >
                    Mark Open
                  </button>
                )}
                {selectedTicket.status !== 'IN_PROGRESS' && (
                  <button 
                    onClick={() => updateStatus(selectedTicket.id, 'IN_PROGRESS')} 
                    disabled={isSubmitting}
                    className="px-3 py-1.5 text-xs font-bold bg-zinc-800 hover:bg-orange-500/20 text-zinc-300 hover:text-orange-400 rounded-lg border border-white/5 transition-colors disabled:opacity-50"
                  >
                    Mark In Progress
                  </button>
                )}
                {selectedTicket.status !== 'RESOLVED' && (
                  <button 
                    onClick={() => updateStatus(selectedTicket.id, 'RESOLVED')} 
                    disabled={isSubmitting}
                    className="px-3 py-1.5 text-xs font-bold bg-zinc-800 hover:bg-green-500/20 text-zinc-300 hover:text-green-400 rounded-lg border border-white/5 transition-colors disabled:opacity-50"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* User Message */}
              <div>
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <MessageSquareWarning className="w-4 h-4" /> Issue Description ({selectedTicket.category} • {selectedTicket.priority} Priority)
                </h3>
                <div className="bg-zinc-950 border border-white/5 p-5 rounded-2xl">
                  <p className="text-zinc-200 leading-relaxed text-sm whitespace-pre-wrap">
                    {selectedTicket.description}
                  </p>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  Admin Internal Notes & Responses
                </h3>
                {selectedTicket.adminNotes ? (
                  <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-2xl whitespace-pre-wrap text-sm text-blue-200 leading-relaxed">
                    {selectedTicket.adminNotes}
                  </div>
                ) : (
                  <div className="text-sm text-zinc-600 italic">No internal notes added yet.</div>
                )}
              </div>
            </div>

            {/* Add Note Input */}
            <div className="p-4 border-t border-white/10 bg-black/20">
              <form onSubmit={addNote} className="flex gap-3">
                <input 
                  type="text" 
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Type an admin note or response..." 
                  className="flex-1 bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button 
                  type="submit"
                  disabled={!noteInput.trim() || isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl transition-colors flex items-center gap-2 font-bold text-sm"
                >
                  <Send className="w-4 h-4" /> Add Note
                </button>
              </form>
            </div>
            
          </div>
        ) : (
          <div className="lg:col-span-2 bg-zinc-900 border border-white/10 rounded-3xl flex flex-col items-center justify-center p-12 text-center">
            <MessageSquareWarning className="w-16 h-16 text-zinc-700 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">No Ticket Selected</h2>
            <p className="text-zinc-500 text-sm">Select a ticket from the queue to view details and respond.</p>
          </div>
        )}

      </div>
    </div>
  );
}
