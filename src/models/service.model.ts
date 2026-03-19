// src/modules/category/category.model.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  title: string;
  description: string;
  category: string;
  createdBy:mongoose.ObjectId;
}

const servceSchema = new Schema<IService>(
  {
    title: {
      type: String,
      required: true,
      unique:true
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        'legal',
        'finance',
        'corporate'
      ]
    },
    createdBy:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'User'
    }
  },
  { timestamps: true }
);
servceSchema.index({ category: 1 });
export const Service = mongoose.model<IService>('Service', servceSchema);