import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const getKey = () => {
    const secret = process.env.TOKEN_SECRET;
    return crypto.createHash('sha256').update(secret).digest();
};

export const encryptMessage = (text) => {
    if (!text) return text;
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
};

export const decryptMessage = (encryptedText) => {
    if (!encryptedText || !encryptedText.includes(':')) return encryptedText;
    try {
        const [ivHex, contentHex] = encryptedText.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
        let decrypted = decipher.update(contentHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch {
        return encryptedText;
    }
};