const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
    imageUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
});

const Image = mongoose.model("Image", ImageSchema);
module.exports = Image;
