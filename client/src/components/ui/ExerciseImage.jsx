import { useState, useEffect, useRef } from 'react';

const SIZES = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-32 h-32',
  xl: 'w-48 h-48',
  full: 'w-full h-full',
};

export function ExerciseImage({ images, size = 'md', className = '', animate = false }) {
  const [frame, setFrame]       = useState(0);
  const [visible, setVisible]   = useState(0);   // which img tag is shown (0 or 1) — for cross-fade
  const [srcs, setSrcs]         = useState([null, null]);
  const [loaded, setLoaded]     = useState([false, false]);
  const [errors, setErrors]     = useState([false, false]);
  const [retries, setRetries]   = useState([0, 0]);
  const intervalRef             = useRef(null);

  const isAnimating = animate;

  // Pre-load both frames into two img slots
  useEffect(() => {
    if (!images?.length) return;
    setSrcs([images[0], images[1] ?? images[0]]);
    setLoaded([false, false]);
    setErrors([false, false]);
    setVisible(0);
    setFrame(0);
  }, [images?.[0], images?.[1]]);

  // Animation interval — cross-fade between visible slots
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!isAnimating || !images?.length) return;

    intervalRef.current = setInterval(() => {
      setVisible((v) => (v === 0 ? 1 : 0));
    }, 900);

    return () => clearInterval(intervalRef.current);
  }, [isAnimating, images?.length]);

  function handleError(slot) {
    setErrors((e) => {
      const next = [...e];
      if (retries[slot] < 2) {
        // Retry with cache-bust
        const bust = `?r=${retries[slot] + 1}`;
        setSrcs((s) => { const n = [...s]; n[slot] = (images[slot] ?? images[0]) + bust; return n; });
        setRetries((r) => { const n = [...r]; n[slot] = r[slot] + 1; return n; });
      } else {
        next[slot] = true;
      }
      return next;
    });
  }

  const bothFailed = errors[0] && errors[1];
  const firstReady = loaded[0] && !errors[0];
  const secondReady = loaded[1] && !errors[1];
  const anyReady = firstReady || secondReady;

  if (!images?.length || bothFailed) {
    return (
      <div className={`${SIZES[size]} ${className} rounded-xl bg-gray-100 flex items-center justify-center shrink-0`}>
        <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`${SIZES[size]} ${className} rounded-xl overflow-hidden bg-gray-100 shrink-0 relative`}>
      {/* Skeleton */}
      {!anyReady && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}

      {/* Frame 0 */}
      {srcs[0] && (
        <img
          src={srcs[0]}
          alt=""
          onLoad={() => setLoaded((l) => { const n = [...l]; n[0] = true; return n; })}
          onError={() => handleError(0)}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          style={{ opacity: anyReady ? (visible === 0 ? 1 : 0) : 0 }}
          draggable={false}
        />
      )}

      {/* Frame 1 */}
      {srcs[1] && srcs[1] !== srcs[0] && (
        <img
          src={srcs[1]}
          alt=""
          onLoad={() => setLoaded((l) => { const n = [...l]; n[1] = true; return n; })}
          onError={() => handleError(1)}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          style={{ opacity: anyReady ? (visible === 1 ? 1 : 0) : 0 }}
          draggable={false}
        />
      )}
    </div>
  );
}
