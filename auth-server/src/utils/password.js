// Password hashing with Node's native crypto (scrypt + per-user random salt).
// Stored format: "<salt hex>:<hash hex>"
const crypto = require("crypto");
const { promisify } = require("util");

const scrypt = promisify(crypto.scrypt);
const KEY_LEN = 64;

exports.hashPassword = async (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = await scrypt(password, salt, KEY_LEN);
  return `${salt}:${hash.toString("hex")}`;
};

exports.verifyPassword = async (password, stored) => {
  const [salt, hashHex] = String(stored).split(":");
  if (!salt || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scrypt(password, salt, expected.length);
  return crypto.timingSafeEqual(actual, expected); // constant-time compare
};
