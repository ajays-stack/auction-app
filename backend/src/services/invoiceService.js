const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const sgMail = require('../config/email');

class InvoiceService {
  static async generateInvoice(auction, buyer, seller) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const invoiceNumber = `INV-${auction.id.substr(0, 8)}`;
      const fileName = `invoice-${invoiceNumber}.pdf`;
      const filePath = path.join(__dirname, '../../temp', fileName);
      
      // Ensure temp directory exists
      const tempDir = path.join(__dirname, '../../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);
      
      // Header
      doc.fontSize(20).text('AUCTION INVOICE', 50, 50);
      
      // Invoice details
      doc.fontSize(12)
         .text(`Invoice Number: ${invoiceNumber}`, 50, 100)
         .text(`Date: ${new Date().toLocaleDateString()}`, 50, 120)
         .text(`Auction ID: ${auction.id}`, 50, 140);
      
      // Seller information
      doc.text('SELLER:', 50, 180)
         .text(`${seller.firstName} ${seller.lastName}`, 50, 200)
         .text(`${seller.email}`, 50, 220);
      
      // Buyer information
      doc.text('BUYER:', 300, 180)
         .text(`${buyer.firstName} ${buyer.lastName}`, 300, 200)
         .text(`${buyer.email}`, 300, 220);
      
      // Auction item details
      doc.text('ITEM DETAILS:', 50, 280)
         .text(`Title: ${auction.title}`, 50, 300)
         .text(`Description: ${auction.description || 'N/A'}`, 50, 320)
         .text(`Final Price: $${auction.finalPrice}`, 50, 360, { fontSize: 14, underline: true });
      
      // Terms
      doc.text('TERMS & CONDITIONS:', 50, 420)
         .fontSize(10)
         .text('Payment is due within 7 days of invoice date.', 50, 440)
         .text('Item should be collected within 14 days.', 50, 460);
      
      doc.end();
      
      stream.on('finish', () => {
        resolve({ filePath, fileName, invoiceNumber });
      });
      
      stream.on('error', reject);
    });
  }
  
  static async sendInvoiceEmail(auction, buyer, seller, invoiceData) {
    const { filePath, fileName } = invoiceData;
    
    const attachment = {
      content: fs.readFileSync(filePath).toString('base64'),
      filename: fileName,
      type: 'application/pdf',
      disposition: 'attachment'
    };
    
    const buyerMsg = {
      to: buyer.email,
      from: process.env.FROM_EMAIL,
      subject: `Invoice for Auction: ${auction.title}`,
      html: `
        <h2>Invoice for Your Winning Bid</h2>
        <p>Congratulations on winning the auction for "${auction.title}"!</p>
        <p><strong>Final Price:</strong> $${auction.finalPrice}</p>
        <p>Please find your invoice attached.</p>
        <p>Payment is due within 7 days.</p>
      `,
      attachments: [attachment]
    };
    
    const sellerMsg = {
      to: seller.email,
      from: process.env.FROM_EMAIL,
      subject: `Sale Invoice: ${auction.title}`,
      html: `
        <h2>Your Item Has Been Sold</h2>
        <p>Your auction "${auction.title}" has been successfully sold!</p>
        <p><strong>Sale Price:</strong> $${auction.finalPrice}</p>
        <p><strong>Buyer:</strong> ${buyer.firstName} ${buyer.lastName}</p>
        <p>Please find the invoice attached for your records.</p>
      `,
      attachments: [attachment]
    };
    
    await Promise.all([
      sgMail.send(buyerMsg),
      sgMail.send(sellerMsg)
    ]);
    
    // Clean up temp file
    fs.unlinkSync(filePath);
  }
}

module.exports = InvoiceService;