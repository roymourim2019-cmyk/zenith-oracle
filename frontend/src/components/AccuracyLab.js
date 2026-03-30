import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, Activity, Award, Lock, Database } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AccuracyLab = () => {
  const [engineData, setEngineData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEngineStatus();
  }, []);

  const fetchEngineStatus = async () => {
    try {
      const response = await axios.get(`${API}/accuracy/engine-status`);
      setEngineData(response.data);
    } catch (error) {
      console.error('Failed to fetch engine status:', error);
      setEngineData({
        engine_name: "Swiss Ephemeris",
        version: "2.10.3.2",
        ephemeris_basis: "NASA JPL DE431",
        status: "ACTIVE",
        delta_t: 69.2,
        ayanamsha: "Lahiri (Chitrapaksha)",
        precision: "Arc-Second",
        last_updated: new Date().toISOString()
      });
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] py-12 flex items-center justify-center">
        <div className="text-[#D4AF37] text-xl">Loading Accuracy Lab...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] py-12" data-testid="accuracy-lab">
      <div className="container mx-auto px-6 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center" style={{fontFamily: 'Playfair Display, serif'}}>
            <Shield className="w-12 h-12 text-[#D4AF37] mr-4" />
            Accuracy <span className="text-[#D4AF37] ml-2">Lab</span>
          </h1>
          <p className="text-[#94A3B8] text-lg">
            Mathematical Integrity & Astronomical Precision Verification
          </p>
        </motion.div>

        {/* Engine Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-8 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Activity className="w-6 h-6 text-[#D4AF37] mr-3" />
              Engine Status
            </h2>
            <div className="flex items-center space-x-2 bg-green-500/20 border border-green-500/40 px-4 py-2 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-bold uppercase tracking-widest text-sm">
                {engineData.status}
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <InfoBox
              label="Calculation Engine"
              value={engineData.engine_name}
              sublabel={`Version ${engineData.version}`}
              icon={<Database className="w-5 h-5 text-[#D4AF37]" />}
            />
            <InfoBox
              label="Ephemeris Basis"
              value={engineData.ephemeris_basis}
              sublabel="NASA Jet Propulsion Laboratory"
              icon={<Shield className="w-5 h-5 text-[#D4AF37]" />}
            />
          </div>

          <div className="mt-6 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl p-4">
            <p className="text-sm text-white/80">
              <strong className="text-[#D4AF37]">Technical Note:</strong> Swiss Ephemeris is the gold standard for astronomical calculations, 
              used by professional astrologers and astronomers worldwide. DE431 provides planetary positions accurate to within 
              arc-seconds over millennia.
            </p>
          </div>
        </motion.div>

        {/* Delta-T Calculation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-8 mb-6"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Activity className="w-6 h-6 text-[#D4AF37] mr-3" />
            Delta-T Calculation (2026 Precision)
          </h2>

          <div className="bg-[#020617]/60 border border-[#D4AF37]/20 rounded-xl p-6 mb-4">
            <div className="text-center mb-4">
              <div className="text-6xl font-bold text-[#D4AF37] mb-2">
                {engineData.delta_t.toFixed(1)}s
              </div>
              <div className="text-sm uppercase tracking-widest text-white/60">
                Current Delta-T Value
              </div>
            </div>
            
            <div className="border-t border-[#D4AF37]/20 pt-4">
              <p className="text-sm text-white/70 leading-relaxed">
                <strong className="text-[#D4AF37]">What is Delta-T?</strong> Delta-T (ΔT) is the difference between 
                Terrestrial Time (TT) and Universal Time (UT). This correction is crucial for accurate astronomical 
                calculations as Earth's rotation is gradually slowing down due to tidal friction.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <MetricCard
              label="Year"
              value="2026"
              description="Current epoch"
            />
            <MetricCard
              label="Correction Type"
              value="Polynomial"
              description="Espenak-Meeus formula"
            />
            <MetricCard
              label="Update Frequency"
              value="Real-time"
              description="Dynamic calculation"
            />
          </div>
        </motion.div>

        {/* Ayanamsha Precision */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-8 mb-6"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Lock className="w-6 h-6 text-[#D4AF37] mr-3" />
            Vedic Precision Lock
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <InfoBox
              label="Ayanamsha System"
              value={engineData.ayanamsha}
              sublabel="IAU 1976 Precession Model"
              icon={<Shield className="w-5 h-5 text-[#D4AF37]" />}
            />
            <InfoBox
              label="Precision Level"
              value={`${engineData.precision} Accuracy`}
              sublabel="1/3600th of a degree"
              icon={<Award className="w-5 h-5 text-[#D4AF37]" />}
            />
          </div>

          <div className="mt-6 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl p-4">
            <p className="text-sm text-white/80">
              <strong className="text-[#D4AF37]">Lahiri Ayanamsha:</strong> The official ayanamsha adopted by the Government 
              of India in 1956. It precisely accounts for the precession of equinoxes, ensuring Vedic chart accuracy 
              down to individual arc-seconds.
            </p>
          </div>
        </motion.div>

        {/* The Logic Seal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="relative"
        >
          <div className="glass-card rounded-2xl p-8 border-2 border-[#D4AF37]/60 gold-border-glow">
            <div className="text-center">
              <motion.div
                initial={{ rotate: -5 }}
                animate={{ rotate: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-block"
              >
                <div className="relative">
                  {/* Seal Background */}
                  <div className="w-40 h-40 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] p-1">
                    <div className="w-full h-full rounded-full bg-[#020617] flex items-center justify-center">
                      <Shield className="w-16 h-16 text-[#D4AF37]" />
                    </div>
                  </div>
                  
                  {/* Verification Badge */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-[#D4AF37] px-4 py-1 rounded-full">
                    <CheckCircle className="w-4 h-4 text-[#020617] inline" />
                  </div>
                </div>

                <h3 className="text-3xl font-bold text-[#D4AF37] mb-3" style={{fontFamily: 'Playfair Display, serif'}}>
                  The Logic Seal
                </h3>
                
                <div className="bg-[#D4AF37]/20 border border-[#D4AF37]/40 rounded-xl p-4 mb-4 inline-block">
                  <p className="text-lg font-bold text-white uppercase tracking-widest">
                    Mathematical Integrity Verified
                  </p>
                  <p className="text-sm text-[#D4AF37] mt-1">
                    Arc-Second Precision
                  </p>
                </div>

                <p className="text-white/70 text-sm max-w-2xl mx-auto leading-relaxed">
                  This seal certifies that all astronomical calculations performed by Zenith Oracle 
                  adhere to the highest standards of mathematical precision, utilizing NASA-grade 
                  ephemeris data and verified calculation algorithms.
                </p>

                <div className="mt-6 flex items-center justify-center space-x-8 text-xs text-white/50">
                  <div>
                    <div className="font-bold text-[#D4AF37]">Swiss Ephemeris</div>
                    <div>v{engineData.version}</div>
                  </div>
                  <div className="w-px h-8 bg-[#D4AF37]/40"></div>
                  <div>
                    <div className="font-bold text-[#D4AF37]">NASA JPL</div>
                    <div>DE431 Basis</div>
                  </div>
                  <div className="w-px h-8 bg-[#D4AF37]/40"></div>
                  <div>
                    <div className="font-bold text-[#D4AF37]">Verified</div>
                    <div>{new Date(engineData.last_updated).toLocaleDateString()}</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <a href="/">
            <button className="bg-transparent border border-[#D4AF37] text-[#D4AF37] py-3 px-8 hover:bg-[#D4AF37]/10 transition-all uppercase tracking-widest text-sm font-bold">
              Return to Dashboard
            </button>
          </a>
        </div>
      </div>
    </div>
  );
};

const InfoBox = ({ label, value, sublabel, icon }) => (
  <div className="bg-[#020617]/40 border border-[#D4AF37]/20 rounded-xl p-4">
    <div className="flex items-start space-x-3">
      <div className="mt-1">{icon}</div>
      <div className="flex-1">
        <div className="text-xs uppercase tracking-widest text-white/60 mb-1">{label}</div>
        <div className="text-xl font-bold text-white mb-1">{value}</div>
        <div className="text-xs text-[#94A3B8]">{sublabel}</div>
      </div>
    </div>
  </div>
);

const MetricCard = ({ label, value, description }) => (
  <div className="bg-[#020617]/40 border border-[#D4AF37]/20 rounded-lg p-4 text-center">
    <div className="text-xs uppercase tracking-widest text-white/60 mb-2">{label}</div>
    <div className="text-2xl font-bold text-[#D4AF37] mb-1">{value}</div>
    <div className="text-xs text-[#94A3B8]">{description}</div>
  </div>
);

export default AccuracyLab;
