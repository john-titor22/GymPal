const colors = {
  green:  'bg-green-50 text-green-700',
  blue:   'bg-primary-50 text-primary-700',
  yellow: 'bg-yellow-50 text-yellow-700',
  red:    'bg-red-50 text-red-600',
  gray:   'bg-gray-100 text-gray-600',
};

export function Badge({ children, color = 'gray' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[color]}`}>
      {children}
    </span>
  );
}
