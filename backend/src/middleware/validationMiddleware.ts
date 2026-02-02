// backend/src/middleware/validationMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";

export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const extractedErrors = error.errors.map((err) => ({
          type: "field",
          msg: err.message,
          path: err.path.join("."),
        }));

        return res.status(400).json({
          errors: extractedErrors,
        });
      }
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };
