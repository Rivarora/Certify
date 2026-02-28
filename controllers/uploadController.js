import fs from 'fs';
import { calculateRisk } from '../services/riskEngine.js';
import mammoth from "mammoth";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
export const uploadController = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const filePath = req.file.path;
    let fileContent = "";

    // ✅ PDF
    if (req.file.mimetype === "application/pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      fileContent = pdfData.text;
    }

    // ✅ TXT
    else if (req.file.mimetype === "text/plain") {
      fileContent = fs.readFileSync(filePath, "utf-8");
    }

    // ✅ DOCX
    else if (
      req.file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      fileContent = result.value;
    }

    else {
      return res.status(400).json({
        success: false,
        message: "Unsupported file type"
      });
    }

    const riskData = calculateRisk(fileContent);

    res.status(200).json({
      success: true,
      extractedContent: fileContent,
      ...riskData
    });

  } catch (err) {
    next(err);
  }
};