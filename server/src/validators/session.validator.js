const { z } = require('zod');

const startSessionSchema = z.object({
  routineId: z.string().min(1),
});

const logSetSchema = z.object({
  exerciseId: z.string().min(1),
  setNumber: z.number().int().min(1),
  reps: z.number().int().min(0),
  weight: z.number().min(0).optional(),
});

const completeSessionSchema = z.object({
  notes: z.string().max(500).optional(),
});

module.exports = { startSessionSchema, logSetSchema, completeSessionSchema };
