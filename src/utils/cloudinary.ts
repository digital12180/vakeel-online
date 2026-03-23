import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = (fileBuffer: Buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "vakeel", // your folder name
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      )
      .end(fileBuffer);
  });
};