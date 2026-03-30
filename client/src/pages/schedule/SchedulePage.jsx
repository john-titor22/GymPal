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

// ── Helpers ──────────────────────────────────────────────────────────────────

function getMonday(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function toDateStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

function isSameDay(a, b) {
  return toDateStr(new Date(a)) === toDateStr(new Date(b));
}

const WEEK_DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

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

// ── Droppable day column ──────────────────────────────────────────────────────

function DayColumn({ date, entries, onRemove, onStartWorkout, isToday, isPast }) {
  const dateStr = toDateStr(date);
  const { setNodeRef, isOver } = useDroppable({ id: dateStr });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-h-[140px] rounded-2xl border transition ${
        isOver
          ? 'border-primary-400 bg-primary-50'
          : isToday
          ? 'border-primary-200 bg-primary-50/40'
          : 'border-gray-100 bg-white'
      }`}
    >
      {/* Day header */}
      <div className={`px-3 pt-3 pb-2 border-b ${isToday ? 'border-primary-100' : 'border-gray-50'}`}>
        <p className={`text-xs font-semibold ${isToday ? 'text-primary-600' : 'text-gray-400'}`}>
          {WEEK_DAYS[(date.getDay() + 6) % 7]}
        </p>
        <p className={`text-lg font-bold leading-tight ${isToday ? 'text-primary-600' : 'text-gray-900'}`}>
          {date.getDate()}
        </p>
      </div>

      {/* Scheduled items */}
      <div className="flex-1 px-2 py-2 space-y-1.5">
        {entries.map((entry) => (
          <ScheduledItem
            key={entry.id}
            entry={entry}
            onRemove={onRemove}
            onStart={onStartWorkout}
            isPast={isPast}
          />
        ))}

        {/* Drop hint */}
        {entries.length === 0 && (
          <div className={`h-10 rounded-lg border-2 border-dashed flex items-center justify-center transition ${
            isOver ? 'border-primary-300' : 'border-gray-100'
          }`}>
            {isOver && <span className="text-xs text-primary-400 font-medium">Drop here</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function ScheduledItem({ entry, onRemove, onStart, isPast }) {
  const sets = entry.routine?.exercises?.reduce((t, e) => t + (e.sets || 0), 0) ?? 0;
  return (
    <div className="group flex items-start gap-1.5 bg-white rounded-lg border border-gray-100 px-2.5 py-2 shadow-sm">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-900 truncate">{entry.routine?.name}</p>
        {sets > 0 && <p className="text-[10px] text-gray-400">{sets} sets</p>}
      </div>
      <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {!isPast && (
          <button
            onClick={() => onStart(entry)}
            className="w-5 h-5 rounded text-primary-500 hover:bg-primary-50 flex items-center justify-center"
            title="Start workout"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          </button>
        )}
        <button
          onClick={() => onRemove(entry.id)}
          className="w-5 h-5 rounded text-gray-400 hover:text-red-400 hover:bg-red-50 flex items-center justify-center"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Month cell (needs its own component so useDroppable isn't called in a loop)

function MonthCell({ date, inMonth, isToday, isPast, dayEntries, monthMonth, onRemove }) {
  const dateStr = toDateStr(date);
  const { setNodeRef, isOver } = useDroppable({ id: dateStr });
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[72px] rounded-xl border p-1.5 transition ${
        !inMonth ? 'border-transparent bg-transparent opacity-30' :
        isOver   ? 'border-primary-400 bg-primary-50' :
        isToday  ? 'border-primary-200 bg-primary-50/40' :
        'border-gray-100 bg-white'
      }`}
    >
      <p className={`text-xs font-bold mb-1 ${isToday ? 'text-primary-600' : 'text-gray-500'}`}>
        {date.getDate()}
      </p>
      <div className="space-y-0.5">
        {dayEntries.map((e) => (
          <div key={e.id} className="group flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
            <p className="text-[10px] font-medium text-gray-700 truncate flex-1">
              {e.routine?.name}
            </p>
            <button
              onClick={() => onRemove(e.id)}
              className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-opacity"
            >
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function SchedulePage() {
  const navigate = useNavigate();
  const { routines, fetchRoutines } = useRoutineStore();
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [entries, setEntries] = useState([]);
  const [activeRoutine, setActiveRoutine] = useState(null);
  const [view, setView] = useState('week'); // 'week' | 'month'
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
    if (view === 'week') {
      fetchRange(weekStart, addDays(weekStart, 6));
    } else {
      const end = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
      fetchRange(monthStart, end);
    }
  }, [weekStart, monthStart, view, fetchRange]);

  function handleDragStart(event) {
    const { data } = event.active;
    if (data.current?.type === 'routine') setActiveRoutine(data.current.routine);
  }

  async function handleDragEnd(event) {
    setActiveRoutine(null);
    const { active, over } = event;
    if (!over || !active.data.current?.routine) return;

    const routine = active.data.current.routine;
    const dateStr = over.id; // e.g. '2026-03-30'
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return;

    try {
      const { data } = await scheduleApi.create({ routineId: routine.id, date: dateStr });
      setEntries((prev) => [...prev, data]);
    } catch { /* ignore */ }
  }

  async function handleRemove(entryId) {
    try {
      await scheduleApi.remove(entryId);
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
    } catch { /* ignore */ }
  }

  function handleStartWorkout(entry) {
    navigate('/session', { state: { routineId: entry.routineId, routineName: entry.routine?.name } });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ── Week view ───────────────────────────────────────────────────────────────

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const weekLabel = (() => {
    const from = weekDays[0];
    const to   = weekDays[6];
    const opts = { month: 'short', day: 'numeric' };
    if (from.getMonth() === to.getMonth()) {
      return `${from.toLocaleDateString('en-US', { month: 'short' })} ${from.getDate()}–${to.getDate()}, ${from.getFullYear()}`;
    }
    return `${from.toLocaleDateString('en-US', opts)} – ${to.toLocaleDateString('en-US', opts)}, ${to.getFullYear()}`;
  })();

  // ── Month view ──────────────────────────────────────────────────────────────

  const monthDays = (() => {
    const year  = monthStart.getFullYear();
    const month = monthStart.getMonth();
    const first = new Date(year, month, 1);
    const last  = new Date(year, month + 1, 0);
    // Pad to Monday-aligned grid
    const startPad = (first.getDay() + 6) % 7;
    const days = [];
    for (let i = -startPad; i < last.getDate(); i++) {
      days.push(new Date(year, month, i + 1));
    }
    // Pad end to complete last row
    while (days.length % 7 !== 0) days.push(new Date(year, month, days.length - startPad + 1));
    return days;
  })();

  const monthLabel = monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-4 pb-32 md:pb-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1 text-sm font-semibold rounded-lg transition ${view === 'week' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}
            >Week</button>
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1 text-sm font-semibold rounded-lg transition ${view === 'month' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}
            >Month</button>
          </div>
        </div>

        {/* Routines panel */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
          <p className="text-xs font-semibold text-gray-400 mb-2.5 uppercase tracking-wide">Drag to schedule</p>
          {routines.length === 0 ? (
            <p className="text-sm text-gray-400">No routines yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {routines.map((r) => <DraggableRoutine key={r.id} routine={r} />)}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => view === 'week'
              ? setWeekStart((w) => addDays(w, -7))
              : setMonthStart((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))
            }
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button
            onClick={() => {
              if (view === 'week') setWeekStart(getMonday(new Date()));
              else setMonthStart(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
            }}
            className="text-sm font-semibold text-gray-700 hover:text-primary-600 transition"
          >
            {view === 'week' ? weekLabel : monthLabel}
          </button>
          <button
            onClick={() => view === 'week'
              ? setWeekStart((w) => addDays(w, 7))
              : setMonthStart((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))
            }
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        {/* ── Week grid ── */}
        {view === 'week' && (
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((date) => {
              const dateStr = toDateStr(date);
              const dayEntries = entries.filter((e) => isSameDay(e.date, date));
              const isToday = toDateStr(date) === toDateStr(today);
              const isPast  = date < today;
              return (
                <DayColumn
                  key={dateStr}
                  date={date}
                  entries={dayEntries}
                  onRemove={handleRemove}
                  onStartWorkout={handleStartWorkout}
                  isToday={isToday}
                  isPast={isPast}
                />
              );
            })}
          </div>
        )}

        {/* ── Month grid ── */}
        {view === 'month' && (
          <div>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-1">
              {WEEK_DAYS.map((d) => (
                <p key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</p>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((date, i) => {
                const inMonth    = date.getMonth() === monthStart.getMonth();
                const isToday    = toDateStr(date) === toDateStr(today);
                const isPast     = date < today;
                const dayEntries = entries.filter((e) => isSameDay(e.date, date));
                return (
                  <MonthCell
                    key={i}
                    date={date}
                    inMonth={inMonth}
                    isToday={isToday}
                    isPast={isPast}
                    dayEntries={dayEntries}
                    onRemove={handleRemove}
                  />
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeRoutine && (
          <div className="px-3 py-2 rounded-xl border border-primary-300 bg-primary-50 text-sm font-semibold text-primary-600 shadow-lg cursor-grabbing">
            {activeRoutine.name}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
