import crypto from "crypto";
import fs from "fs";
import path from "path";
import multer from "multer";

type CreateUploadOptions = {
  folder: string;
  allowedTypes?: string[];
  maxSize?: number;
};

function createUpload(options: CreateUploadOptions) {
  const {
    folder,
    allowedTypes = ["image/"],
    maxSize = 2 * 1024 * 1024,
  } = options;

  const uploadDir = path.resolve(`uploads/${folder}`);

  fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${crypto.randomUUID()}${ext}`);
    },
  });

  return multer({
    storage,
    limits: {
      fileSize: maxSize,
    },
    fileFilter: (_req, file, cb) => {
      const isAllowed = allowedTypes.some((type) =>
        file.mimetype.startsWith(type)
      );

      if (!isAllowed) {
        return cb(new Error("Invalid file type"));
      }

      cb(null, true);
    },
  });
}

export const profileUpload = createUpload({
  folder: "profile-images",
  allowedTypes: ["image/"],
  maxSize: 5 * 1024 * 1024, // 5MB
});
