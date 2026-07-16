import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquareWarning, Search, CheckCircle2, Clock, AlertCircle, Send, User, Calendar } from 'lucide-react';

interface Complaint {
  id: string;
  userName: string;
  userEmail: string;
  date: string;
  type: 'Missing Transaction' | 'App Bug' | 'Wrong Category' | 'Account Issue';
  status: 'Open' | 'In Progress' | 'Resolved';
  message: string;
  adminNotes: string;
}

const dummyComplaints: Complaint[] = [
  {
    id: 'c_001',
    userName: 'Rahul Sharma',
    userEmail: 'rahul@example.com',
    date: '2024-05-12 09:30 AM',
    type: 'Missing Transaction',
    status: 'Open',
    message: 'I paid Rs. 1500 for electricity bill via Google Pay yesterday, but it is not showing up in my dashboard. Please help!',
    adminNotes: ''
  },
  {
    id: 'c_002',
    userName: 'Sneha Reddy',
    userEmail: 'snehareddy@example.com',
    date: '2024-05-11 02:15 PM',
    type: 'Wrong Category',
    status: 'In Progress',
    message: 'My salary was credited but the app marked it as "Shopping" instead of "Income". How do I fix this?',
    adminNotes: 'Checked the rules engine. Added a rule for "SALARY" keyword. Waiting to confirm with user.'
  },
  {
    id: 'c_003',
    userName: 'Amit Kumar',
    userEmail: 'amit.k99@example.com',
    date: '2024-05-10 11:00 AM',
    type: 'App Bug',
    status: 'Resolved',
    message: 'The pie chart on the insights page is not loading on my iPhone Safari browser. It just shows a blank space.',
    adminNotes: 'Was a CSS issue with Webkit. Pushed a fix in v1.2.4.'
  }
];

export function AdminComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>(dummyComplaints);
  const [selectedId, setSelectedId] = useState<string | null>(dummyComplaints[0].id);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  
  const [noteInput, setNoteInput] = useState('');

  const selectedComplaint = complaints.find(c => c.id === selectedId);

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.userName.toLowerCase().includes(search.toLowerCase()) || 
                          c.userEmail.toLowerCase().includes(search.toLowerCase()) ||
                          c.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = (id: string, newStatus: Complaint['status']) => {
    setComplaints(complaints.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  const addNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !noteInput.trim()) return;
    
    setComplaints(complaints.map(c => {
      if (c.id === selectedId) {
        const newNotes = c.adminNotes 
          ? `${c.adminNotes}\n\n[Admin - ${new Date().toLocaleDateString()}]: ${noteInput}` 
          : `[Admin - ${new Date().toLocaleDateString()}]: ${noteInput}`;
        return { ...c, adminNotes: newNotes };
      }
      return c;
    }));
    setNoteInput('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'In Progress': return <Clock className="w-4 h-4 text-orange-400" />;
      case 'Resolved': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'In Progress': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'Resolved': return 'bg-green-500/10 text-green-400 border-green-500/20';
      default: return 'bg-zinc-800 text-zinc-400 border-white/10';
    }
  };

  return (
    <div className="flex-1 p-8 min-h-screen flex flex-col h-screen overflow-hidden">
      <header className="mb-6 flex justify-between items-end shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Support Tickets</h1>
          <p className="text-zinc-400 mt-1">Manage user complaints, bugs, and feedback.</p>
        </div>
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
            <AnimatePresence>
              {filteredComplaints.length === 0 ? (
                <div className="text-center text-zinc-500 text-sm mt-8">No tickets found.</div>
              ) : (
                filteredComplaints.map(ticket => (
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
                      <span className="text-xs font-bold text-white">#{ticket.id}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${getStatusColor(ticket.status)}`}>
                        {getStatusIcon(ticket.status)} {ticket.status}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-zinc-200 mb-1">{ticket.userName}</p>
                    <p className="text-xs text-zinc-400 font-medium mb-2">{ticket.type}</p>
                    <p className="text-xs text-zinc-500 line-clamp-2 italic">"{ticket.message}"</p>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Ticket Details (Right Panel) */}
        {selectedComplaint ? (
          <div className="lg:col-span-2 bg-zinc-900 border border-white/10 rounded-3xl flex flex-col overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />
            
            {/* Ticket Header */}
            <div className="p-6 border-b border-white/10 bg-black/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-white">Ticket #{selectedComplaint.id}</h2>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${getStatusColor(selectedComplaint.status)}`}>
                    {getStatusIcon(selectedComplaint.status)} {selectedComplaint.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-xs font-medium text-zinc-400">
                  <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {selectedComplaint.userName} ({selectedComplaint.userEmail})</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {selectedComplaint.date}</span>
                </div>
              </div>
              
              {/* Status Actions */}
              <div className="flex gap-2">
                {selectedComplaint.status !== 'Open' && (
                  <button onClick={() => updateStatus(selectedComplaint.id, 'Open')} className="px-3 py-1.5 text-xs font-bold bg-zinc-800 hover:bg-red-500/20 text-zinc-300 hover:text-red-400 rounded-lg border border-white/5 transition-colors">
                    Mark Open
                  </button>
                )}
                {selectedComplaint.status !== 'In Progress' && (
                  <button onClick={() => updateStatus(selectedComplaint.id, 'In Progress')} className="px-3 py-1.5 text-xs font-bold bg-zinc-800 hover:bg-orange-500/20 text-zinc-300 hover:text-orange-400 rounded-lg border border-white/5 transition-colors">
                    Mark In Progress
                  </button>
                )}
                {selectedComplaint.status !== 'Resolved' && (
                  <button onClick={() => updateStatus(selectedComplaint.id, 'Resolved')} className="px-3 py-1.5 text-xs font-bold bg-zinc-800 hover:bg-green-500/20 text-zinc-300 hover:text-green-400 rounded-lg border border-white/5 transition-colors">
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* User Message */}
              <div>
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <MessageSquareWarning className="w-4 h-4" /> Issue Description ({selectedComplaint.type})
                </h3>
                <div className="bg-zinc-950 border border-white/5 p-5 rounded-2xl">
                  <p className="text-zinc-200 leading-relaxed text-sm">
                    {selectedComplaint.message}
                  </p>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  Admin Internal Notes
                </h3>
                {selectedComplaint.adminNotes ? (
                  <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-2xl whitespace-pre-wrap text-sm text-blue-200 leading-relaxed">
                    {selectedComplaint.adminNotes}
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
                  placeholder="Type an internal note..." 
                  className="flex-1 bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button 
                  type="submit"
                  disabled={!noteInput.trim()}
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
            <p className="text-zinc-500 text-sm">Select a complaint from the queue to view details and respond.</p>
          </div>
        )}

      </div>
    </div>
  );
}
