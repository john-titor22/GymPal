const { z } = require('zod');

const createProgramSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  durationWeeks: z.number().int().min(1).max(52).default(4),
});

const updateProgramSchema = createProgramSchema.partial();

const createWorkoutDaySchema = z.object({
  name: z.string().min(1).max(100),
  dayOrder: z.number().int().min(0),
});

const createExerciseSchema = z.object({
  name: z.string().min(1).max(100),
  muscleGroup: z.enum([
    'CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS',
    'LEGS', 'GLUTES', 'CORE', 'FULL_BODY', 'OTHER'
  ]).default('OTHER'),
  sets: z.number().int().min(1).max(20),
  reps: z.number().int().min(1).max(100),
  weight: z.number().min(0).optional(),
  notes: z.string().max(300).optional(),
  order: z.number().int().min(0).default(0),
});

const updateExerciseSchema = createExerciseSchema.partial();

module.exports = {
  createProgramSchema,
  updateProgramSchema,
  createWorkoutDaySchema,
  createExerciseSchema,
  updateExerciseSchema,
};
