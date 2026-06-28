import logger from '../utils/logger.js';

// Base Payment Service class
class PaymentService {
  constructor(provider) {
    this.provider = provider;
  }

  async initiatePayment(amount, currency = 'USD', metadata = {}) {
    logger.info(`[PAYMENT SERVICE] Initiating payment of ${amount} ${currency} via ${this.provider}`);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Return mock payment credentials / details
    return {
      success: true,
      transactionId: `${this.provider.toLowerCase()}_tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      amount,
      currency,
      paymentStatus: 'pending',
      clientSecret: `sec_${Math.random().toString(36).substring(2, 15)}`
    };
  }

  async verifyPayment(transactionId, payload) {
    logger.info(`[PAYMENT SERVICE] Verifying transaction ${transactionId} via ${this.provider}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      transactionId,
      status: 'completed',
      verifiedAt: new Date()
    };
  }

  async refundPayment(transactionId, amount) {
    logger.info(`[PAYMENT SERVICE] Refunding transaction ${transactionId} for ${amount} via ${this.provider}`);
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      success: true,
      refundId: `ref_${Date.now()}`,
      status: 'refunded',
      amount
    };
  }
}

// Concrete Service Providers
export const StripePaymentService = new PaymentService('Stripe');
export const RazorpayPaymentService = new PaymentService('Razorpay');
export const PayPalPaymentService = new PaymentService('PayPal');
export const CashPaymentService = new PaymentService('Cash');

// Factory to fetch the correct service provider
export const getPaymentService = (method) => {
  switch (method?.toLowerCase()) {
    case 'stripe':
      return StripePaymentService;
    case 'razorpay':
      return RazorpayPaymentService;
    case 'paypal':
      return PayPalPaymentService;
    case 'cash':
    case 'pay at hotel':
      return CashPaymentService;
    default:
      return CashPaymentService;
  }
};
