import { useState, useEffect } from 'react';

export function ExerciseImage({ images, size = 'md', className = '', animate = false }) {
  const [frame, setFrame] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [playing, setPlaying] = useState(false); // user-triggered preview

  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
  };

  const isAnimating = animate || playing;

  useEffect(() => {
    if (!images?.length || !isAnimating) {
      setFrame(0);
      return;
    }
    const interval = setInterval(() => setFrame((f) => (f === 0 ? 1 : 0)), 800);
    return () => clearInterval(interval);
  }, [images, isAnimating]);

  // Reset loaded state when frame changes
  useEffect(() => { setLoaded(false); }, [frame]);

  if (error || !images?.length) {
    return (
      <div className={`${sizes[size]} ${className} rounded-xl bg-gray-100 flex items-center justify-center shrink-0`}>
        <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`${sizes[size]} ${className} rounded-xl overflow-hidden bg-gray-100 shrink-0 relative cursor-pointer`}
      onClick={() => !animate && images.length > 1 && setPlaying((p) => !p)}
      title={!animate && images.length > 1 ? (playing ? 'Tap to pause' : 'Tap to preview') : undefined}
    >
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
        </div>
      )}
      <img
        key={`${frame}-${images[frame]}`}
        src={images[frame]}
        alt=""
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full object-cover transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
      {/* Play indicator when static and has animation */}
      {!isAnimating && images.length > 1 && (
        <div className="absolute inset-0 flex items-end justify-end p-1 pointer-events-none">
          <div className="w-4 h-4 rounded-full bg-black/30 flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
