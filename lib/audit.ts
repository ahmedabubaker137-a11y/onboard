import CryptoJS from "crypto-js";

export interface AuditRecord {
  id: string;
  companyId: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  ipAddress: string;
  sha256Hash: string;
  createdAt: string;
}

export function generateCryptoHash(payload: Record<string, unknown>): string {
  const serialized = JSON.stringify(payload);
  return CryptoJS.SHA256(serialized).toString(CryptoJS.enc.Hex);
}

export function createAuditLogEntry(
  actorEmail: string,
  actorRole: string,
  action: string,
  entityType: string,
  entityId: string,
  detailsObj: Record<string, unknown>,
  companyId: string = "comp_acme_01"
): AuditRecord {
  const timestamp = new Date().toISOString();
  const rawDetails = JSON.stringify(detailsObj);
  const hash = generateCryptoHash({
    companyId,
    actorEmail,
    action,
    entityType,
    entityId,
    details: rawDetails,
    timestamp,
  });

  return {
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    companyId,
    actorEmail,
    actorRole,
    action,
    entityType,
    entityId,
    details: rawDetails,
    ipAddress: "192.168.1.104",
    sha256Hash: hash,
    createdAt: timestamp,
  };
}
