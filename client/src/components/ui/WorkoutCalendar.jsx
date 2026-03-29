/**
 * GitHub-style contribution calendar — shows last `weeks` weeks of workout activity.
 */
export function WorkoutCalendar({ data = {}, weeks = 16 }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build grid: array of week-columns, each holding 7 day cells (Sun→Sat)
  const grid = [];
  const dayOfWeek = today.getDay(); // 0=Sun

  for (let w = weeks - 1; w >= 0; w--) {
    const col = [];
    for (let d = 0; d < 7; d++) {
      const daysAgo = w * 7 + (dayOfWeek - d + 7) % 7;
      const date = new Date(today);
      date.setDate(today.getDate() - daysAgo);
      if (date > today) {
        col.push({ key: null, count: 0 });
      } else {
        const key = date.toISOString().split('T')[0];
        col.push({ key, count: data[key] || 0 });
      }
    }
    grid.push(col);
  }

  // Month labels — find first day of each month visible in the grid
  const monthLabels = [];
  const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let lastMonth = -1;
  grid.forEach((col, wi) => {
    const first = col.find((c) => c.key);
    if (!first) return;
    const m = new Date(first.key).getMonth();
    if (m !== lastMonth) { monthLabels.push({ wi, label: MONTHS[m] }); lastMonth = m; }
  });

  function cellColor(count) {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (count === 1) return 'bg-primary-200';
    if (count === 2) return 'bg-primary-400';
    return 'bg-primary-600';
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex flex-col gap-1 min-w-0">
        {/* Month labels */}
        <div className="flex gap-1 ml-5">
          {grid.map((_, wi) => {
            const lbl = monthLabels.find((l) => l.wi === wi);
            return (
              <div key={wi} className="w-3 text-center">
                {lbl && <span className="text-[9px] text-gray-400 font-medium">{lbl.label}</span>}
              </div>
            );
          })}
        </div>

        {/* Grid rows (days of week) */}
        <div className="flex gap-1">
          {/* Day-of-week labels */}
          <div className="flex flex-col gap-1 mr-0.5">
            {DAY_LABELS.map((d, i) => (
              <div key={i} className="w-4 h-3 flex items-center justify-end">
                {[1, 3, 5].includes(i) && (
                  <span className="text-[9px] text-gray-400 font-medium">{d}</span>
                )}
              </div>
            ))}
          </div>
          {/* Week columns */}
          {grid.map((col, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {col.map((cell, di) => (
                <div
                  key={di}
                  title={cell.key ? `${cell.key}${cell.count ? `: ${cell.count} workout${cell.count > 1 ? 's' : ''}` : ''}` : ''}
                  className={`w-3 h-3 rounded-sm transition-colors ${cell.key ? cellColor(cell.count) : 'bg-transparent'}`}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 mt-1 ml-5">
          <span className="text-[10px] text-gray-400">Less</span>
          {[0, 1, 2, 3].map((n) => (
            <div key={n} className={`w-3 h-3 rounded-sm ${cellColor(n)}`} />
          ))}
          <span className="text-[10px] text-gray-400">More</span>
        </div>
      </div>
    </div>
  );
}
