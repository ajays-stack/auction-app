const sgMail = require('../config/email');

class EmailService {
  static async sendEmail(msg) {
    try {
      await sgMail.send(msg);
    } catch (error) {
      console.error('Email sending failed:', error);
      // Don't throw the error to prevent breaking the main flow
      // but log it for monitoring
    }
  }
  static async sendAuctionEndNotification(auction, winner) {
    const sellerMsg = {
      to: auction.seller.email,
      from: process.env.FROM_EMAIL,
      subject: `Auction Ended: ${auction.title}`,
      html: `
        <h2>Your Auction Has Ended</h2>
        <p>Your auction "${auction.title}" has ended.</p>
        <p><strong>Final Bid:</strong> $${auction.finalPrice}</p>
        <p><strong>Winner:</strong> ${winner.firstName} ${winner.lastName}</p>
        <p>Please log in to accept or reject this bid.</p>
      `
    };

    const buyerMsg = {
      to: winner.email,
      from: process.env.FROM_EMAIL,
      subject: `You won the auction: ${auction.title}`,
      html: `
        <h2>Congratulations!</h2>
        <p>You won the auction for "${auction.title}".</p>
        <p><strong>Your Winning Bid:</strong> $${auction.finalPrice}</p>
        <p>The seller will review your bid and get back to you soon.</p>
      `
    };

    await Promise.all([
      this.sendEmail(sellerMsg),
      this.sendEmail(buyerMsg)
    ]);
  }

  static async sendBidAcceptedNotification(auction, buyer) {
    const msg = {
      to: buyer.email,
      from: process.env.FROM_EMAIL,
      subject: `Bid Accepted: ${auction.title}`,
      html: `
        <h2>Your Bid Has Been Accepted!</h2>
        <p>Great news! Your bid of $${auction.finalPrice} for "${auction.title}" has been accepted.</p>
        <p>You will receive an invoice shortly.</p>
      `
    };

    await sgMail.send(msg);
  }

  static async sendBidRejectedNotification(auction, buyer) {
    const msg = {
      to: buyer.email,
      from: process.env.FROM_EMAIL,
      subject: `Bid Rejected: ${auction.title}`,
      html: `
        <h2>Bid Not Accepted</h2>
        <p>We regret to inform you that your bid of $${auction.finalPrice} for "${auction.title}" was not accepted by the seller.</p>
        <p>Don't worry! There are many other great items available for auction.</p>
        <p>Check out our active auctions to find something else you might like.</p>
      `
    };

    await this.sendEmail(msg);
  }

  static async sendCounterOfferNotification(auction, counterOffer, buyer) {
    const msg = {
      to: buyer.email,
      from: process.env.FROM_EMAIL,
      subject: `Counter Offer: ${auction.title}`,
      html: `
        <h2>You Received a Counter Offer</h2>
        <p>The seller has made a counter offer for "${auction.title}".</p>
        <p><strong>Your Original Bid:</strong> $${counterOffer.originalBid}</p>
        <p><strong>Counter Offer:</strong> $${counterOffer.counterOfferAmount}</p>
        <p><strong>Message:</strong> ${counterOffer.message}</p>
        <p>Please log in to accept or reject this counter offer.</p>
      `
    };

    await this.sendEmail(msg);
  }
}

module.exports = EmailService;