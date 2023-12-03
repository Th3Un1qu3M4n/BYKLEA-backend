// ImageUpload.js
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./uploads");
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname);
  },
});

console.log("CREATING UPLOAD MIDDLEWARE");
const upload = multer({ storage: storage });

// export default upload;
module.exports = { upload };
