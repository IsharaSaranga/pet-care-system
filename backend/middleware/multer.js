import multer from "multer";

// Configure Multer to store files in memory
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(file.originalname.split(".").pop().toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    const error = new Error("Only JPEG and PNG images are allowed for eventImage");
    console.error("Multer error:", error.message, { file: file.originalname, mimetype: file.mimetype });
    cb(error);
  },
});

export default upload;