// backend/src/middleware/validationMiddleware.ts
import { ValidationError, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = errors.array().map((err: ValidationError) => {
    if (err.type === "field") {
      return {
        type: err.type,
        msg: err.msg,
        path: err.path,
      };
    }

    return {
      type: err.type,
      msg: err.msg,
      path: "N/A",
    };
  });

  return res.status(400).json({
    errors: extractedErrors,
  });
};
