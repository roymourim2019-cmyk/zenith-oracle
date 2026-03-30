import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CreditCard, Check, Crown } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PaymentModal = ({ onClose, onSuccess, currency = "INR" }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('plan');
  const [selectedPlan, setSelectedPlan] = useState('yearly');

  const plans = {
    monthly: {
      INR: { amount: 499, display: '₹499' },
      USD: { amount: 999, display: '$9.99' }
    },
    yearly: {
      INR: { amount: 3999, display: '₹3,999' },
      USD: { amount: 7999, display: '$79.99' }
    },
    lifetime: {
      INR: { amount: 24999, display: '₹24,999' },
      USD: { amount: 49900, display: '$499' }
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      const planAmount = plans[selectedPlan][currency].amount;
      
      const orderResponse = await axios.post(`${API}/payment/create-order`, {
        amount: planAmount,
        currency: currency === 'INR' ? 'INR' : 'USD',
        receipt: `${selectedPlan}_${Date.now()}`
      });

      const options = {
        key: 'rzp_test_1DP5mmOlF5G5ag',
        amount: orderResponse.data.amount,
        currency: currency === 'INR' ? 'INR' : 'USD',
        name: 'Zenith Oracle',
        description: `${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Subscription`,
        order_id: orderResponse.data.id,
        handler: async (response) => {
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
        className="glass-card rounded-2xl p-8 max-w-2xl w-full relative"
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
            <h2 className="text-3xl font-bold text-white mb-2" style={{fontFamily: 'Playfair Display, serif'}}>Choose Your Power Level</h2>
            <p className="text-[#94A3B8] mb-6">Unlock your full cosmic potential</p>

            <div className="grid gap-4 mb-6">
              <PlanOption
                title="Monthly Alpha"
                price={plans.monthly[currency].display}
                period="/month"
                selected={selectedPlan === 'monthly'}
                onClick={() => setSelectedPlan('monthly')}
              />
              
              <PlanOption
                title="Yearly Alpha"
                price={plans.yearly[currency].display}
                period="/year"
                badge="Save 33%"
                selected={selectedPlan === 'yearly'}
                onClick={() => setSelectedPlan('yearly')}
                recommended={true}
              />
              
              <PlanOption
                title="Enterprise Lifetime"
                price={plans.lifetime[currency].display}
                period="one-time"
                badge="Top 1%"
                selected={selectedPlan === 'lifetime'}
                onClick={() => setSelectedPlan('lifetime')}
                enterprise={true}
              />
            </div>

            <ul className="space-y-3 mb-8 text-sm">
              {[
                '100% Ad-Free Experience',
                'All D1-D60 Divisional Charts',
                'Unlimited Synastry Analysis',
                'PDF Export Capability',
                'AI Daily Briefings',
                'View Logic Transparency',
                selectedPlan === 'lifetime' ? 'Lifetime Access + Priority Support' : 'Unlimited Profile Vault'
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
              className="w-full bg-[#D4AF37] text-[#020617] font-bold py-4 hover:bg-[#F3E5AB] hover:shadow-[0_0_15px_rgba(212,175,55,0.6)] transition-all duration-300 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed gold-pulse"
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
            <h3 className="text-2xl font-bold text-white mb-2" style={{fontFamily: 'Playfair Display, serif'}}>Welcome to Zenith Premium!</h3>
            <p className="text-[#94A3B8]">Your cosmic dominance awaits...</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const PlanOption = ({ title, price, period, badge, selected, onClick, recommended, enterprise }) => (
  <button
    onClick={onClick}
    className={`text-left p-4 rounded-xl border-2 transition-all ${
      selected 
        ? 'border-[#D4AF37] bg-[#D4AF37]/10' 
        : 'border-[#D4AF37]/20 hover:border-[#D4AF37]/40'
    } ${recommended ? 'relative' : ''}`}
  >
    {badge && (
      <span className="absolute -top-3 right-4 bg-[#D4AF37] text-[#020617] px-3 py-1 text-xs font-bold uppercase">
        {badge}
      </span>
    )}
    <div className="flex justify-between items-center">
      <div>
        <h4 className="text-lg font-bold text-white flex items-center gap-2">
          {enterprise && <Crown className="w-5 h-5 text-[#D4AF37]" />}
          {title}
        </h4>
        <p className="text-2xl font-bold text-[#D4AF37] mt-1">
          {price}<span className="text-sm text-white/60 ml-1">{period}</span>
        </p>
      </div>
      <div className={`w-6 h-6 rounded-full border-2 ${
        selected ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-white/40'
      }`}>
        {selected && <Check className="w-full h-full text-[#020617]" />}
      </div>
    </div>
  </button>
);

export default PaymentModal;
