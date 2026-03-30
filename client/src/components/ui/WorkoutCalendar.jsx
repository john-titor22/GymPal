import { useEffect, useState } from 'react';
import api from '../../api/axios';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS   = ['S','M','T','W','T','F','S'];

function toKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function cellColor(mins) {
  if (!mins)      return '#e5e7eb'; // gray-200
  if (mins < 30)  return '#bfdbfe'; // primary-200
  if (mins < 60)  return '#60a5fa'; // primary-400
  if (mins < 90)  return '#3b82f6'; // primary-500
  return           '#1d4ed8';       // primary-700
}

export function WorkoutCalendar({ weeks = 16, onData }) {
  const [data, setData] = useState({});

  useEffect(() => {
    api.get('/sessions', { params: { limit: 500 } })
      .then(({ data: res }) => {
        const sixAgo = new Date();
        sixAgo.setMonth(sixAgo.getMonth() - 6);
        const map = {};
        (res.sessions || []).forEach((s) => {
          if (!s.completedAt) return;
          const start = new Date(s.startedAt);
          if (start < sixAgo) return;
          const key = toKey(start);
          const mins = Math.max(1, Math.round((new Date(s.completedAt) - start) / 60000));
          map[key] = (map[key] || 0) + mins;
        });
        setData(map);
        onData?.(map);
      })
      .catch(() => {});
  }, []);

  // ── Build grid ──────────────────────────────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Sunday of current week
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay());

  // grid[week][day]  week 0 = leftmost (oldest)
  const grid = [];
  for (let w = 0; w < weeks; w++) {
    const col = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(sunday);
      date.setDate(sunday.getDate() + (w - (weeks - 1)) * 7 + d);
      if (date > today) {
        col.push(null);
      } else {
        const key = toKey(date);
        col.push({ key, mins: data[key] || 0 });
      }
    }
    grid.push(col);
  }

  // month labels — first column of each new month
  let lastMonth = -1;
  const monthRow = grid.map((col) => {
    const cell = col.find(Boolean);
    if (!cell) return '';
    const m = new Date(cell.key).getMonth();
    if (m !== lastMonth) { lastMonth = m; return MONTHS[m]; }
    return '';
  });

  const SZ = 13; // cell px
  const GAP = 3;

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'inline-flex', flexDirection: 'column', gap: GAP }}>

        {/* Month labels */}
        <div style={{ display: 'flex', gap: GAP, paddingLeft: 20 }}>
          {monthRow.map((label, i) => (
            <div key={i} style={{ width: SZ, fontSize: 9, color: '#9ca3af', whiteSpace: 'nowrap', fontWeight: 500 }}>
              {label}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: GAP }}>
          {/* Day labels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: GAP, width: 16 }}>
            {DAYS.map((d, i) => (
              <div key={i} style={{ height: SZ, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 2 }}>
                {[1, 3, 5].includes(i) && <span style={{ fontSize: 9, color: '#9ca3af', fontWeight: 500 }}>{d}</span>}
              </div>
            ))}
          </div>

          {/* Week columns */}
          {grid.map((col, wi) => (
            <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
              {col.map((cell, di) => (
                <div
                  key={di}
                  title={cell ? (cell.mins ? `${cell.key} · ${cell.mins < 60 ? `${cell.mins}m` : `${Math.floor(cell.mins/60)}h ${cell.mins%60}m`}` : cell.key) : ''}
                  style={{
                    width: SZ,
                    height: SZ,
                    borderRadius: 2,
                    backgroundColor: cell ? cellColor(cell.mins) : 'transparent',
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 20, marginTop: 2 }}>
          <span style={{ fontSize: 10, color: '#9ca3af' }}>Less</span>
          {[0, 15, 45, 75, 100].map((m) => (
            <div key={m} style={{ width: SZ, height: SZ, borderRadius: 2, backgroundColor: cellColor(m) }} />
          ))}
          <span style={{ fontSize: 10, color: '#9ca3af' }}>More</span>
        </div>

      </div>
    </div>
  );
}
