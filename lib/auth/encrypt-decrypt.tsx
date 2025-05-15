// these are the functions that encrypt and compare hashes

import { SALT_ROUNDS } from "@/types/upload-settings";
import bcrypt from "bcryptjs"; // install with: npm install bcryptjs
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return await bcrypt.compare(password, passwordHash);
}
