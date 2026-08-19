import { NextFunction, Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import status from "http-status";
import AppError from "../errors/AppError";
import cloudinary from "../utils/cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: () => ({
    folder: "vehicle-rental/vehicles",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  }),
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  if (!file.mimetype.startsWith("image/")) {
    cb(new AppError(status.BAD_REQUEST, "Only image files are allowed"));
    return;
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

export const uploadPhoto = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  upload.single("photo")(req, res, next);
};

export default uploadPhoto;
