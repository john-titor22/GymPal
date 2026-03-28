export function Button({ children, variant = 'primary', className = '', isLoading, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5';
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    ghost:   'text-gray-600 hover:bg-gray-100',
    danger:  'bg-red-500 hover:bg-red-600 text-white',
    outline: 'border border-gray-200 text-gray-700 hover:bg-gray-50 bg-white',
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
