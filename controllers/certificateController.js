// Temporary in-memory storage (no DB needed for demo)
let certificates = [];
let idCounter = 1;

// POST /api/certificate
export const createCertificate = (req, res) => {
  const data = req.body;

  const newCert = {
    id: idCounter++,
    name: data.name,
    email: data.email,
    company: data.company,
    role: data.role,
    duration: data.duration
  };

  certificates.push(newCert);

  res.status(201).json({
    message: "Certificate created successfully",
    certificate: newCert
  });
};

// GET /api/certificate/:id
export const getCertificateById = (req, res) => {
  const id = parseInt(req.params.id);

  const cert = certificates.find(c => c.id === id);

  if (!cert) {
    return res.status(404).json({ message: "Certificate not found" });
  }

  res.status(200).json(cert);
};

// GET /api/certificates?company=xyz
export const getCertificatesByCompany = (req, res) => {
  const company = req.query.company;

  if (!company) {
    return res.status(400).json({ message: "Company query required" });
  }

  const filtered = certificates.filter(
    c => c.company.toLowerCase() === company.toLowerCase()
  );

  res.status(200).json(filtered);
};