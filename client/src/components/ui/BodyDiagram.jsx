const BLUE = '#2563eb';
const LIGHT = '#dbeafe';
const BODY = '#e5e7eb';
const STROKE = '#d1d5db';

// Which SVG region ids to highlight per muscle group
const MUSCLE_MAP = {
  CHEST:     { front: ['chest'], back: [] },
  BACK:      { front: [], back: ['upper_back', 'lower_back'] },
  SHOULDERS: { front: ['shoulder_l', 'shoulder_r'], back: ['shoulder_l_b', 'shoulder_r_b'] },
  BICEPS:    { front: ['bicep_l', 'bicep_r'], back: [] },
  TRICEPS:   { front: [], back: ['tricep_l', 'tricep_r'] },
  LEGS:      { front: ['quad_l', 'quad_r'], back: ['ham_l', 'ham_r', 'calf_l', 'calf_r'] },
  GLUTES:    { front: [], back: ['glute_l', 'glute_r'] },
  CORE:      { front: ['core'], back: [] },
  FULL_BODY: {
    front: ['chest', 'shoulder_l', 'shoulder_r', 'bicep_l', 'bicep_r', 'core', 'quad_l', 'quad_r'],
    back: ['upper_back', 'lower_back', 'shoulder_l_b', 'shoulder_r_b', 'tricep_l', 'tricep_r', 'glute_l', 'glute_r', 'ham_l', 'ham_r'],
  },
  OTHER: { front: [], back: [] },
};

function fill(id, activeIds) {
  return activeIds.includes(id) ? BLUE : BODY;
}

function FrontView({ activeIds }) {
  const f = (id) => fill(id, activeIds);
  return (
    <svg viewBox="0 0 70 155" className="h-full w-auto">
      {/* Head */}
      <ellipse cx="35" cy="13" rx="11" ry="12" fill={BODY} stroke={STROKE} strokeWidth="0.8" />
      {/* Neck */}
      <rect x="30" y="24" width="10" height="8" rx="3" fill={BODY} />

      {/* Torso base */}
      <path d="M13,32 C8,34 7,50 9,68 L13,82 H57 L61,68 C63,50 62,34 57,32 Z" fill={BODY} stroke={STROKE} strokeWidth="0.8" />

      {/* Shoulders overlay */}
      <ellipse cx="13" cy="36" rx="9" ry="8" fill={f('shoulder_l')} />
      <ellipse cx="57" cy="36" rx="9" ry="8" fill={f('shoulder_r')} />

      {/* Chest overlay */}
      <ellipse cx="35" cy="48" rx="16" ry="12" fill={f('chest')} />

      {/* Core overlay */}
      <ellipse cx="35" cy="67" rx="12" ry="11" fill={f('core')} />

      {/* Upper arms (biceps) */}
      <rect x="2" y="32" width="11" height="30" rx="5" fill={f('bicep_l')} stroke={STROKE} strokeWidth="0.5" />
      <rect x="57" y="32" width="11" height="30" rx="5" fill={f('bicep_r')} stroke={STROKE} strokeWidth="0.5" />

      {/* Forearms */}
      <rect x="2" y="63" width="10" height="24" rx="4" fill={BODY} stroke={STROKE} strokeWidth="0.5" />
      <rect x="58" y="63" width="10" height="24" rx="4" fill={BODY} stroke={STROKE} strokeWidth="0.5" />

      {/* Hands */}
      <ellipse cx="7" cy="90" rx="5" ry="4" fill={BODY} stroke={STROKE} strokeWidth="0.5" />
      <ellipse cx="63" cy="90" rx="5" ry="4" fill={BODY} stroke={STROKE} strokeWidth="0.5" />

      {/* Hips connector */}
      <rect x="13" y="80" width="44" height="10" rx="3" fill={BODY} />

      {/* Quads */}
      <rect x="14" y="89" width="18" height="38" rx="7" fill={f('quad_l')} stroke={STROKE} strokeWidth="0.5" />
      <rect x="38" y="89" width="18" height="38" rx="7" fill={f('quad_r')} stroke={STROKE} strokeWidth="0.5" />

      {/* Calves (front) */}
      <rect x="15" y="128" width="15" height="25" rx="5" fill={BODY} stroke={STROKE} strokeWidth="0.5" />
      <rect x="40" y="128" width="15" height="25" rx="5" fill={BODY} stroke={STROKE} strokeWidth="0.5" />
    </svg>
  );
}

function BackView({ activeIds }) {
  const f = (id) => fill(id, activeIds);
  return (
    <svg viewBox="0 0 70 155" className="h-full w-auto">
      {/* Head */}
      <ellipse cx="35" cy="13" rx="11" ry="12" fill={BODY} stroke={STROKE} strokeWidth="0.8" />
      {/* Neck */}
      <rect x="30" y="24" width="10" height="8" rx="3" fill={BODY} />

      {/* Torso base */}
      <path d="M13,32 C8,34 7,50 9,68 L13,82 H57 L61,68 C63,50 62,34 57,32 Z" fill={BODY} stroke={STROKE} strokeWidth="0.8" />

      {/* Shoulders back overlay */}
      <ellipse cx="13" cy="36" rx="9" ry="8" fill={f('shoulder_l_b')} />
      <ellipse cx="57" cy="36" rx="9" ry="8" fill={f('shoulder_r_b')} />

      {/* Upper back overlay */}
      <ellipse cx="35" cy="45" rx="17" ry="11" fill={f('upper_back')} />

      {/* Lower back overlay */}
      <ellipse cx="35" cy="64" rx="13" ry="10" fill={f('lower_back')} />

      {/* Upper arms (triceps) */}
      <rect x="2" y="32" width="11" height="30" rx="5" fill={f('tricep_l')} stroke={STROKE} strokeWidth="0.5" />
      <rect x="57" y="32" width="11" height="30" rx="5" fill={f('tricep_r')} stroke={STROKE} strokeWidth="0.5" />

      {/* Forearms */}
      <rect x="2" y="63" width="10" height="24" rx="4" fill={BODY} stroke={STROKE} strokeWidth="0.5" />
      <rect x="58" y="63" width="10" height="24" rx="4" fill={BODY} stroke={STROKE} strokeWidth="0.5" />

      {/* Hands */}
      <ellipse cx="7" cy="90" rx="5" ry="4" fill={BODY} stroke={STROKE} strokeWidth="0.5" />
      <ellipse cx="63" cy="90" rx="5" ry="4" fill={BODY} stroke={STROKE} strokeWidth="0.5" />

      {/* Hips connector */}
      <rect x="13" y="80" width="44" height="10" rx="3" fill={BODY} />

      {/* Glutes */}
      <ellipse cx="25" cy="87" rx="11" ry="9" fill={f('glute_l')} stroke={STROKE} strokeWidth="0.5" />
      <ellipse cx="45" cy="87" rx="11" ry="9" fill={f('glute_r')} stroke={STROKE} strokeWidth="0.5" />

      {/* Hamstrings */}
      <rect x="14" y="94" width="18" height="34" rx="7" fill={f('ham_l')} stroke={STROKE} strokeWidth="0.5" />
      <rect x="38" y="94" width="18" height="34" rx="7" fill={f('ham_r')} stroke={STROKE} strokeWidth="0.5" />

      {/* Calves */}
      <rect x="15" y="129" width="15" height="24" rx="5" fill={f('calf_l')} stroke={STROKE} strokeWidth="0.5" />
      <rect x="40" y="129" width="15" height="24" rx="5" fill={f('calf_r')} stroke={STROKE} strokeWidth="0.5" />
    </svg>
  );
}

export function BodyDiagram({ muscleGroup = 'OTHER', size = 'md' }) {
  const regions = MUSCLE_MAP[muscleGroup] || MUSCLE_MAP.OTHER;
  const heights = { sm: 'h-20', md: 'h-32', lg: 'h-44' };
  const h = heights[size] || heights.md;

  return (
    <div className={`flex items-end gap-2 ${h}`}>
      <FrontView activeIds={regions.front} />
      <BackView activeIds={regions.back} />
    </div>
  );
}
