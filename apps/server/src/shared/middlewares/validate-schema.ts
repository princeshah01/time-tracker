import type { NextFunction, Request, RequestHandler, Response } from "express";
import { treeifyError, type ZodType, type infer as zInfer } from "zod";

import { AppError } from "@/shared/utils";

export type ValidatedRequest<TSchema extends ZodType> = Request & {
  validated: zInfer<TSchema>;
};

export function validate<TSchema extends ZodType>(
  schema: TSchema
): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      throw new AppError({
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        details: treeifyError(result.error),
      });
    }

    (req as ValidatedRequest<TSchema>).validated = result.data;

    next();
  };
}
