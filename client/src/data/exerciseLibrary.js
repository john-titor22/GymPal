const BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

function imgs(folder) {
  return [`${BASE}/${folder}/0.jpg`, `${BASE}/${folder}/1.jpg`];
}

export const EQUIPMENT_OPTIONS = [
  'All Equipment',
  'Barbell',
  'Dumbbell',
  'Cable',
  'Machine',
  'Bodyweight',
  'Kettlebell',
  'Band',
  'Other',
];

export const MUSCLE_OPTIONS = [
  { value: '', label: 'All Muscles' },
  { value: 'CHEST', label: 'Chest' },
  { value: 'BACK', label: 'Back' },
  { value: 'SHOULDERS', label: 'Shoulders' },
  { value: 'BICEPS', label: 'Biceps' },
  { value: 'TRICEPS', label: 'Triceps' },
  { value: 'LEGS', label: 'Legs' },
  { value: 'GLUTES', label: 'Glutes' },
  { value: 'CORE', label: 'Core' },
  { value: 'FULL_BODY', label: 'Full Body' },
  { value: 'OTHER', label: 'Other' },
];

export const EXERCISE_LIBRARY = [
  // Chest
  { name: 'Bench Press (Barbell)',          muscleGroup: 'CHEST',     equipment: 'Barbell',    images: imgs('Barbell_Bench_Press_-_Medium_Grip') },
  { name: 'Bench Press (Dumbbell)',          muscleGroup: 'CHEST',     equipment: 'Dumbbell',   images: imgs('Dumbbell_Bench_Press') },
  { name: 'Incline Bench Press (Barbell)',   muscleGroup: 'CHEST',     equipment: 'Barbell',    images: imgs('Barbell_Incline_Bench_Press_-_Medium_Grip') },
  { name: 'Incline Bench Press (Dumbbell)',  muscleGroup: 'CHEST',     equipment: 'Dumbbell',   images: imgs('Incline_Dumbbell_Press') },
  { name: 'Decline Bench Press (Barbell)',   muscleGroup: 'CHEST',     equipment: 'Barbell',    images: imgs('Decline_Barbell_Bench_Press') },
  { name: 'Cable Fly Crossovers',           muscleGroup: 'CHEST',     equipment: 'Cable',      images: imgs('Cable_Crossover') },
  { name: 'Chest Dip',                      muscleGroup: 'CHEST',     equipment: 'Bodyweight', images: imgs('Dips_-_Chest_Version') },
  { name: 'Push Up',                        muscleGroup: 'CHEST',     equipment: 'Bodyweight', images: imgs('Pushups') },
  { name: 'Pec Deck',                       muscleGroup: 'CHEST',     equipment: 'Machine',    images: imgs('Dumbbell_Flyes') },
  // Back
  { name: 'Deadlift (Barbell)',             muscleGroup: 'BACK',      equipment: 'Barbell',    images: imgs('Barbell_Deadlift') },
  { name: 'Bent Over Row (Barbell)',         muscleGroup: 'BACK',      equipment: 'Barbell',    images: imgs('Bent_Over_Barbell_Row') },
  { name: 'Bent Over Row (Dumbbell)',        muscleGroup: 'BACK',      equipment: 'Dumbbell',   images: imgs('Bent_Over_Two-Dumbbell_Row') },
  { name: 'Lat Pulldown (Cable)',            muscleGroup: 'BACK',      equipment: 'Cable',      images: imgs('Wide-Grip_Lat_Pulldown') },
  { name: 'Seated Cable Row',               muscleGroup: 'BACK',      equipment: 'Cable',      images: imgs('Seated_Cable_Rows') },
  { name: 'Pull Up',                        muscleGroup: 'BACK',      equipment: 'Bodyweight', images: imgs('Pullups') },
  { name: 'Face Pull',                      muscleGroup: 'BACK',      equipment: 'Cable',      images: imgs('Face_Pull') },
  { name: 'T-Bar Row',                      muscleGroup: 'BACK',      equipment: 'Barbell',    images: imgs('T-Bar_Row_with_Handle') },
  { name: 'Single Arm Dumbbell Row',        muscleGroup: 'BACK',      equipment: 'Dumbbell',   images: imgs('One-Arm_Dumbbell_Row') },
  // Shoulders
  { name: 'Overhead Press (Barbell)',        muscleGroup: 'SHOULDERS', equipment: 'Barbell',    images: imgs('Barbell_Shoulder_Press') },
  { name: 'Overhead Press (Dumbbell)',       muscleGroup: 'SHOULDERS', equipment: 'Dumbbell',   images: imgs('Dumbbell_Shoulder_Press') },
  { name: 'Lateral Raise (Dumbbell)',        muscleGroup: 'SHOULDERS', equipment: 'Dumbbell',   images: imgs('Side_Lateral_Raise') },
  { name: 'Lateral Raise (Cable)',           muscleGroup: 'SHOULDERS', equipment: 'Cable',      images: imgs('Standing_Low-Pulley_Deltoid_Raise') },
  { name: 'Front Raise (Dumbbell)',          muscleGroup: 'SHOULDERS', equipment: 'Dumbbell',   images: imgs('Front_Dumbbell_Raise') },
  { name: 'Arnold Press',                   muscleGroup: 'SHOULDERS', equipment: 'Dumbbell',   images: imgs('Arnold_Dumbbell_Press') },
  { name: 'Rear Delt Fly (Dumbbell)',        muscleGroup: 'SHOULDERS', equipment: 'Dumbbell',   images: imgs('Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench') },
  // Biceps
  { name: 'Bicep Curl (Barbell)',            muscleGroup: 'BICEPS',    equipment: 'Barbell',    images: imgs('Barbell_Curl') },
  { name: 'Bicep Curl (Dumbbell)',           muscleGroup: 'BICEPS',    equipment: 'Dumbbell',   images: imgs('Dumbbell_Bicep_Curl') },
  { name: 'Hammer Curl (Dumbbell)',          muscleGroup: 'BICEPS',    equipment: 'Dumbbell',   images: imgs('Hammer_Curls') },
  { name: 'Incline Curl (Dumbbell)',         muscleGroup: 'BICEPS',    equipment: 'Dumbbell',   images: imgs('Incline_Dumbbell_Curl') },
  { name: 'Cable Curl',                     muscleGroup: 'BICEPS',    equipment: 'Cable',      images: imgs('Standing_Biceps_Cable_Curl') },
  { name: 'Preacher Curl (Barbell)',         muscleGroup: 'BICEPS',    equipment: 'Barbell',    images: imgs('Preacher_Curl') },
  // Triceps
  { name: 'Tricep Pushdown (Cable)',         muscleGroup: 'TRICEPS',   equipment: 'Cable',      images: imgs('Triceps_Pushdown') },
  { name: 'Skull Crushers (Barbell)',        muscleGroup: 'TRICEPS',   equipment: 'Barbell',    images: imgs('EZ-Bar_Skullcrusher') },
  { name: 'Overhead Tricep Extension (Dumbbell)', muscleGroup: 'TRICEPS', equipment: 'Dumbbell', images: imgs('Standing_Dumbbell_Triceps_Extension') },
  { name: 'Close Grip Bench Press',         muscleGroup: 'TRICEPS',   equipment: 'Barbell',    images: imgs('Close-Grip_Barbell_Bench_Press') },
  { name: 'Tricep Dip',                     muscleGroup: 'TRICEPS',   equipment: 'Bodyweight', images: imgs('Dips_-_Triceps_Version') },
  { name: 'Rope Pushdown (Cable)',           muscleGroup: 'TRICEPS',   equipment: 'Cable',      images: imgs('Triceps_Pushdown_-_Rope_Attachment') },
  // Legs
  { name: 'Squat (Barbell)',                muscleGroup: 'LEGS',      equipment: 'Barbell',    images: imgs('Barbell_Squat') },
  { name: 'Front Squat (Barbell)',           muscleGroup: 'LEGS',      equipment: 'Barbell',    images: imgs('Front_Barbell_Squat') },
  { name: 'Leg Press (Machine)',             muscleGroup: 'LEGS',      equipment: 'Machine',    images: imgs('Leg_Press') },
  { name: 'Leg Extension (Machine)',         muscleGroup: 'LEGS',      equipment: 'Machine',    images: imgs('Leg_Extensions') },
  { name: 'Leg Curl (Machine)',              muscleGroup: 'LEGS',      equipment: 'Machine',    images: imgs('Lying_Leg_Curls') },
  { name: 'Lunge (Dumbbell)',               muscleGroup: 'LEGS',      equipment: 'Dumbbell',   images: imgs('Dumbbell_Lunges') },
  { name: 'Romanian Deadlift (Barbell)',     muscleGroup: 'LEGS',      equipment: 'Barbell',    images: imgs('Romanian_Deadlift') },
  { name: 'Bulgarian Split Squat',          muscleGroup: 'LEGS',      equipment: 'Dumbbell',   images: imgs('Split_Squat_with_Dumbbells') },
  { name: 'Hack Squat (Machine)',            muscleGroup: 'LEGS',      equipment: 'Machine',    images: imgs('Hack_Squat') },
  { name: 'Standing Calf Raise',            muscleGroup: 'LEGS',      equipment: 'Machine',    images: imgs('Standing_Calf_Raises') },
  // Glutes
  { name: 'Hip Thrust (Barbell)',            muscleGroup: 'GLUTES',    equipment: 'Barbell',    images: imgs('Barbell_Hip_Thrust') },
  { name: 'Glute Kickback (Cable)',          muscleGroup: 'GLUTES',    equipment: 'Cable',      images: imgs('One-Legged_Cable_Kickback') },
  { name: 'Sumo Deadlift (Barbell)',         muscleGroup: 'GLUTES',    equipment: 'Barbell',    images: imgs('Sumo_Deadlift') },
  // Core
  { name: 'Plank',                          muscleGroup: 'CORE',      equipment: 'Bodyweight', images: imgs('Plank') },
  { name: 'Crunch',                         muscleGroup: 'CORE',      equipment: 'Bodyweight', images: imgs('Crunches') },
  { name: 'Hanging Leg Raise',              muscleGroup: 'CORE',      equipment: 'Bodyweight', images: imgs('Hanging_Leg_Raise') },
  { name: 'Cable Crunch',                   muscleGroup: 'CORE',      equipment: 'Cable',      images: imgs('Cable_Crunch') },
  { name: 'Ab Wheel Rollout',               muscleGroup: 'CORE',      equipment: 'Other',      images: imgs('Ab_Roller') },
  { name: 'Russian Twist',                  muscleGroup: 'CORE',      equipment: 'Bodyweight', images: imgs('Russian_Twist') },
  // Full Body
  { name: 'Barbell Clean',                  muscleGroup: 'FULL_BODY', equipment: 'Barbell',    images: imgs('Power_Clean') },
  { name: 'Burpee',                         muscleGroup: 'FULL_BODY', equipment: 'Bodyweight', images: imgs('Burpee') },
  { name: 'Kettlebell Swing',               muscleGroup: 'FULL_BODY', equipment: 'Kettlebell', images: imgs('One-Arm_Kettlebell_Swings') },
  { name: 'Thruster (Barbell)',             muscleGroup: 'FULL_BODY', equipment: 'Barbell',    images: imgs('Kettlebell_Thruster') },
];
