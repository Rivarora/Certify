// import mammoth from "mammoth";
// import streamifier from "streamifier";
// import { createRequire } from "module";
// import Tesseract from "tesseract.js";
// import prisma from "../config/db.js";

// import cloudinary from "../config/cloudinary.js";
// import { calculateRisk } from "../services/riskEngine.js";
// import { fixSpacedOCRText } from "../utils/ocrUtils.js";

// const require = createRequire(import.meta.url);
// const pdfParse = require("pdf-parse");

// const delay = (ms) =>
//   new Promise((resolve) => setTimeout(resolve, ms));

// export const uploadController = async (req, res, next) => {

//   try {

//     const io = req.app.get("io");

//     const socketId = req.query.socketId;

//     if (!req.file) {

//       return res.status(400).json({
//         success: false,
//         message: "No file uploaded"
//       });
//     }

//     let fileContent = "";
//     let ocrConfidence = null;

//     /*
//     =====================================
//     STEP 1 — SOCKET PROGRESS
//     =====================================
//     */

//     if (io && socketId) {

//       io.to(socketId).emit("uploadProgress", {
//         percent: 10,
//         message: "Uploading file..."
//       });
//     }

//     await delay(500);

//     /*
//     =====================================
//     CLOUDINARY UPLOAD
//     =====================================
//     */

//     const cloudinaryResult = await new Promise((resolve, reject) => {

//       const stream = cloudinary.uploader.upload_stream(

//         {
//           folder: "certificates",
//           resource_type: "auto"
//         },

//         (error, result) => {

//           if (error) {

//             reject(error);
//           }

//           else {

//             resolve(result);
//           }
//         }
//       );

//       streamifier.createReadStream(req.file.buffer).pipe(stream);
//     });

//     /*
//     =====================================
//     STEP 2 — EXTRACTION
//     =====================================
//     */

//     if (io && socketId) {

//       io.to(socketId).emit("uploadProgress", {
//         percent: 40,
//         message: "Extracting content..."
//       });
//     }

//     await delay(500);

//     /*
//     =====================================
//     PDF
//     =====================================
//     */

//     if (req.file.mimetype === "application/pdf") {

//       const pdfData = await pdfParse(req.file.buffer);

//       fileContent = pdfData.text;
//     }

//     /*
//     =====================================
//     TXT
//     =====================================
//     */

//     else if (req.file.mimetype === "text/plain") {

//       fileContent =
//         req.file.buffer.toString("utf-8");
//     }

//     /*
//     =====================================
//     DOCX
//     =====================================
//     */

//     else if (
//       req.file.mimetype ===
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
//     ) {

//       const result =
//         await mammoth.extractRawText({
//           buffer: req.file.buffer
//         });

//       fileContent = result.value;
//     }

//     /*
//     =====================================
//     IMAGE OCR
//     =====================================
//     */

//     else if (
//       req.file.mimetype === "image/png" ||
//       req.file.mimetype === "image/jpeg" ||
//       req.file.mimetype === "image/jpg"
//     ) {

//       if (io && socketId) {

//         io.to(socketId).emit("uploadProgress", {
//           percent: 55,
//           message: "Running OCR..."
//         });
//       }

//       console.log(
//         "Starting OCR Extraction..."
//       );

//       const result =
//         await Tesseract.recognize(

//           req.file.buffer,

//           "eng",

//           {
//             logger: (m) => {

//               console.log(m);
//             }
//           }
//         );

//       /*
//       =====================================
//       CLEAN OCR TEXT
//       =====================================
//       */

//       fileContent =
//         fixSpacedOCRText(
//           result.data.text
//         );

//       ocrConfidence =
//         result.data.confidence;

//       console.log(
//         "OCR Extracted Text:"
//       );

//       console.log(fileContent);

//       console.log(
//         "OCR Confidence:",
//         ocrConfidence
//       );

//       /*
//       =====================================
//       INVALID IMAGE DETECTION
//       =====================================
//       */

//       const cleanedText =
//         fileContent
//           .replace(/\s+/g, " ")
//           .trim();

//       if (
//         ocrConfidence < 20 ||
//         cleanedText.length < 40
//       ) {

//         return res.status(400).json({

//           success: false,

//           message:
//             "Uploaded image does not appear to contain a valid certificate."
//         });
//       }
//     }

//     /*
//     =====================================
//     STEP 3 — RISK ANALYSIS
//     =====================================
//     */

//     if (io && socketId) {

//       io.to(socketId).emit("uploadProgress", {
//         percent: 75,
//         message:
//           "Analyzing certificate..."
//       });
//     }

//     await delay(500);

//     const riskData =
//       calculateRisk(fileContent);

//     /*
//     =====================================
//     STEP 4 — COMPLETE
//     =====================================
//     */

//     if (io && socketId) {

//       io.to(socketId).emit("uploadProgress", {
//         percent: 100,
//         message: "Completed ✅"
//       });
//     }

//     /*
//     =====================================
//     RESPONSE
//     =====================================
//     */

//     res.status(200).json({

//       success: true,

//       extractedContent:
//         fileContent,

//       ocrConfidence,

//       cloudinaryUrl:
//         cloudinaryResult.secure_url,

//       publicId:
//         cloudinaryResult.public_id,

//       originalName:
//         req.file.originalname,

//       fileType:
//         req.file.mimetype,

//       ...riskData
//     });

//   }

//   catch (err) {

//     console.log(err);

//     next(err);
//   }
// };



// import mammoth from "mammoth";
// import streamifier from "streamifier";
// import { createRequire } from "module";
// import Tesseract from "tesseract.js";

// import cloudinary from "../config/cloudinary.js";
// import prisma from "../config/db.js";

// import { calculateRisk } from "../services/riskEngine.js";
// import { fixSpacedOCRText } from "../utils/ocrUtils.js";

// const require = createRequire(import.meta.url);

// const pdfParse = require("pdf-parse");

// const delay = (ms) =>
//   new Promise((resolve) => setTimeout(resolve, ms));

// /*
// =====================================
// AUTO EXTRACT FUNCTIONS
// =====================================
// */

// const extractName = (text) => {

//   const match =
//     text.match(
//       /presented to\s+(Dr\.?\s*\/?\s*Mr\.?\s*\/?\s*Ms\.?\s*)?([A-Za-z ]{2,40})/i
//     );

//   if (match && match[2]) {

//     return match[2].trim();
//   }

//   return "Unknown";
// };

// const extractCompany = (text) => {

//   if (
//     text.includes("IEEE")
//   ) {

//     return "IEEE";
//   }

//   if (
//     text.includes("JSS ACADEMY")
//   ) {

//     return "JSS Academy";
//   }

//   return "Unknown";
// };

// const extractRole = (text) => {

//   if (
//     text.toLowerCase().includes(
//       "presenter"
//     )
//   ) {

//     return "Presenter";
//   }

//   if (
//     text.toLowerCase().includes(
//       "participant"
//     )
//   ) {

//     return "Participant";
//   }

//   return "Unknown";
// };

// const extractDuration = (text) => {

//   const match =
//     text.match(
//       /(\d{1,2}(st|nd|rd|th)?\s*-\s*\d{1,2}(st|nd|rd|th)?\s+[A-Za-z]+\s+\d{4})/i
//     );

//   if (match) {

//     return match[1];
//   }

//   return "Unknown";
// };

// export const uploadController = async (
//   req,
//   res,
//   next
// ) => {

//   try {

//     const io = req.app.get("io");

//     const socketId =
//       req.query.socketId;

//     /*
//     =====================================
//     FILE VALIDATION
//     =====================================
//     */

//     if (!req.file) {

//       return res.status(400).json({

//         success: false,

//         message:
//           "No file uploaded"
//       });
//     }

//     let fileContent = "";

//     let ocrConfidence = null;

//     /*
//     =====================================
//     STEP 1 — SOCKET PROGRESS
//     =====================================
//     */

//     if (io && socketId) {

//       io.to(socketId).emit(

//         "uploadProgress",

//         {
//           percent: 10,

//           message:
//             "Uploading file..."
//         }
//       );
//     }

//     await delay(500);

//     /*
//     =====================================
//     CLOUDINARY UPLOAD
//     =====================================
//     */

//     const cloudinaryResult =
//       await new Promise(

//         (resolve, reject) => {

//           const stream =
//             cloudinary.uploader.upload_stream(

//               {
//                 folder:
//                   "certificates",

//                 resource_type:
//                   "auto"
//               },

//               (error, result) => {

//                 if (error) {

//                   reject(error);
//                 }

//                 else {

//                   resolve(result);
//                 }
//               }
//             );

//           streamifier
//             .createReadStream(
//               req.file.buffer
//             )
//             .pipe(stream);
//         }
//       );

//     /*
//     =====================================
//     STEP 2 — CONTENT EXTRACTION
//     =====================================
//     */

//     if (io && socketId) {

//       io.to(socketId).emit(

//         "uploadProgress",

//         {
//           percent: 40,

//           message:
//             "Extracting content..."
//         }
//       );
//     }

//     await delay(500);

//     /*
//     =====================================
//     PDF EXTRACTION
//     =====================================
//     */

//     if (
//       req.file.mimetype ===
//       "application/pdf"
//     ) {

//       const pdfData =
//         await pdfParse(
//           req.file.buffer
//         );

//       fileContent =
//         pdfData.text;
//     }

//     /*
//     =====================================
//     TXT EXTRACTION
//     =====================================
//     */

//     else if (
//       req.file.mimetype ===
//       "text/plain"
//     ) {

//       fileContent =
//         req.file.buffer.toString(
//           "utf-8"
//         );
//     }

//     /*
//     =====================================
//     DOCX EXTRACTION
//     =====================================
//     */

//     else if (

//       req.file.mimetype ===
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

//     ) {

//       const result =
//         await mammoth.extractRawText({

//           buffer:
//             req.file.buffer
//         });

//       fileContent =
//         result.value;
//     }

//     /*
//     =====================================
//     IMAGE OCR
//     =====================================
//     */

//     else if (

//       req.file.mimetype ===
//         "image/png" ||

//       req.file.mimetype ===
//         "image/jpeg" ||

//       req.file.mimetype ===
//         "image/jpg"

//     ) {

//       if (io && socketId) {

//         io.to(socketId).emit(

//           "uploadProgress",

//           {
//             percent: 55,

//             message:
//               "Running OCR..."
//           }
//         );
//       }

//       console.log(
//         "Starting OCR Extraction..."
//       );

//       const result =
//         await Tesseract.recognize(

//           req.file.buffer,

//           "eng",

//           {
//             logger: (m) => {

//               console.log(m);
//             }
//           }
//         );

//       /*
//       =====================================
//       CLEAN OCR TEXT
//       =====================================
//       */

//       fileContent =
//         fixSpacedOCRText(
//           result.data.text
//         )

//         // remove null bytes
//         .replace(/\0/g, "")

//         // remove invalid utf characters
//         .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, " ");

//       ocrConfidence =
//         result.data.confidence;

//       console.log(
//         "OCR Extracted Text:"
//       );

//       console.log(fileContent);

//       console.log(
//         "OCR Confidence:",
//         ocrConfidence
//       );

//       /*
//       =====================================
//       INVALID IMAGE CHECK
//       =====================================
//       */

//       const cleanedText =
//         fileContent
//           .replace(/\s+/g, " ")
//           .trim();

//       if (

//         ocrConfidence < 20 ||

//         cleanedText.length < 40

//       ) {

//         return res.status(400).json({

//           success: false,

//           message:
//             "Uploaded image does not appear to contain a valid certificate."
//         });
//       }
//     }

//     /*
//     =====================================
//     CLEAN DATABASE TEXT
//     =====================================
//     */

//     fileContent = fileContent

//       .replace(/\0/g, "")

//       .replace(/\s+/g, " ")

//       .trim();

//     /*
//     =====================================
//     AUTO EXTRACT DETAILS
//     =====================================
//     */

//     const extractedName =
//       extractName(fileContent);

//     const extractedCompany =
//       extractCompany(fileContent);

//     const extractedRole =
//       extractRole(fileContent);

//     const extractedDuration =
//       extractDuration(fileContent);

//     console.log({
//       extractedName,
//       extractedCompany,
//       extractedRole,
//       extractedDuration
//     });

//     /*
//     =====================================
//     STEP 3 — RISK ANALYSIS
//     =====================================
//     */

//     if (io && socketId) {

//       io.to(socketId).emit(

//         "uploadProgress",

//         {
//           percent: 75,

//           message:
//             "Analyzing certificate..."
//         }
//       );
//     }

//     await delay(500);

//     const riskData =
//       calculateRisk(
//         fileContent
//       );

//     /*
//     =====================================
//     STEP 4 — SAVE TO DATABASE
//     =====================================
//     */

//     const savedCertificate =
//       await prisma.certificate.create({

//         data: {

//           userId:
//             req.user?.id || null,

//           name:
//             extractedName,

//           email:
//             req.body.email ||
//             "Not Provided",

//           company:
//             extractedCompany,

//           role:
//             extractedRole,

//           duration:
//             extractedDuration,

//           riskScore:
//             riskData.riskScore || 0,

//           riskLevel:
//             riskData.riskLevel || "Low",

//           reasons:
//             riskData.reasons || [],

//           extractedContent:
//             fileContent
//         }
//       });

//     console.log(
//       "Certificate Saved:",
//       savedCertificate.id
//     );

//     /*
//     =====================================
//     STEP 5 — COMPLETE
//     =====================================
//     */

//     if (io && socketId) {

//       io.to(socketId).emit(

//         "uploadProgress",

//         {
//           percent: 100,

//           message:
//             "Completed ✅"
//         }
//       );
//     }

//     /*
//     =====================================
//     FINAL RESPONSE
//     =====================================
//     */

//     res.status(200).json({

//       success: true,

//       certificateId:
//         savedCertificate.id,

//       extractedName,

//       extractedCompany,

//       extractedRole,

//       extractedDuration,

//       extractedContent:
//         fileContent,

//       ocrConfidence,

//       cloudinaryUrl:
//         cloudinaryResult.secure_url,

//       publicId:
//         cloudinaryResult.public_id,

//       originalName:
//         req.file.originalname,

//       fileType:
//         req.file.mimetype,

//       ...riskData
//     });

//   }

//   catch (err) {

//     console.log(
//       "UPLOAD ERROR:"
//     );

//     console.log(err);

//     next(err);
//   }
// };






import mammoth from "mammoth";
import streamifier from "streamifier";
import { createRequire } from "module";
import Tesseract from "tesseract.js";

import cloudinary from "../config/cloudinary.js";
import prisma from "../config/db.js";

import { calculateRisk } from "../services/riskEngine.js";
import { fixSpacedOCRText } from "../utils/ocrUtils.js";

const require = createRequire(import.meta.url);

const pdfParse = require("pdf-parse");

const delay = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const uploadController = async (
  req,
  res,
  next
) => {

  try {

    const io =
      req.app.get("io");

    const socketId =
      req.query.socketId;

    /*
    =============================================================
    FILE VALIDATION
    =============================================================
    */

    if (!req.file) {

      return res.status(400).json({

        success: false,

        message:
          "No file uploaded"
      });
    }

    let fileContent = "";

    let ocrConfidence = null;

    /*
    =============================================================
    STEP 1 — SOCKET PROGRESS
    =============================================================
    */

    if (io && socketId) {

      io.to(socketId).emit(

        "uploadProgress",

        {
          percent: 10,

          message:
            "Uploading file..."
        }
      );
    }

    await delay(500);

    /*
    =============================================================
    CLOUDINARY UPLOAD
    =============================================================
    */

    const cloudinaryResult =
      await new Promise(

        (resolve, reject) => {

          const stream =
            cloudinary.uploader.upload_stream(

              {
                folder:
                  "certificates",

                resource_type:
                  "auto"
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

          streamifier
            .createReadStream(
              req.file.buffer
            )
            .pipe(stream);
        }
      );

    /*
    =============================================================
    STEP 2 — CONTENT EXTRACTION
    =============================================================
    */

    if (io && socketId) {

      io.to(socketId).emit(

        "uploadProgress",

        {
          percent: 40,

          message:
            "Extracting content..."
        }
      );
    }

    await delay(500);

    /*
    =============================================================
    PDF EXTRACTION
    =============================================================
    */

    if (
      req.file.mimetype ===
      "application/pdf"
    ) {

      const pdfData =
        await pdfParse(
          req.file.buffer
        );

      fileContent =
        pdfData.text;
    }

    /*
    =============================================================
    TXT EXTRACTION
    =============================================================
    */

    else if (
      req.file.mimetype ===
      "text/plain"
    ) {

      fileContent =
        req.file.buffer.toString(
          "utf-8"
        );
    }

    /*
    =============================================================
    DOCX EXTRACTION
    =============================================================
    */

    else if (

      req.file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

    ) {

      const result =
        await mammoth.extractRawText({

          buffer:
            req.file.buffer
        });

      fileContent =
        result.value;
    }

    /*
    =============================================================
    IMAGE OCR
    =============================================================
    */

    else if (

      req.file.mimetype ===
        "image/png" ||

      req.file.mimetype ===
        "image/jpeg" ||

      req.file.mimetype ===
        "image/jpg"

    ) {

      if (io && socketId) {

        io.to(socketId).emit(

          "uploadProgress",

          {
            percent: 55,

            message:
              "Running OCR..."
          }
        );
      }

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

      fileContent =
        fixSpacedOCRText(
          result.data.text
        );

      ocrConfidence =
        Math.round(
          result.data.confidence
        );

      console.log(
        "OCR Confidence:",
        ocrConfidence
      );

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
    =============================================================
    STEP 3 — RISK ANALYSIS
    =============================================================
    */

    if (io && socketId) {

      io.to(socketId).emit(

        "uploadProgress",

        {
          percent: 75,

          message:
            "Analyzing certificate..."
        }
      );
    }

    await delay(500);

    /*
    =============================================================
    CLEAN TEXT
    =============================================================
    */

    const cleanText =
      fileContent

        .replace(/\0/g, "")

        .replace(/\s+/g, " ")

        .trim();

    /*
    =============================================================
    RISK ANALYSIS
    =============================================================
    */

    const riskData =
      calculateRisk(
        cleanText
      );

    /*
    =============================================================
    NAME DETECTION
    =============================================================
    */

    let detectedName =
      "Unknown";

    const namePatterns = [

      /(?:presented to|awarded to|certify that|certified to|this is to certify that)\s+(?:dr\.?|mr\.?|ms\.?|mrs\.?)?\s*([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+){0,3})/i,

      /(?:dr\.?|mr\.?|ms\.?|mrs\.?)\s+([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+){0,3})/i,

      /to\s+(?:dr\.?|mr\.?|ms\.?|mrs\.?)?\s*([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+){1,3})\s+(?:for|in|on|has)/i
    ];

    for (const pattern of namePatterns) {

      const match =
        cleanText.match(pattern);

      if (match && match[1]) {

        const candidate =
          match[1]

            .replace(
              /dr\.?|mr\.?|ms\.?|mrs\.?/gi,
              ""
            )

            .replace(
              /[^\w\s]/g,
              ""
            )

            .trim();

        if (
          candidate.length > 1
        ) {

          detectedName =
            candidate;

          break;
        }
      }
    }

    /*
    =============================================================
    COMPANY DETECTION
    =============================================================
    */

    let detectedCompany =
      "Unknown";

    const companyPatterns = [

      /organized by\s+([A-Za-z\s,&.-]+?)(?:\s*from|\s*during|\s*on|\s*in\s+\d|$)/i,

      /issued by\s+([A-Za-z\s,&.-]+?)(?:\s*from|\s*during|$)/i,

      /conducted by\s+([A-Za-z\s,&.-]+?)(?:\s*from|\s*during|$)/i,

      /(google)/i,
      /(microsoft)/i,
      /(coursera)/i,
      /(nptel)/i,
      /(infosys)/i,
      /(tcs)/i,
      /(ieee)/i,
      /(internshala)/i
    ];

    for (const pattern of companyPatterns) {

      const match =
        cleanText.match(pattern);

      if (match && match[1]) {

        detectedCompany =
          match[1]
            .trim();

        break;
      }
    }

    /*
    =============================================================
    ROLE DETECTION
    =============================================================
    */

    let detectedRole =
      "Participant";

    const lowerText =
      cleanText.toLowerCase();

    if (

      lowerText.includes(
        "presenter"
      ) ||

      lowerText.includes(
        "presenting the paper"
      )

    ) {

      detectedRole =
        "Presenter";
    }

    else if (
      lowerText.includes(
        "intern"
      )
    ) {

      detectedRole =
        "Intern";
    }

    else if (
      lowerText.includes(
        "volunteer"
      )
    ) {

      detectedRole =
        "Volunteer";
    }

    else if (
      lowerText.includes(
        "speaker"
      )
    ) {

      detectedRole =
        "Speaker";
    }

    else if (
      lowerText.includes(
        "organizer"
      ) ||

      lowerText.includes(
        "organiser"
      )
    ) {

      detectedRole =
        "Organizer";
    }

    else if (
      lowerText.includes(
        "coordinator"
      )
    ) {

      detectedRole =
        "Coordinator";
    }

    /*
    =============================================================
    DATE / DURATION DETECTION
    =============================================================
    */

    let detectedDuration =
      "Unknown";

    const datePatterns = [

      /\d{1,2}(?:st|nd|rd|th)?\s*[-–]\s*\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+[,]?\s+\d{4}/i,

      /\d{1,2}\s+[A-Za-z]+\s+\d{4}/i,

      /(?:january|february|march|april|may|june|july|august|september|october|november|december)[,]?\s+\d{4}/i,

      /20\d{2}/
    ];

    for (const pattern of datePatterns) {

      const match =
        cleanText.match(pattern);

      if (match && match[0]) {

        detectedDuration =
          match[0]

            .replace(
              /\s+/g,
              " "
            )

            .trim();

        break;
      }
    }

    console.log(
      "DETECTED NAME:",
      detectedName
    );

    console.log(
      "DETECTED COMPANY:",
      detectedCompany
    );

    console.log(
      "DETECTED ROLE:",
      detectedRole
    );

    console.log(
      "DETECTED DURATION:",
      detectedDuration
    );

    /*
    =============================================================
    SAVE TO DATABASE
    =============================================================
    */

    const savedCertificate =
      await prisma.certificate.create({

        data: {

          userId:
            req.user?.id || null,

          name:
            req.body.name ||
            detectedName,

          email:
            req.body.email ||
            "Not Provided",

          company:
            req.body.company ||
            detectedCompany,

          role:
            req.body.role ||
            detectedRole,

          duration:
            req.body.duration ||
            detectedDuration,

          riskScore:
            riskData.riskScore,

          riskLevel:
            riskData.riskLevel,

          reasons:
            riskData.reasons,

          extractedContent:
            cleanText
        }
      });

    console.log(
      "Certificate Saved:",
      savedCertificate.id
    );

    /*
    =============================================================
    COMPLETE
    =============================================================
    */

    if (io && socketId) {

      io.to(socketId).emit(

        "uploadProgress",

        {
          percent: 100,

          message:
            "Completed ✅"
        }
      );
    }

    /*
    =============================================================
    RESPONSE
    =============================================================
    */

    res.status(200).json({

      success: true,

      certificateId:
        savedCertificate.id,

      extractedContent:
        cleanText,

      ocrConfidence,

      ocrConfidence: ocrConfidence,

      cloudinaryUrl:
        cloudinaryResult.secure_url,

      publicId:
        cloudinaryResult.public_id,

      originalName:
        req.file.originalname,

      fileType:
        req.file.mimetype,

      detectedFields: {

        name:
          detectedName,

        company:
          detectedCompany,

        role:
          detectedRole,

        duration:
          detectedDuration
      },

      ...riskData
    });

  }

  catch (err) {

    console.log(
      "UPLOAD ERROR:"
    );

    console.log(err);

    next(err);
  }
};