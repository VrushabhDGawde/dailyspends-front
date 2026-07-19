import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, HelpCircle, CheckCircle2, Clock, AlertCircle, MessageSquare, Plus, Edit2, Trash2, Save, RotateCcw } from 'lucide-react';
import { supportApi, type SupportTicketDTO } from '../services/supportApi';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const [activeTab, setActiveTab] = useState<'raise' | 'history'>('raise');
  const [tickets, setTickets] = useState<SupportTicketDTO[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // New Ticket Form State
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Bug Report');
  const [priority, setPriority] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Editing Ticket State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editCategory, setEditCategory] = useState('Bug Report');
  const [editPriority, setEditPriority] = useState('MEDIUM');
  const [editDescription, setEditDescription] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await supportApi.getMyTickets();
      setTickets(data);
    } catch (err) {
      console.error('Failed to load user tickets:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const newTicket = await supportApi.createTicket({
        subject,
        category,
        priority,
        description,
      });

      setSuccessMsg(`Ticket #${newTicket.ticketNumber} created successfully! Our team will inspect it soon.`);
      setSubject('');
      setDescription('');
      loadHistory();
      
      // Auto switch to history tab after 1.5 seconds
      setTimeout(() => {
        setSuccessMsg('');
        setActiveTab('history');
      }, 1500);
    } catch (err: any) {
      console.error('Failed to create ticket:', err);
      const serverMessage = err.response?.data?.message || err.response?.data?.error || err.message;
      setErrorMsg(serverMessage || 'Failed to submit ticket. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (t: SupportTicketDTO) => {
    setEditingId(t.id);
    setEditSubject(t.subject);
    setEditCategory(t.category);
    setEditPriority(t.priority || 'MEDIUM');
    setEditDescription(t.description);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (id: number) => {
    if (!editSubject.trim() || !editDescription.trim()) return;
    setActionLoading(true);
    try {
      const updated = await supportApi.updateTicket(id, {
        subject: editSubject,
        category: editCategory,
        priority: editPriority,
        description: editDescription,
      });
      setTickets(tickets.map(t => t.id === id ? updated : t));
      setEditingId(null);
    } catch (err) {
      alert('Failed to update ticket. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this support ticket?')) return;
    setActionLoading(true);
    try {
      await supportApi.deleteTicket(id);
      setTickets(tickets.filter(t => t.id !== id));
      if (editingId === id) setEditingId(null);
    } catch (err) {
      alert('Failed to delete ticket. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <span className="px-2.5 py-1 text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> Open</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-1 text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full flex items-center gap-1"><AlertCircle className="w-3 h-3" /> In Progress</span>;
      case 'RESOLVED':
        return <span className="px-2.5 py-1 text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Resolved</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full">{status}</span>;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 dark:text-indigo-400 border border-indigo-500/20">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white">Help & Support</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Raise a ticket, edit, or track existing requests</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-xl hover:bg-zinc-200 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-zinc-200 dark:border-white/10 px-6 bg-zinc-100 dark:bg-zinc-950/20">
            <button
              onClick={() => setActiveTab('raise')}
              className={`py-3.5 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-all ${
                activeTab === 'raise'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Plus className="w-4 h-4" /> Raise New Ticket
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-3.5 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-all ${
                activeTab === 'history'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" /> My Tickets ({tickets.length})
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto flex-1">
            {activeTab === 'raise' ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                {successMsg && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> {successMsg}
                  </div>
                )}
                {errorMsg && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm font-semibold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" /> {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary of your issue..."
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                      <option value="Bug Report">Bug Report</option>
                      <option value="Billing Issue">Billing Issue</option>
                      <option value="Account Access">Account Access</option>
                      <option value="Feature Request">Feature Request</option>
                      <option value="General Inquiry">General Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                      Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please explain the issue or feedback in detail..."
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Submit Support Ticket
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                {loadingHistory ? (
                  <div className="p-8 text-center text-zinc-500">
                    <span className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin inline-block mb-2" />
                    <p className="text-sm">Loading your tickets...</p>
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl border border-zinc-200 dark:border-white/5 text-zinc-500 dark:text-zinc-400">
                    <HelpCircle className="w-10 h-10 text-zinc-400 dark:text-zinc-600 mx-auto mb-2" />
                    <p className="font-semibold text-zinc-900 dark:text-white">No Support Tickets Raised</p>
                    <p className="text-xs text-zinc-500 mt-1">If you experience any issues, raise a ticket using the form above.</p>
                  </div>
                ) : (
                  tickets.map((t) => (
                    <div
                      key={t.id}
                      className="bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 space-y-3 hover:border-zinc-300 dark:hover:border-white/20 transition-all shadow-sm dark:shadow-none"
                    >
                      {editingId === t.id ? (
                        /* Edit Form Inline */
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-indigo-400">Editing #{t.ticketNumber}</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSaveEdit(t.id)}
                                disabled={actionLoading}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                              >
                                <Save className="w-3.5 h-3.5" /> Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                disabled={actionLoading}
                                className="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                              >
                                <RotateCcw className="w-3.5 h-3.5" /> Cancel
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Subject</label>
                            <input
                              type="text"
                              value={editSubject}
                              onChange={(e) => setEditSubject(e.target.value)}
                              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Category</label>
                              <select
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
                              >
                                <option value="Bug Report">Bug Report</option>
                                <option value="Billing Issue">Billing Issue</option>
                                <option value="Account Access">Account Access</option>
                                <option value="Feature Request">Feature Request</option>
                                <option value="General Inquiry">General Inquiry</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Priority</label>
                              <select
                                value={editPriority}
                                onChange={(e) => setEditPriority(e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
                              >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Description</label>
                            <textarea
                              rows={3}
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
                            />
                          </div>
                        </div>
                      ) : (
                        /* Ticket Display View */
                        <>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-black text-indigo-400">{t.ticketNumber}</span>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                                  {t.category}
                                </span>
                              </div>
                              <h3 className="font-bold text-zinc-900 dark:text-white text-base">{t.subject}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(t.status)}
                              
                              {/* Edit & Delete Action Buttons */}
                              <button
                                onClick={() => startEdit(t)}
                                className="p-1.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-zinc-200 dark:border-white/5 rounded-lg transition-colors"
                                title="Edit Ticket"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(t.id)}
                                className="p-1.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-rose-50 dark:hover:bg-rose-500/20 text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 border border-zinc-200 dark:border-white/5 rounded-lg transition-colors"
                                title="Delete Ticket"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <p className="text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200 dark:border-white/5 whitespace-pre-wrap">
                            {t.description}
                          </p>

                          {t.adminNotes && (
                            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 space-y-1">
                              <span className="font-bold text-indigo-400 uppercase tracking-wider text-[10px]">
                                Admin Resolution Response:
                              </span>
                              <p>{t.adminNotes}</p>
                            </div>
                          )}

                          <div className="text-[11px] text-zinc-500 text-right">
                            Submitted on {new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
