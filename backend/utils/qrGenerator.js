const QRCode = require('qrcode');

/**
 * Generates a QR Code as a Data URI (Base64 Image) for verification URL
 * @param {String} token - Verification token for the report
 * @returns {Promise<String>} - Base64 Data URI string
 */
const generateVerificationQRCode = async (token) => {
  try {
    const origin = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verifyUrl = `${origin}/verify-report/${token}`;
    const qrDataUri = await QRCode.toDataURI(verifyUrl, {
      color: {
        dark: '#1e3a8a', // Dark Blue themed color
        light: '#ffffff'
      },
      width: 250,
      margin: 2
    });
    return qrDataUri;
  } catch (error) {
    console.error('Error generating QR Code:', error);
    throw new Error('Failed to generate verification QR code');
  }
};

module.exports = {
  generateVerificationQRCode
};
