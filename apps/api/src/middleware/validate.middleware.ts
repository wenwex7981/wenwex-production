// ===========================================
// VALIDATION MIDDLEWARE
// ===========================================

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from './error.middleware';

type ValidationTarget = 'body' | 'query' | 'params';

export const validate = (
    schema: ZodSchema,
    target: ValidationTarget = 'body'
) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            const data = req[target];
            const result = schema.parse(data);

            // Replace the target with validated/transformed data
            req[target] = result;

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors: Record<string, string[]> = {};

                error.errors.forEach((err) => {
                    const path = err.path.join('.');
                    if (!errors[path]) {
                        errors[path] = [];
                    }
                    errors[path].push(err.message);
                });

                next(new ValidationError('Validation failed', errors));
            } else {
                next(error);
            }
        }
    };
};

export const validateBody = (schema: ZodSchema) => validate(schema, 'body');
export const validateQuery = (schema: ZodSchema) => validate(schema, 'query');
export const validateParams = (schema: ZodSchema) => validate(schema, 'params');
