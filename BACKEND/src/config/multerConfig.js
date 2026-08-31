const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".docx"];
const ALLOWED_MIMETYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Chemin absolu recommandé pour éviter les surprises selon
        // l'endroit d'où le process Node est lancé.
        cb(null, path.join(__dirname, "..", "uploads"));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = crypto.randomBytes(16).toString("hex");
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${Date.now()}-${uniqueSuffix}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    const extOk = ALLOWED_EXTENSIONS.includes(ext);
    const mimeOk = ALLOWED_MIMETYPES.includes(file.mimetype);

    if (!extOk || !mimeOk) {
        req.fileValidationError = "TYPE_NON_AUTORISE";
        return cb(null, false);
    }

    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
});

module.exports = upload;
