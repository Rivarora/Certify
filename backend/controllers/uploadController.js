import mammoth from "mammoth";
import streamifier from "streamifier";
import { createRequire } from "module";
import Tesseract from "tesseract.js";

import cloudinary from "../config/cloudinary.js";
import { calculateRisk } from "../services/riskEngine.js";
import { fixSpacedOCRText } from "../utils/ocrUtils.js";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const delay = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const uploadController = async (req, res, next) => {

  try {

    const io = req.app.get("io");

    const socketId = req.query.socketId;

    if (!req.file) {

      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    let fileContent = "";
    let ocrConfidence = null;

    /*
    =====================================
    STEP 1 — SOCKET PROGRESS
    =====================================
    */

    if (io && socketId) {

      io.to(socketId).emit("uploadProgress", {
        percent: 10,
        message: "Uploading file..."
      });
    }

    await delay(500);

    /*
    =====================================
    CLOUDINARY UPLOAD
    =====================================
    */

    const cloudinaryResult = await new Promise((resolve, reject) => {

      const stream = cloudinary.uploader.upload_stream(

        {
          folder: "certificates",
          resource_type: "auto"
        },

        (error, result) => {

          if (error) {

            reject(error);
          }

          else {

            resolve(result);
          }
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    /*
    =====================================
    STEP 2 — EXTRACTION
    =====================================
    */

    if (io && socketId) {

      io.to(socketId).emit("uploadProgress", {
        percent: 40,
        message: "Extracting content..."
      });
    }

    await delay(500);

    /*
    =====================================
    PDF
    =====================================
    */

    if (req.file.mimetype === "application/pdf") {

      const pdfData = await pdfParse(req.file.buffer);

      fileContent = pdfData.text;
    }

    /*
    =====================================
    TXT
    =====================================
    */

    else if (req.file.mimetype === "text/plain") {

      fileContent =
        req.file.buffer.toString("utf-8");
    }

    /*
    =====================================
    DOCX
    =====================================
    */

    else if (
      req.file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {

      const result =
        await mammoth.extractRawText({
          buffer: req.file.buffer
        });

      fileContent = result.value;
    }

    /*
    =====================================
    IMAGE OCR
    =====================================
    */

    else if (
      req.file.mimetype === "image/png" ||
      req.file.mimetype === "image/jpeg" ||
      req.file.mimetype === "image/jpg"
    ) {

      if (io && socketId) {

        io.to(socketId).emit("uploadProgress", {
          percent: 55,
          message: "Running OCR..."
        });
      }

      console.log(
        "Starting OCR Extraction..."
      );

      const result =
        await Tesseract.recognize(

          req.file.buffer,

          "eng",

          {
            logger: (m) => {

              console.log(m);
            }
          }
        );

      /*
      =====================================
      CLEAN OCR TEXT
      =====================================
      */

      fileContent =
        fixSpacedOCRText(
          result.data.text
        );

      ocrConfidence =
        result.data.confidence;

      console.log(
        "OCR Extracted Text:"
      );

      console.log(fileContent);

      console.log(
        "OCR Confidence:",
        ocrConfidence
      );

      /*
      =====================================
      INVALID IMAGE DETECTION
      =====================================
      */

      const cleanedText =
        fileContent
          .replace(/\s+/g, " ")
          .trim();

      if (
        ocrConfidence < 20 ||
        cleanedText.length < 40
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Uploaded image does not appear to contain a valid certificate."
        });
      }
    }

    /*
    =====================================
    STEP 3 — RISK ANALYSIS
    =====================================
    */

    if (io && socketId) {

      io.to(socketId).emit("uploadProgress", {
        percent: 75,
        message:
          "Analyzing certificate..."
      });
    }

    await delay(500);

    const riskData =
      calculateRisk(fileContent);

    /*
    =====================================
    STEP 4 — COMPLETE
    =====================================
    */

    if (io && socketId) {

      io.to(socketId).emit("uploadProgress", {
        percent: 100,
        message: "Completed ✅"
      });
    }

    /*
    =====================================
    RESPONSE
    =====================================
    */

    res.status(200).json({

      success: true,

      extractedContent:
        fileContent,

      ocrConfidence,

      cloudinaryUrl:
        cloudinaryResult.secure_url,

      publicId:
        cloudinaryResult.public_id,

      originalName:
        req.file.originalname,

      fileType:
        req.file.mimetype,

      ...riskData
    });

  }

  catch (err) {

    console.log(err);

    next(err);
  }
};