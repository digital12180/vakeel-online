import cloudinary from "../config/cloudinary.js"

export const deleteFromCloudinary = async (public_id: string) => {
  if (!public_id) return;
  return await cloudinary.uploader.destroy(public_id);
};