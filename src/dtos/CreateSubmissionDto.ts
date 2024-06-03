import { z } from 'zod';

export const createSubmissionZodSchema = z.object({
    problemId: z.string(),
    userId: z.string(),
    code: z.string(),
    language: z.string()
}).strict();

export type CreateSubmissionDto = z.infer<typeof createSubmissionZodSchema>;