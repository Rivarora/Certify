import { jest } from "@jest/globals";
import { createCertificateForUser, findOwnedCertificate, deleteOwnedCertificate } from "../controllers/certificateController.js";

describe("certificate ownership queries", () => {
  test("creation always overwrites client-supplied user ids", async () => {
    const database = { certificate: { create: jest.fn().mockResolvedValue({ id: 1 }) } };
    await createCertificateForUser(database, 22, { name: "Credential", userId: 99 });
    expect(database.certificate.create).toHaveBeenCalledWith({ data: { name: "Credential", userId: 22 } });
  });

  test("an inaccessible or legacy null-owner certificate is not returned", async () => {
    const database = { certificate: { findFirst: jest.fn().mockResolvedValue(null) } };
    const result = await findOwnedCertificate(database, 8, 22);
    expect(result).toBeNull();
    expect(database.certificate.findFirst).toHaveBeenCalledWith({ where: { id: 8, userId: 22 } });
  });

  test("deletion is constrained to the authenticated owner", async () => {
    const database = { certificate: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) } };
    const result = await deleteOwnedCertificate(database, 8, 22);
    expect(result.count).toBe(0);
    expect(database.certificate.deleteMany).toHaveBeenCalledWith({ where: { id: 8, userId: 22 } });
  });
});
