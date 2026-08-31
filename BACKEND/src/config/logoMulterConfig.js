const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const LOGO_DIR = path.join(__dirname, "..", "uploads", "logos");

fs.mkdirSync(LOGO_DIR, { recursive: true });

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png"];
const ALLOWED_MIMETYPES = ["image/jpeg", "image/png"];
const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2 Mo — un logo n'a pas besoin d'être plus lourd

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, LOGO_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = crypto.randomBytes(16).toString("hex");
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `logo-${Date.now()}-${uniqueSuffix}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    const extOk = ALLOWED_EXTENSIONS.includes(ext);
    const mimeOk = ALLOWED_MIMETYPES.includes(file.mimetype);

    if (!extOk || !mimeOk) {
        req.fileValidationError = "LOGO_FORMAT_NON_AUTORISE";
        return cb(null, false);
    }

    cb(null, true);
};

const uploadLogo = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_LOGO_SIZE,
    },
});

module.exports = uploadLogo;
