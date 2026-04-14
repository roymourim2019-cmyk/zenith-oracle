import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, MapPin } from 'lucide-react';

const OnboardingFlow = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({ name: '', birth_date: '', birth_time: '', latitude: '', longitude: '' });
  const [detectedCity, setDetectedCity] = useState('Kolkata');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          setFormData(p => ({ ...p, latitude: pos.coords.latitude.toFixed(4), longitude: pos.coords.longitude.toFixed(4) }));
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.state || 'your location';
            setDetectedCity(city);
          } catch (e) {}
        },
        () => {}
      );
    }
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setFormData(p => ({ ...p, latitude: pos.coords.latitude.toFixed(4), longitude: pos.coords.longitude.toFixed(4) })),
      () => {}
    );
  };

  const handleComplete = () => {
    const profile = {
      name: formData.name,
      birth_date: formData.birth_date,
      birth_time: formData.birth_time || '12:00:00',
      latitude: parseFloat(formData.latitude) || 28.6139,
      longitude: parseFloat(formData.longitude) || 77.209,
      timezone_offset: 5.5,
    };
    onComplete(profile);
  };

  const steps = [
    {
      title: 'Welcome, Seeker',
      subtitle: 'The Oracle awaits your identity',
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-2 block font-semibold">Your Name</label>
            <input type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="What shall the Oracle call you?" className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-4 py-3 text-white text-sm focus:border-[#D4AF37] focus:outline-none" autoFocus data-testid="onboard-name-input" />
          </div>
        </div>
      ),
      valid: formData.name.length > 0,
    },
    {
      title: 'Your Birth Moment',
      subtitle: 'The stars remember everything',
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-2 block font-semibold">Birth Date</label>
            <input type="date" value={formData.birth_date} onChange={e => setFormData(p => ({ ...p, birth_date: e.target.value }))} className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-4 py-3 text-white text-sm focus:border-[#D4AF37] focus:outline-none" data-testid="onboard-date-input" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-2 block font-semibold">Birth Time <span className="text-white/20">(optional)</span></label>
            <input type="time" step="1" value={formData.birth_time} onChange={e => setFormData(p => ({ ...p, birth_time: e.target.value ? (e.target.value.length === 5 ? e.target.value + ':00' : e.target.value) : '' }))} className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-4 py-3 text-white text-sm focus:border-[#D4AF37] focus:outline-none" data-testid="onboard-time-input" />
            <p className="text-[10px] text-white/20 mt-1">For maximum accuracy, include your birth time</p>
          </div>
        </div>
      ),
      valid: formData.birth_date.length > 0,
    },
    {
      title: 'Birth Location',
      subtitle: 'Where the stars aligned for you',
      content: (
        <div className="space-y-4">
          <button onClick={detectLocation} className="w-full flex items-center justify-center gap-2 border border-[#D4AF37]/30 text-[#D4AF37] py-3 rounded-lg text-sm hover:bg-[#D4AF37]/10 transition-all" data-testid="onboard-detect-location">
            <MapPin className="w-4 h-4" /> Auto-detect My Location
          </button>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-white/40 mb-1 block">Latitude</label>
              <input type="number" step="any" value={formData.latitude} onChange={e => setFormData(p => ({ ...p, latitude: e.target.value }))} placeholder="28.6139" className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-3 py-2.5 text-white text-xs focus:border-[#D4AF37] focus:outline-none" data-testid="onboard-lat-input" />
            </div>
            <div>
              <label className="text-[10px] text-white/40 mb-1 block">Longitude</label>
              <input type="number" step="any" value={formData.longitude} onChange={e => setFormData(p => ({ ...p, longitude: e.target.value }))} placeholder="77.2090" className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-3 py-2.5 text-white text-xs focus:border-[#D4AF37] focus:outline-none" data-testid="onboard-lng-input" />
            </div>
          </div>
          <p className="text-[10px] text-white/20 text-center">You can skip this — we'll use default coordinates</p>
        </div>
      ),
      valid: true,
    },
  ];

  const current = steps[step];

  return (
    <div className="fixed inset-0 bg-[#020617] z-[400] flex items-center justify-center" data-testid="onboarding-flow">
      <div className="w-full max-w-md mx-4">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i <= step ? 'bg-[#D4AF37]' : 'bg-white/10'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="glass-card rounded-2xl p-6 sm:p-8">
            <div className="text-center mb-6">
              {step === 0 ? (
                <>
                  <motion.img
                    src="/assets/zenith-oracle-logo.png"
                    alt="Zenith Oracle"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="w-32 h-32 mx-auto mb-4 rounded-2xl object-contain"
                    data-testid="onboard-logo"
                  />
                  <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>{current.title}</h2>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-sm text-[#D4AF37]/80 mt-2 italic"
                    data-testid="onboard-connection-msg"
                  >
                    The Oracle has recognized your connection from {detectedCity}.
                  </motion.p>
                  <p className="text-xs text-white/30 mt-1">{current.subtitle}</p>
                </>
              ) : (
                <>
                  <Sparkles className="w-8 h-8 text-[#D4AF37] mx-auto mb-3 liquid-gold-animation" />
                  <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>{current.title}</h2>
                  <p className="text-sm text-white/40 mt-1">{current.subtitle}</p>
                </>
              )}
            </div>
            {current.content}
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="px-6 py-3 rounded-xl border border-white/10 text-white/40 text-sm hover:text-white/70 transition-colors" data-testid="onboard-back-btn">
              Back
            </button>
          )}
          <button
            onClick={() => { if (step < steps.length - 1) setStep(s => s + 1); else handleComplete(); }}
            disabled={!current.valid}
            className="flex-1 bg-[#D4AF37] text-[#020617] font-bold py-3 rounded-xl hover:bg-[#F3E5AB] transition-all uppercase tracking-widest text-sm disabled:opacity-40 flex items-center justify-center gap-2"
            data-testid="onboard-next-btn"
          >
            {step < steps.length - 1 ? 'Continue' : 'Enter the Oracle'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {step === steps.length - 1 && (
          <button onClick={handleComplete} className="w-full text-center text-xs text-white/20 mt-3 hover:text-white/40 transition-colors" data-testid="onboard-skip-btn">
            Skip and explore freely
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingFlow;
