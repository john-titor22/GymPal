function dateKey(d) {
  return (
    d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0')
  );
}

export function WorkoutCalendar({ data = {}, weeks = 16 }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayDow = today.getDay(); // 0=Sun
  // Sunday of the oldest visible week
  const gridStart = new Date(today);
  gridStart.setDate(today.getDate() - todayDow - (weeks - 1) * 7);

  // Build grid: array of week-columns (left=oldest, right=newest), 7 rows (Sun→Sat)
  const grid = [];
  for (let w = 0; w < weeks; w++) {
    const col = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + w * 7 + d);
      if (date > today) {
        col.push({ key: null, minutes: 0 });
      } else {
        const key = dateKey(date);
        col.push({ key, minutes: data[key] || 0 });
      }
    }
    grid.push(col);
  }

  // Month labels: first column where a new month starts
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const DAY_LABELS = ['S','M','T','W','T','F','S'];
  let lastMonth = -1;
  const monthLabels = grid.map((col) => {
    const first = col.find((c) => c.key);
    if (!first) return null;
    const m = new Date(first.key).getMonth();
    if (m !== lastMonth) { lastMonth = m; return MONTHS[m]; }
    return null;
  });

  // Color by total minutes that day: empty / <30 / 30–60 / 60–90 / 90+
  function cellColor(minutes) {
    if (minutes === 0) return 'bg-gray-100';
    if (minutes < 30) return 'bg-primary-200';
    if (minutes < 60) return 'bg-primary-400';
    if (minutes < 90) return 'bg-primary-500';
    return 'bg-primary-700';
  }

  function tooltip(cell) {
    if (!cell.key) return '';
    if (!cell.minutes) return cell.key;
    const h = Math.floor(cell.minutes / 60);
    const m = cell.minutes % 60;
    const duration = h > 0 ? `${h}h ${m}m` : `${m}m`;
    return `${cell.key}: ${duration}`;
  }

  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <div className="inline-flex flex-col" style={{ gap: '3px' }}>

        {/* Month labels */}
        <div className="flex ml-6" style={{ gap: '3px' }}>
          {grid.map((_, wi) => (
            <div key={wi} style={{ width: 14, minWidth: 14 }}>
              {monthLabels[wi] && (
                <span className="text-[9px] leading-none text-gray-400 font-medium whitespace-nowrap">
                  {monthLabels[wi]}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Day labels + grid */}
        <div className="flex" style={{ gap: '3px' }}>

          {/* Day-of-week labels */}
          <div className="flex flex-col mr-1" style={{ gap: '3px' }}>
            {DAY_LABELS.map((d, i) => (
              <div key={i} style={{ width: 14, height: 14 }} className="flex items-center justify-end">
                {[1, 3, 5].includes(i) && (
                  <span className="text-[9px] leading-none text-gray-400 font-medium">{d}</span>
                )}
              </div>
            ))}
          </div>

          {/* Week columns */}
          {grid.map((col, wi) => (
            <div key={wi} className="flex flex-col" style={{ gap: '3px' }}>
              {col.map((cell, di) => (
                <div
                  key={di}
                  title={tooltip(cell)}
                  style={{ width: 14, height: 14 }}
                  className={`rounded-sm transition-colors ${cell.key ? cellColor(cell.minutes) : 'bg-transparent'}`}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 mt-1 ml-6">
          <span className="text-[10px] text-gray-400">Less</span>
          {[0, 15, 45, 75, 100].map((m) => (
            <div key={m} style={{ width: 14, height: 14 }} className={`rounded-sm ${cellColor(m)}`} />
          ))}
          <span className="text-[10px] text-gray-400">More</span>
        </div>

      </div>
    </div>
  );
}
