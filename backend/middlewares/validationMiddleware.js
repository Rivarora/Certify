// const validateCertificate = (req, res, next) => {
//   const { name, email, company, role, duration } = req.body;

//   // ✔ Required fields
//   if (!name || !email || !company || !role || !duration) {
//     return res.status(400).json({
//       success: false,
//       message: "All fields are required"
//     });
//   }

//   // ✔ Email validation
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!emailRegex.test(email)) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid email format"
//     });
//   }

//   // ✔ Duration validation
//   if (!duration.toLowerCase().includes("month")) {
//     return res.status(400).json({
//       success: false,
//       message: "Duration must be in months"
//     });
//   }

//   next();
// };

// export default validateCertificate;


// ✔ Validate file upload request
export const validateUpload = (req, res, next) => {

  // 1. Must be authenticated (set by authMiddleware)
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }

  // 2. socketId must exist
  const { socketId } = req.query;
  if (!socketId || socketId.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "socketId is required in query"
    });
  }

  // 3. File must be present (after multer)
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded"
    });
  }

  // 4. File size check (20MB)
  const MAX_SIZE = 20 * 1024 * 1024;
  if (req.file.size > MAX_SIZE) {
    return res.status(400).json({
      success: false,
      message: "File too large (Max: 20MB)"
    });
  }

  // 5. File type check
  const ALLOWED = [
    "application/pdf",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];

  if (!ALLOWED.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: "Only PDF, TXT, DOCX files allowed"
    });
  }

  // ✅ All checks passed
  next();
};


// ✔ Validate certificate form fields
export const validateCertificate = (req, res, next) => {
  const { name, email, company, role, duration } = req.body;

  if (!name || !email || !company || !role || !duration) {
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    });
  }

  // Email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format"
    });
  }

  // Duration format check
  if (!duration.toLowerCase().includes("month")) {
    return res.status(400).json({
      success: false,
      message: "Duration must include 'month'"
    });
  }

  next();
};


