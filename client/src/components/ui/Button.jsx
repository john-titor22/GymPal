export function Button({ children, variant = 'primary', className = '', isLoading, ...props }) {
  const base = 'px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2';
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    ghost: 'hover:bg-surface-700 text-slate-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    outline: 'border border-surface-600 hover:bg-surface-700 text-slate-200',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} disabled={isLoading || props.disabled} {...props}>
      {isLoading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      {children}
    </button>
  );
}
