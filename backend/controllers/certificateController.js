// Temporary in-memory storage for certificates
// let certificates = [];
// let idCounter = 1;
import prisma from "../config/db.js";

export const findOwnedCertificate = (database, id, userId) =>
  database.certificate.findFirst({ where: { id, userId } });

export const deleteOwnedCertificate = (database, id, userId) =>
  database.certificate.deleteMany({ where: { id, userId } });

export const createCertificateForUser = (database, userId, data) =>
  database.certificate.create({ data: { ...data, userId } });


/*
=====================================================
 CREATE CERTIFICATE  (POST /api/certificate)
Saves a new certificate result to PostgreSQL.
Called after upload + risk analysis completes.
=====================================================
*/
export const createCertificate = async (req, res, next) => {
  try {
    const {
      name,
      email,
      company,
      role,
      duration,
      riskScore,
      riskLevel,
      reasons,
      extractedContent,
    } = req.body;
 
    const userId = req.user.id;
    const newCert = await createCertificateForUser(prisma, userId, {
        name,
        email,
        company,
        role,
        duration,
        riskScore: riskScore ? parseInt(riskScore) : 0,
        riskLevel: riskLevel || "Low",
        reasons: reasons || [],
        extractedContent: extractedContent || null,
    });
    // certificates.push(newCert);

    res.status(201).json({
      success: true,
      message: "Certificate saved successfully!",
      certificate: newCert,
    });
  } catch (error) {
    next(error);
  }
};



/*
=====================================================
📌 GET CERTIFICATE BY ID
=====================================================
*/
export const getCertificateById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Certificate not found" } });
    }
 
    const cert = await findOwnedCertificate(prisma, id, req.user.id);
 
    if (!cert) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Certificate not found" },
      });
    }
 
    res.status(200).json({
      success: true,
      data: cert,
    });
  } catch (error) {
    next(error);
  }
};


// 📌 GET ALL CERTIFICATES  (GET /api/certificates)
// Supports filters: company, riskLevel, date, search
// Used by History page.
// =====================================================
// */
export const getAllCertificates = async (req, res, next) => {
  try {
    const { company, riskLevel, startDate, endDate, search } = req.query;
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;
    // Build dynamic WHERE clause
    const where = { userId: req.user.id };
 
    if (company) {
      where.company = { contains: company, mode: "insensitive" };
    }
 
    if (riskLevel) {
      where.riskLevel = riskLevel; // "Low" | "Medium" | "High"
    }
 
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate)   where.createdAt.lte = new Date(endDate);
    }
 
    // Full text search across name, company, email
    if (search) {
      where.OR = [
        { name:    { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
        { email:   { contains: search, mode: "insensitive" } },
        { role:    { contains: search, mode: "insensitive" } },
      ];
    }
 
    const certificates = await prisma.certificate.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        role: true,
        duration: true,
        riskScore: true,
        riskLevel: true,
        reasons: true,
        createdAt: true,
        
      },
    });
 
    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates,
    });
  } catch (error) {
    next(error);
  }
};


/*
=====================================================
📌 GET CERTIFICATES BY COMPANY
=====================================================
*/
// export const getCertificatesByCompany = (req, res, next) => {
//   try {
//     const company = req.query.company;

//     if (!company) {
//       return res.status(400).json({
//         success: false, // ✅ added
//         message: "Company query required"
//       });
//     }

//     const filtered = certificates.filter(
//       c => c.company.toLowerCase() === company.toLowerCase()
//     );

//     res.status(200).json({
//       success: true, // ✅ added
//       count: filtered.length, // ✅ added
//       data: filtered
//     });

//   } catch (error) {
//     next(error);
//   }
// };

export const getCertificatesByCompany = async (req, res, next) => {
  // Delegates to getAllCertificates
  return getAllCertificates(req, res, next);
};
 
// =====================================================
// 📌 DELETE CERTIFICATE  (DELETE /api/certificate/:id)
// Remove a certificate from history.
// =====================================================
// */
export const deleteCertificate = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Certificate not found" } });
    }
 
    const deleted = await deleteOwnedCertificate(prisma, id, req.user.id);
    if (deleted.count === 0) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Certificate not found" },
      });
    }
 
    res.status(200).json({
      success: true,
      message: "Certificate deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
 
