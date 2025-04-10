const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
const SECRET = process.env.SECRET;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
const CLOUDINARY_URL = `cloudinary://${CLOUDINARY_CLOUD_NAME}:${CLOUDINARY_API_KEY}@${CLOUDINARY_CLOUD_NAME}`

module.exports = {
    MONGO_URI,
    PORT,
    SECRET,
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    CLOUDINARY_URL
}