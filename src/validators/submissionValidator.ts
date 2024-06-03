import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

export const validator = (schema: ZodSchema<unknown>) => (req: Request, res: Response, next: NextFunction) => {
    try {
        schema.parse({
            ...req.body
        });

        next();
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Bad Request',
            error: error,
            data: {}
        });
    }
};