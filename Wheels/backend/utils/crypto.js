const CryptoJS = require('crypto-js');
const AES_SECRET = process.env.AES_SECRET;

function encrypt(text) {
  if (!text) return '';
  return CryptoJS.AES.encrypt(text, AES_SECRET).toString();
}

function decrypt(ciphertext) {
  if (!ciphertext) return '';
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, AES_SECRET);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (err) {
    return '';
  }
}

module.exports = { encrypt, decrypt };