const QRCode = require('qrcode');
const speakeasy = require('speakeasy');

async function testQRGeneration() {
  try {
    // Generate a secret
    const secret = speakeasy.generateSecret({
      name: 'ERP (test@example.com)',
      issuer: 'ERP System',
      length: 20
    });

    console.log('Secret generated:', secret.base32);

    // Test the old way (might be too long)
    const longUrl = secret.otpauth_url;
    console.log('Long URL length:', longUrl.length);
    console.log('Long URL:', longUrl);

    // Test our new short way
    const emailPart = 'test@example.com'.split('@')[0];
    const shortLabel = emailPart.length > 10 ? emailPart.substring(0, 10) : emailPart;
    const shortUrl = `otpauth://totp/${shortLabel}?secret=${secret.base32}&issuer=ERP`;
    
    console.log('Short URL length:', shortUrl.length);
    console.log('Short URL:', shortUrl);

    // Try to generate QR code with short URL
    const qrCodeUrl = await QRCode.toDataURL(shortUrl, {
      errorCorrectionLevel: 'L',
      margin: 1,
      width: 150
    });

    console.log('QR Code generated successfully!');
    console.log('QR Code data URL length:', qrCodeUrl.length);
    console.log('QR Code starts with:', qrCodeUrl.substring(0, 50) + '...');

  } catch (error) {
    console.error('Error generating QR code:', error.message);
  }
}

testQRGeneration();
