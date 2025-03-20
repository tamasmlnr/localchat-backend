const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const dotenv = require("dotenv");
const Image = require("../models/image.js");

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "uploads",
        format: async () => "png",
        public_id: (req, file) => file.originalname.split(".")[0],
    },
});

const upload = multer({ storage });

const uploadImage = (req) => {
    return new Promise((resolve, reject) => {
        if (!req.file) return reject("No file uploaded");

        const imageData = {
            imageUrl: req.file.path,
            publicId: req.file.filename,
        };

        const newImage = new Image(imageData);
        newImage
            .save()
            .then(() => resolve(imageData))
            .catch((err) => reject(err));
    });
};

module.exports = { upload, uploadImage };
