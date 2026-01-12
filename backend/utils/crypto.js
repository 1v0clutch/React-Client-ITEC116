const CryptoJS = require('crypto-js');

function getCryptoSecret() {
  return process.env.CRYPTO_SECRET;
}

function encrypt(text) {
  if (!text) return '';
  const secret = getCryptoSecret();
  if (!secret) {
    throw new Error('CRYPTO_SECRET environment variable is not set');
  }
  return CryptoJS.AES.encrypt(text, secret).toString();
}

function decrypt(ciphertext) {
  if (!ciphertext) return '';
  try {
    const secret = getCryptoSecret();
    if (!secret) {
      throw new Error('CRYPTO_SECRET environment variable is not set');
    }
    const bytes = CryptoJS.AES.decrypt(ciphertext, secret);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (err) {
    return '';
  }
}

module.exports = { encrypt, decrypt };
