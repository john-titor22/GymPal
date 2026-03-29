function dateKey(d) {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_LABELS = ['S','M','T','W','T','F','S'];

export function WorkoutCalendar({ data = {}, weeks = 16 }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Sunday of the current week
  const sundayThisWeek = new Date(today);
  sundayThisWeek.setDate(today.getDate() - today.getDay());

  // Build grid: array[week][day], week 0 = leftmost (oldest)
  const grid = [];
  for (let w = 0; w < weeks; w++) {
    const col = [];
    for (let d = 0; d < 7; d++) {
      const offset = (w - (weeks - 1)) * 7 + d; // negative = past, 0 = this Sunday, positive = future
      const date = new Date(sundayThisWeek);
      date.setDate(sundayThisWeek.getDate() + offset);
      if (date > today) {
        col.push({ key: null, minutes: 0 });
      } else {
        const key = dateKey(date);
        col.push({ key, minutes: data[key] || 0 });
      }
    }
    grid.push(col);
  }

  // Month labels: first column of each new month
  let lastMonth = -1;
  const monthLabels = grid.map((col) => {
    const cell = col.find((c) => c.key);
    if (!cell) return null;
    const m = new Date(cell.key).getMonth();
    if (m !== lastMonth) { lastMonth = m; return MONTHS[m]; }
    return null;
  });

  function cellColor(minutes) {
    if (!minutes) return 'bg-gray-100';
    if (minutes < 30) return 'bg-primary-200';
    if (minutes < 60) return 'bg-primary-400';
    if (minutes < 90) return 'bg-primary-500';
    return 'bg-primary-700';
  }

  function tip(cell) {
    if (!cell.key || !cell.minutes) return cell.key || '';
    const h = Math.floor(cell.minutes / 60);
    const m = cell.minutes % 60;
    return `${cell.key} · ${h > 0 ? `${h}h ` : ''}${m}m`;
  }

  const CELL = 13;
  const GAP = 3;

  return (
    <div className="overflow-x-auto">
      <div style={{ display: 'inline-flex', flexDirection: 'column', gap: GAP }}>

        {/* Month row */}
        <div style={{ display: 'flex', gap: GAP, marginLeft: 18 }}>
          {grid.map((_, wi) => (
            <div key={wi} style={{ width: CELL, fontSize: 9, color: '#9ca3af', fontWeight: 500, whiteSpace: 'nowrap' }}>
              {monthLabels[wi] || ''}
            </div>
          ))}
        </div>

        {/* Day labels + cells */}
        <div style={{ display: 'flex', gap: GAP }}>

          {/* Day-of-week labels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: GAP, width: 14, marginRight: 1 }}>
            {DAY_LABELS.map((label, i) => (
              <div key={i} style={{ height: CELL, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                {[1, 3, 5].includes(i) && (
                  <span style={{ fontSize: 9, color: '#9ca3af', fontWeight: 500 }}>{label}</span>
                )}
              </div>
            ))}
          </div>

          {/* Week columns */}
          {grid.map((col, wi) => (
            <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
              {col.map((cell, di) => (
                <div
                  key={di}
                  title={tip(cell)}
                  style={{ width: CELL, height: CELL, borderRadius: 2 }}
                  className={cell.key ? cellColor(cell.minutes) : ''}
                />
              ))}
            </div>
          ))}

        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 18, marginTop: 2 }}>
          <span style={{ fontSize: 10, color: '#9ca3af' }}>Less</span>
          {[0, 15, 45, 75, 100].map((m) => (
            <div key={m} style={{ width: CELL, height: CELL, borderRadius: 2 }} className={cellColor(m)} />
          ))}
          <span style={{ fontSize: 10, color: '#9ca3af' }}>More</span>
        </div>

      </div>
    </div>
  );
}
