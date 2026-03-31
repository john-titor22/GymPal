import Model from 'react-body-highlighter';

// Map our muscle group keys → react-body-highlighter muscle names
const MUSCLE_MAP = {
  CHEST:     ['chest'],
  BACK:      ['upper-back', 'lower-back', 'trapezius'],
  SHOULDERS: ['front-deltoids', 'back-deltoids'],
  BICEPS:    ['biceps'],
  TRICEPS:   ['triceps'],
  LEGS:      ['quadriceps', 'hamstring', 'calves'],
  GLUTES:    ['gluteal'],
  CORE:      ['abs', 'obliques'],
  FULL_BODY: [
    'chest', 'upper-back', 'lower-back', 'trapezius',
    'front-deltoids', 'back-deltoids',
    'biceps', 'triceps',
    'abs', 'obliques',
    'quadriceps', 'hamstring', 'calves', 'gluteal',
  ],
  OTHER: [],
};

const SIZES = { sm: 60, md: 80, lg: 110 };

export function BodyDiagram({ muscleGroup = 'OTHER', size = 'md' }) {
  const muscles = MUSCLE_MAP[muscleGroup] ?? [];
  const h = SIZES[size] ?? SIZES.md;

  const data = muscles.length
    ? [{ name: muscleGroup, muscles }]
    : [];

  return (
    <div className="flex items-end gap-1" style={{ height: h }}>
      <Model
        data={data}
        style={{ width: h * 0.52, height: h }}
        highlightedColors={['#3b82f6']}
      />
      <Model
        type="posterior"
        data={data}
        style={{ width: h * 0.52, height: h }}
        highlightedColors={['#3b82f6']}
      />
    </div>
  );
}
