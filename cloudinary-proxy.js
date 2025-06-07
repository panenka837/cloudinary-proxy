const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Ophalen van documenten uit een Cloudinary-folder
app.get("/api/cloudinary/documents", async (req, res) => {
  try {
    const folder = req.query.folder || "Documenten";
    const searchUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/search`;
    const expression = `folder:${folder}`;

    const response = await axios.post(
      searchUrl,
      { expression, sort_by: [{ created_at: "desc" }], max_results: 100 },
      {
        auth: {
          username: API_KEY,
          password: API_SECRET,
        },
      }
    );
    res.json(response.data.resources);
  } catch (err) {
    res.status(500).json({ error: "Cloudinary API error", details: err.message });
  }
});

// Verplaatsen van een bestand
app.post("/api/cloudinary/move", async (req, res) => {
  try {
    const { from_public_id, to_public_id } = req.body;
    const moveUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image/upload/move`;
    const response = await axios.post(
      moveUrl,
      { from_public_id, to_public_id },
      {
        auth: {
          username: API_KEY,
          password: API_SECRET,
        },
      }
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Cloudinary move error", details: err.message });
  }
});

// Verwijderen van een bestand
app.delete("/api/cloudinary/delete", async (req, res) => {
  try {
    const { public_ids } = req.body;
    const deleteUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image/upload`;
    const response = await axios.delete(
      deleteUrl,
      {
        data: { public_ids },
        auth: {
          username: API_KEY,
          password: API_SECRET,
        },
      }
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Cloudinary delete error", details: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Cloudinary proxy server running on port ${PORT}`);
});
