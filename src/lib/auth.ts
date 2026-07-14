import jwt from "jsonwebtoken";

export const BARBEIRO_TELEFONE = "73981337571";

export type AuthPayload = {
  clienteId: number;
  role?: "barbeiro" | "cliente" | string;
};

export function isBarbeiroTelefone(telefone: string): boolean {
  return telefone.replace(/\D/g, "") === BARBEIRO_TELEFONE;
}

export function roleFromTelefone(telefone: string): "barbeiro" | "cliente" {
  return isBarbeiroTelefone(telefone) ? "barbeiro" : "cliente";
}

export function verifyAuthToken(authHeader: string | null): AuthPayload | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
  } catch {
    return null;
  }
}

export function requireBarbeiro(authHeader: string | null): AuthPayload | null {
  const payload = verifyAuthToken(authHeader);
  if (!payload || payload.role !== "barbeiro") return null;
  return payload;
}
