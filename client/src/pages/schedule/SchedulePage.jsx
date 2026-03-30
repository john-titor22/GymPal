import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import { useRoutineStore } from '../../store/routineStore';
import { scheduleApi } from '../../api/schedule.api';

// ── Helpers ───────────────────────────────────────────────────────────────────

function toDateStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function isSameDay(a, b) {
  return toDateStr(new Date(a)) === toDateStr(new Date(b));
}

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

// ── Draggable routine chip ────────────────────────────────────────────────────

function DraggableRoutine({ routine }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `routine-${routine.id}`,
    data: { type: 'routine', routine },
  });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`px-3 py-2 rounded-xl border text-sm font-semibold cursor-grab select-none transition ${
        isDragging
          ? 'opacity-40 border-primary-300 bg-primary-50 text-primary-600'
          : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600'
      }`}
    >
      {routine.name}
      <span className="ml-1.5 text-xs font-normal text-gray-400">
        {routine.exercises?.length ?? 0}ex
      </span>
    </div>
  );
}

// ── Month cell ────────────────────────────────────────────────────────────────

function MonthCell({ date, inMonth, isToday, dayEntries, onDrop, onClick }) {
  const dateStr = toDateStr(date);
  const { setNodeRef, isOver } = useDroppable({ id: dateStr });

  return (
    <div
      ref={setNodeRef}
      onClick={() => inMonth && onClick(date)}
      className={`min-h-[80px] rounded-xl border p-1.5 transition ${
        !inMonth   ? 'border-transparent bg-transparent opacity-20 pointer-events-none' :
        isOver     ? 'border-primary-400 bg-primary-50' :
        isToday    ? 'border-primary-200 bg-primary-50/40' :
        'border-gray-100 bg-white hover:border-gray-200 cursor-pointer'
      }`}
    >
      <p className={`text-xs font-bold mb-1 ${isToday ? 'text-primary-600' : 'text-gray-500'}`}>
        {date.getDate()}
      </p>
      <div className="space-y-0.5">
        {dayEntries.slice(0, 3).map((e) => (
          <div key={e.id} className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
            <p className="text-[10px] font-medium text-gray-700 truncate">{e.routine?.name}</p>
          </div>
        ))}
        {dayEntries.length > 3 && (
          <p className="text-[10px] text-gray-400">+{dayEntries.length - 3} more</p>
        )}
      </div>
    </div>
  );
}

// ── Day modal ─────────────────────────────────────────────────────────────────

function DayModal({ date, entries, routines, onAdd, onRemove, onStart, onClose }) {
  const [adding, setAdding] = useState(false);
  const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

  const dateLabel = date.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full md:max-w-sm bg-white rounded-t-3xl md:rounded-2xl shadow-xl z-10 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Schedule</p>
            <p className="text-base font-bold text-gray-900">{dateLabel}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
          {entries.length === 0 && !adding && (
            <p className="text-sm text-gray-400 text-center py-4">No routines scheduled.</p>
          )}

          {entries.map((entry) => {
            const sets = entry.routine?.exercises?.reduce((t, e) => t + (e.sets || 0), 0) ?? 0;
            return (
              <div
                key={entry.id}
                className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-3 border border-gray-100"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{entry.routine?.name}</p>
                  {sets > 0 && <p className="text-xs text-gray-400">{sets} sets</p>}
                </div>
                {!isPast && (
                  <button
                    onClick={() => onStart(entry)}
                    className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center hover:bg-primary-100 transition shrink-0"
                    title="Start"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </button>
                )}
                <button
                  onClick={() => onRemove(entry.id)}
                  className="w-8 h-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            );
          })}

          {/* Add routine picker */}
          {adding && (
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              {routines.length === 0 && (
                <p className="text-sm text-gray-400 px-3 py-3">No routines created yet.</p>
              )}
              {routines.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { onAdd(r); setAdding(false); }}
                  className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-gray-50 border-b border-gray-50 last:border-0 transition"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.exercises?.length ?? 0} exercises</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-6 pt-3 border-t border-gray-100">
          {adding ? (
            <button
              onClick={() => setAdding(false)}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="w-full py-2.5 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 transition"
            >
              + Add routine
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function SchedulePage() {
  const navigate = useNavigate();
  const { routines, fetchRoutines } = useRoutineStore();
  const [entries, setEntries] = useState([]);
  const [activeRoutine, setActiveRoutine] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null); // Date | null
  const [monthStart, setMonthStart] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 200, tolerance: 8 } }),
  );

  useEffect(() => { fetchRoutines(); }, [fetchRoutines]);

  const fetchRange = useCallback(async (from, to) => {
    try {
      const { data } = await scheduleApi.getRange(toDateStr(from), toDateStr(to));
      setEntries(data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const end = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
    fetchRange(monthStart, end);
  }, [monthStart, fetchRange]);

  // DnD handlers
  function handleDragStart(event) {
    const { data } = event.active;
    if (data.current?.type === 'routine') setActiveRoutine(data.current.routine);
  }

  async function handleDragEnd(event) {
    setActiveRoutine(null);
    const { active, over } = event;
    if (!over || !active.data.current?.routine) return;
    const routine = active.data.current.routine;
    const dateStr = over.id;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return;
    try {
      const { data } = await scheduleApi.create({ routineId: routine.id, date: dateStr });
      setEntries((prev) => [...prev, data]);
    } catch { /* ignore */ }
  }

  // Modal handlers
  async function handleAdd(routine) {
    if (!selectedDay) return;
    try {
      const { data } = await scheduleApi.create({ routineId: routine.id, date: toDateStr(selectedDay) });
      setEntries((prev) => [...prev, data]);
    } catch { /* ignore */ }
  }

  async function handleRemove(entryId) {
    try {
      await scheduleApi.remove(entryId);
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
    } catch { /* ignore */ }
  }

  function handleStart(entry) {
    navigate('/session', { state: { routineId: entry.routineId, routineName: entry.routine?.name } });
  }

  // Month grid data
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthDays = (() => {
    const year  = monthStart.getFullYear();
    const month = monthStart.getMonth();
    const first = new Date(year, month, 1);
    const last  = new Date(year, month + 1, 0);
    const startPad = (first.getDay() + 6) % 7;
    const days = [];
    for (let i = -startPad; i < last.getDate(); i++) {
      days.push(new Date(year, month, i + 1));
    }
    while (days.length % 7 !== 0) days.push(new Date(year, month, days.length - startPad + 1));
    return days;
  })();

  const selectedDayEntries = selectedDay
    ? entries.filter((e) => isSameDay(e.date, selectedDay))
    : [];

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-4 pb-32 md:pb-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
        </div>

        {/* Routines drag panel — desktop only (mobile uses modal) */}
        <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
          <p className="text-xs font-semibold text-gray-400 mb-2.5 uppercase tracking-wide">Drag to schedule</p>
          {routines.length === 0 ? (
            <p className="text-sm text-gray-400">No routines yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {routines.map((r) => <DraggableRoutine key={r.id} routine={r} />)}
            </div>
          )}
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setMonthStart((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button
            onClick={() => setMonthStart(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
            className="text-sm font-bold text-gray-800 hover:text-primary-600 transition"
          >
            {MONTH_NAMES[monthStart.getMonth()]} {monthStart.getFullYear()}
          </button>
          <button
            onClick={() => setMonthStart((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        {/* Month grid */}
        <div>
          <div className="grid grid-cols-7 mb-1">
            {WEEK_DAYS.map((d) => (
              <p key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</p>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((date, i) => {
              const inMonth    = date.getMonth() === monthStart.getMonth();
              const isToday    = toDateStr(date) === toDateStr(today);
              const dayEntries = entries.filter((e) => isSameDay(e.date, date));
              return (
                <MonthCell
                  key={i}
                  date={date}
                  inMonth={inMonth}
                  isToday={isToday}
                  dayEntries={dayEntries}
                  onClick={setSelectedDay}
                />
              );
            })}
          </div>
        </div>

        {/* Mobile hint */}
        <p className="md:hidden text-xs text-gray-400 text-center">Tap a day to add or manage routines</p>

      </div>

      {/* DnD drag overlay */}
      <DragOverlay>
        {activeRoutine && (
          <div className="px-3 py-2 rounded-xl border border-primary-300 bg-primary-50 text-sm font-semibold text-primary-600 shadow-lg cursor-grabbing">
            {activeRoutine.name}
          </div>
        )}
      </DragOverlay>

      {/* Day modal */}
      {selectedDay && (
        <DayModal
          date={selectedDay}
          entries={selectedDayEntries}
          routines={routines}
          onAdd={handleAdd}
          onRemove={handleRemove}
          onStart={handleStart}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </DndContext>
  );
}
