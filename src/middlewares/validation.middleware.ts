// middlewares/validate.ts

import type{ Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";

export const validateCreatePayment = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, consultationId, amount } = req.body;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400,"Invalid userId");
  }

  if (!consultationId || !mongoose.Types.ObjectId.isValid(consultationId)) {
    throw new ApiError(400,"Invalid consultationId");
  }

  if (!amount || typeof amount !== "number" || amount <= 0) {
    throw new ApiError(400,"Invalid amount");
  }

  next();
};