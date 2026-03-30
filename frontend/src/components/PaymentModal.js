import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CreditCard, Check } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PaymentModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('plan');

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      // Create order
      const orderResponse = await axios.post(`${API}/payment/create-order`, {
        amount: 999,
        currency: 'INR',
        receipt: `premium_${Date.now()}`
      });

      const options = {
        key: 'rzp_test_1DP5mmOlF5G5ag',
        amount: orderResponse.data.amount,
        currency: 'INR',
        name: 'Zenith Oracle',
        description: 'Premium Subscription',
        order_id: orderResponse.data.id,
        handler: async (response) => {
          // Verify payment
          try {
            await axios.post(`${API}/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            
            setStep('success');
            setTimeout(() => {
              onSuccess();
            }, 2000);
          } catch (error) {
            console.error('Payment verification failed:', error);
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: 'Zenith User',
          email: 'user@zenith.com'
        },
        theme: {
          color: '#D4AF37'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment initialization failed:', error);
      alert('Failed to initialize payment');
    }
    
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-testid="payment-modal">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl p-8 max-w-md w-full relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
          data-testid="close-payment-modal"
        >
          <X className="w-6 h-6" />
        </button>

        {step === 'plan' && (
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Zenith Premium</h2>
            <p className="text-[#94A3B8] mb-6">Unlock your full cosmic potential</p>

            <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl p-6 mb-6">
              <div className="text-5xl font-bold text-[#D4AF37] mb-2">₹999
                <span className="text-lg text-white/60">/month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                '100% Ad-Free Experience',
                'All D1-D60 Divisional Charts',
                'Unlimited Synastry Analysis',
                'PDF Export Capability',
                'AI Daily Briefings',
                'View Logic Transparency',
                'Unlimited Profile Vault'
              ].map((feature, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-white/80">
                  <Check className="w-5 h-5 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-[#D4AF37] text-[#020617] font-bold py-4 hover:bg-[#F3E5AB] hover:shadow-[0_0_15px_rgba(212,175,55,0.6)] transition-all duration-300 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="proceed-payment-button"
            >
              {loading ? 'Processing...' : (
                <>
                  <CreditCard className="w-5 h-5 inline mr-2" />
                  Proceed to Payment
                </>
              )}
            </button>

            <p className="text-xs text-white/40 text-center mt-4">
              Powered by Razorpay | Secure Payment Gateway
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-12 h-12 text-[#020617]" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Welcome to Zenith Premium!</h3>
            <p className="text-[#94A3B8]">Your cosmic dominance awaits...</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentModal;