const express = require("express");
const router = express.Router();
const upload = require("../config/multer");

// Upload single image
router.post("/image", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Return the file path that can be accessed via the server
    const imageUrl = `/uploads/${req.file.filename}`;
    
    res.status(200).json({
      message: "Image uploaded successfully",
      imageUrl: imageUrl,
      filename: req.file.filename,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
