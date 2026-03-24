import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Plus, X, Loader2,
  CalendarDays, BookOpen, Megaphone, FileText, CheckCircle2,
} from 'lucide-react';
import axiosInstance from './axiosInstance';

// ── helpers ──────────────────────────────────────────────────
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

const TYPE_META = {
  Event:  { color: 'bg-blue-500',   light: 'bg-blue-500/15 text-blue-300 border-blue-500/20',   icon: Megaphone },
  Course: { color: 'bg-teal-500', light: 'bg-teal-500/15 text-teal-300 border-teal-500/20', icon: BookOpen },
  Notice: { color: 'bg-amber-500',  light: 'bg-amber-500/15 text-amber-300 border-amber-500/20',  icon: FileText },
};

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

// ── sub-components ────────────────────────────────────────────
const TypeBadge = ({ type }) => {
  const meta = TYPE_META[type] || TYPE_META.Event;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.light}`}>
      <Icon size={9} /> {type}
    </span>
  );
};

// ── Broadcast Modal ───────────────────────────────────────────
const BroadcastModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({ title: '', date: '', description: '', type: 'Event' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date) return;
    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/events', form);
      setToast(`✅ Broadcast sent to ${data.emailsSent} students!`);
      setTimeout(() => { onSuccess(data.event); onClose(); }, 1800);
    } catch (err) {
      setToast(`❌ ${err.response?.data?.error || 'Failed to broadcast'}`);
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        className="relative w-full max-w-md rounded-2xl p-6 z-10"
        style={{ background: 'rgba(10,18,28,0.97)', border: '1px solid rgba(255,255,255,0.08)' }}
        initial={{ scale: 0.92, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 24, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      >
        {/* header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
              <Megaphone size={16} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">Broadcast Event</h2>
              <p className="text-white/30 text-xs">Emails all registered students</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-4 text-sm px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/80"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-1.5">Title *</label>
            <input aria-label="Input field" 
              value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="e.g. Campus Placement Drive 2025"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition-colors"
              required
            />
          </div>

          {/* Date + Type row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-1.5">Date *</label>
              <input aria-label="Input field" 
                type="date" value={form.date} onChange={e => set('date', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors [color-scheme:dark]"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-1.5">Type</label>
              <select
                value={form.type} onChange={e => set('type', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
              >
                <option value="Event" className="bg-[#0a121c]">Event</option>
                <option value="Course" className="bg-[#0a121c]">Course</option>
                <option value="Notice" className="bg-[#0a121c]">Notice</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-1.5">Description</label>
            <textarea
              value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Add details about this event..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all
              bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500
              text-white shadow-lg shadow-emerald-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Sending emails…</>
            ) : (
              <><Megaphone size={16} /> Broadcast to All Students</>
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

// ── Main Calendar Page ────────────────────────────────────────
const EmployeeCalendar = () => {
  const today = new Date();
  const [year, setYear]     = useState(today.getFullYear());
  const [month, setMonth]   = useState(today.getMonth());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null); // selected date string YYYY-MM-DD

  useEffect(() => {
    axiosInstance.get('/events')
      .then(r => setEvents(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  // Map events to date strings for quick lookup
  const eventsByDate = events.reduce((acc, ev) => {
    const d = new Date(ev.date).toISOString().slice(0, 10);
    if (!acc[d]) acc[d] = [];
    acc[d].push(ev);
    return acc;
  }, {});

  const daysInMonth  = getDaysInMonth(year, month);
  const firstDay     = getFirstDayOfMonth(year, month);
  const totalCells   = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const todayStr = today.toISOString().slice(0, 10);

  const selectedEvents = selected ? (eventsByDate[selected] || []) : [];

  const handleSuccess = (newEvent) => {
    setEvents(prev => [...prev, newEvent]);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Event Calendar</h1>
          <p className="text-white/30 text-sm mt-0.5">Broadcast events & notices to all students</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm
            bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500
            text-white shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Plus size={16} /> Add Event
        </motion.button>
      </motion.div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* ── Calendar grid ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.05 }}
          className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>

          {/* Month nav */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-white/8 text-white/50 hover:text-white transition-colors">
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-white font-bold text-lg">{MONTHS[month]} {year}</h2>
            <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-white/8 text-white/50 hover:text-white transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[11px] font-bold text-white/25 uppercase tracking-wider py-1">{d}</div>
            ))}
          </div>

          {/* Cells */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: totalCells }).map((_, i) => {
              const dayNum = i - firstDay + 1;
              const isValid = dayNum >= 1 && dayNum <= daysInMonth;
              if (!isValid) return <div key={i} />;

              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayEvents = eventsByDate[dateStr] || [];
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selected;

              return (
                <motion.button key={i} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setSelected(isSelected ? null : dateStr)}
                  className={`relative aspect-square flex flex-col items-center justify-start pt-1.5 rounded-xl text-sm font-semibold transition-all
                    ${isSelected ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                      : isToday ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                      : 'hover:bg-white/5 text-white/60 border border-transparent'}`}
                >
                  <span className={`text-xs font-bold ${isToday && !isSelected ? 'text-emerald-400' : ''}`}>{dayNum}</span>
                  {/* event dots */}
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center px-1">
                      {dayEvents.slice(0, 3).map((ev, ei) => (
                        <span key={ei} className={`w-1.5 h-1.5 rounded-full ${TYPE_META[ev.type]?.color || 'bg-blue-500'}`} />
                      ))}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-5 pt-4 border-t border-white/5">
            {Object.entries(TYPE_META).map(([type, meta]) => (
              <div key={type} className="flex items-center gap-1.5 text-xs text-white/35">
                <span className={`w-2 h-2 rounded-full ${meta.color}`} /> {type}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Side panel ── */}
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, delay: 0.1 }}
          className="space-y-4">

          {/* Selected day events */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h3 className="text-sm font-bold text-white/60 mb-3 flex items-center gap-2">
              <CalendarDays size={14} />
              {selected
                ? new Date(selected + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                : 'Select a date'}
            </h3>
            {!selected ? (
              <p className="text-white/20 text-xs text-center py-6">Click any date to see events</p>
            ) : selectedEvents.length === 0 ? (
              <p className="text-white/20 text-xs text-center py-6">No events on this day</p>
            ) : (
              <div className="space-y-2">
                {selectedEvents.map(ev => (
                  <div key={ev._id} className="p-3 rounded-xl bg-white/4 border border-white/6">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-white leading-tight">{ev.title}</p>
                      <TypeBadge type={ev.type} />
                    </div>
                    {ev.description && <p className="text-xs text-white/35 line-clamp-2">{ev.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming events */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h3 className="text-sm font-bold text-white/60 mb-3">Upcoming Events</h3>
            {loading ? (
              <div className="flex justify-center py-6"><Loader2 size={18} className="animate-spin text-white/20" /></div>
            ) : events.length === 0 ? (
              <p className="text-white/20 text-xs text-center py-6">No events yet. Broadcast one!</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                {[...events]
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .filter(ev => new Date(ev.date) >= new Date(todayStr))
                  .slice(0, 8)
                  .map(ev => {
                    const d = new Date(ev.date);
                    return (
                      <div key={ev._id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/4 transition-colors">
                        <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex flex-col items-center justify-center text-white ${TYPE_META[ev.type]?.color || 'bg-blue-500'}`}>
                          <span className="text-[10px] font-black leading-none">{d.getDate()}</span>
                          <span className="text-[8px] uppercase leading-none opacity-80">{MONTHS[d.getMonth()].slice(0,3)}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white/80 truncate">{ev.title}</p>
                          <TypeBadge type={ev.type} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(TYPE_META).map(([type, meta]) => {
              const count = events.filter(e => e.type === type).length;
              const Icon = meta.icon;
              return (
                <div key={type} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <Icon size={14} className={`mx-auto mb-1 ${meta.light.split(' ')[1]}`} />
                  <p className="text-lg font-black text-white">{count}</p>
                  <p className="text-[10px] text-white/30">{type}s</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Broadcast Modal */}
      <AnimatePresence>
        {showModal && (
          <BroadcastModal
            onClose={() => setShowModal(false)}
            onSuccess={handleSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployeeCalendar;
