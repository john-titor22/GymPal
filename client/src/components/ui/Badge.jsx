const colors = {
  green: 'bg-primary-500/20 text-primary-500',
  blue: 'bg-blue-500/20 text-blue-400',
  yellow: 'bg-yellow-500/20 text-yellow-400',
  red: 'bg-red-500/20 text-red-400',
  slate: 'bg-slate-500/20 text-slate-400',
};

export function Badge({ children, color = 'slate' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
}
