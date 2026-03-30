import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, Moon, Zap, Globe, AlertTriangle, 
  ChevronRight, Activity, Waves, Clock
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const OracleFeed = ({ birthInfo }) => {
  const [feed, setFeed] = useState(null);
  const [pakshi, setPakshi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('transits');
  const tickerRef = useRef(null);

  useEffect(() => {
    fetchOracleFeed();
    const interval = setInterval(fetchOracleFeed, 900000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (birthInfo && birthInfo.name && birthInfo.birth_date && birthInfo.birth_time) {
      fetchPanchaPakshi();
    }
  }, [birthInfo]);

  const fetchOracleFeed = async () => {
    try {
      const res = await axios.get(`${API}/oracle-feed`);
      setFeed(res.data);
    } catch (err) {
      console.error('Oracle Feed error:', err);
    }
    setLoading(false);
  };

  const fetchPanchaPakshi = async () => {
    try {
      const res = await axios.post(`${API}/vedic/pancha-pakshi`, birthInfo);
      setPakshi(res.data);
    } catch (err) {
      console.error('Pancha-Pakshi error:', err);
    }
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 border-[#D4AF37]/30" data-testid="oracle-feed-loading">
        <div className="flex items-center space-x-3 mb-4">
          <Eye className="w-5 h-5 text-[#D4AF37] liquid-gold-animation" />
          <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]">Cosmic Intelligence</span>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-[#D4AF37]/5 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!feed) return null;

  const tabs = [
    { id: 'transits', label: 'Transit Alerts', icon: <Zap className="w-3.5 h-3.5" /> },
    { id: 'psychic', label: 'Collective Energy', icon: <Waves className="w-3.5 h-3.5" /> },
    { id: 'parallels', label: 'Historical', icon: <Clock className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-4" data-testid="oracle-feed">
      {/* Header */}
      <div className="glass-card rounded-2xl p-5 border-[#D4AF37]/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#D4AF37]/20 rounded-lg flex items-center justify-center">
              <Eye className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="text-sm uppercase tracking-[0.3em] text-[#D4AF37] font-semibold">Cosmic Intelligence</h3>
              <p className="text-[10px] text-white/40 tracking-wider">THE TIDES OF TIME</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse" />
            <span className="text-[10px] text-[#D4AF37]/70 uppercase tracking-widest">Live</span>
          </div>
        </div>

        {/* Transit Ticker */}
        <div className="overflow-hidden relative" ref={tickerRef}>
          <div className="ticker-scroll flex space-x-8 text-xs text-white/60 whitespace-nowrap py-1">
            {feed.current_transits && Object.entries(feed.current_transits).map(([name, data]) => (
              <span key={name} className="inline-flex items-center space-x-1.5">
                <span className="text-[#D4AF37] font-semibold">{name}</span>
                <span>{data.sign} {data.degree.toFixed(1)}</span>
                <span className="text-white/30">|</span>
                <span className="text-white/40">{data.nakshatra} P{data.pada}</span>
                {data.retrograde && <span className="text-red-400/80 text-[10px]">(R)</span>}
              </span>
            ))}
            {/* Duplicate for seamless loop */}
            {feed.current_transits && Object.entries(feed.current_transits).map(([name, data]) => (
              <span key={`dup-${name}`} className="inline-flex items-center space-x-1.5">
                <span className="text-[#D4AF37] font-semibold">{name}</span>
                <span>{data.sign} {data.degree.toFixed(1)}</span>
                <span className="text-white/30">|</span>
                <span className="text-white/40">{data.nakshatra} P{data.pada}</span>
                {data.retrograde && <span className="text-red-400/80 text-[10px]">(R)</span>}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Pancha-Pakshi Card */}
      {pakshi && (
        <PanchaPakshiCard data={pakshi} />
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-[#020617]/60 rounded-xl p-1 border border-[#D4AF37]/10">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30'
                : 'text-white/40 hover:text-white/60'
            }`}
            data-testid={`oracle-tab-${tab.id}`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'transits' && (
          <motion.div
            key="transits"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3"
          >
            {feed.transit_alerts.map((alert, idx) => (
              <TransitAlertCard key={idx} alert={alert} index={idx} />
            ))}
          </motion.div>
        )}

        {activeTab === 'psychic' && (
          <motion.div
            key="psychic"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <PsychicUpdateCard update={feed.psychic_update} />
          </motion.div>
        )}

        {activeTab === 'parallels' && (
          <motion.div
            key="parallels"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3"
          >
            {feed.historical_parallels.map((parallel, idx) => (
              <HistoricalCard key={idx} parallel={parallel} index={idx} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PanchaPakshiCard = ({ data }) => {
  const pp = data.pancha_pakshi;
  const pada = data.nakshatra_pada;
  
  const stateColors = {
    'Ruling': '#D4AF37',
    'Eating': '#7DD87D',
    'Walking': '#87CEEB',
    'Sleeping': '#94A3B8',
    'Dying': '#EF4444',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-5 border-[#D4AF37]/30"
      data-testid="pancha-pakshi-card"
    >
      <div className="flex items-center space-x-2 mb-4">
        <Activity className="w-4 h-4 text-[#D4AF37]" />
        <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-semibold">Pancha-Pakshi Oracle</span>
      </div>

      <div className="flex items-start space-x-4 mb-4">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{
            backgroundColor: `${stateColors[pp.current_state]}15`,
            border: `1px solid ${stateColors[pp.current_state]}40`,
          }}
        >
          {pp.birth_bird === 'Vulture' && <Globe className="w-7 h-7" style={{ color: stateColors[pp.current_state] }} />}
          {pp.birth_bird === 'Owl' && <Moon className="w-7 h-7" style={{ color: stateColors[pp.current_state] }} />}
          {pp.birth_bird === 'Crow' && <Zap className="w-7 h-7" style={{ color: stateColors[pp.current_state] }} />}
          {pp.birth_bird === 'Cock' && <Activity className="w-7 h-7" style={{ color: stateColors[pp.current_state] }} />}
          {pp.birth_bird === 'Peacock' && <Eye className="w-7 h-7" style={{ color: stateColors[pp.current_state] }} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-white font-bold">{pp.birth_bird}</span>
            <span className="text-white/30 text-xs">({pp.birth_bird_sanskrit})</span>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded"
              style={{
                color: stateColors[pp.current_state],
                backgroundColor: `${stateColors[pp.current_state]}15`,
              }}
            >
              {pp.current_state}
            </span>
            <span className="text-white/40 text-xs">{pp.period_label}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-2xl font-bold" style={{ color: stateColors[pp.current_state] }}>
            {pp.power_level}%
          </div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider">Power</div>
        </div>
      </div>

      {/* Power Bar */}
      <div className="w-full h-1.5 bg-[#020617]/60 rounded-full overflow-hidden mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pp.power_level}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: stateColors[pp.current_state] }}
        />
      </div>

      {/* Nakshatra Pada */}
      {pada && (
        <div className="flex items-center space-x-4 mb-3 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="text-white/40">Nakshatra:</span>
            <span className="text-white font-medium">{pada.nakshatra}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-white/40">Pada:</span>
            <span className="text-[#D4AF37] font-bold">{pada.pada}/4</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-white/40">Lord:</span>
            <span className="text-white font-medium">{pada.pada_lord}</span>
          </div>
        </div>
      )}

      {/* Guidance */}
      <p className="text-xs text-white/60 leading-relaxed italic">
        {pp.strategic_guidance}
      </p>

      {/* All Birds Status */}
      <div className="mt-3 pt-3 border-t border-[#D4AF37]/10">
        <div className="flex justify-between">
          {Object.entries(pp.all_birds).map(([bird, state]) => (
            <div key={bird} className="text-center">
              <div
                className="w-2 h-2 rounded-full mx-auto mb-1"
                style={{ backgroundColor: stateColors[state] }}
              />
              <div className="text-[9px] text-white/40 uppercase">{bird.slice(0, 3)}</div>
              <div className="text-[9px] font-medium" style={{ color: stateColors[state] }}>
                {state.slice(0, 4)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const TransitAlertCard = ({ alert, index }) => {
  const severityColors = {
    high: { border: 'border-[#D4AF37]/40', bg: 'bg-[#D4AF37]/5', icon: '#D4AF37' },
    medium: { border: 'border-[#D4AF37]/20', bg: 'bg-[#020617]/40', icon: '#D4AF37' },
    low: { border: 'border-[#D4AF37]/10', bg: 'bg-[#020617]/40', icon: '#94A3B8' },
  };
  const colors = severityColors[alert.severity] || severityColors.low;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`glass-card rounded-xl p-4 ${colors.border} ${colors.bg}`}
      data-testid={`transit-alert-${index}`}
    >
      <div className="flex items-start space-x-3">
        <div className="mt-0.5 flex-shrink-0">
          {alert.type === 'retrograde' && <AlertTriangle className="w-4 h-4" style={{ color: colors.icon }} />}
          {alert.type === 'aspect' && <Zap className="w-4 h-4" style={{ color: colors.icon }} />}
          {alert.type === 'lunar' && <Moon className="w-4 h-4" style={{ color: colors.icon }} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="text-sm font-semibold text-white truncate">{alert.title}</h4>
            {alert.severity === 'high' && (
              <span className="text-[9px] bg-[#D4AF37]/20 text-[#D4AF37] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold flex-shrink-0">
                Critical
              </span>
            )}
          </div>
          <p className="text-xs text-white/50 leading-relaxed">{alert.message}</p>
        </div>
      </div>
    </motion.div>
  );
};

const PsychicUpdateCard = ({ update }) => {
  const rating = update.collective_energy_rating;
  const segments = 20;
  const filled = Math.round((rating / 100) * segments);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-2xl p-6 border-[#D4AF37]/30"
      data-testid="psychic-update"
    >
      <div className="text-center mb-6">
        <Waves className="w-10 h-10 text-[#D4AF37] mx-auto mb-3 liquid-gold-animation" />
        <h3 className="text-lg font-bold text-white mb-1">Collective Energy Field</h3>
        <p className="text-xs text-white/40 uppercase tracking-[0.3em]">{update.moon_phase} | Tithi {update.tithi}</p>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-xs text-white/40 mb-2">
          <span>Void</span>
          <span className="text-[#D4AF37] font-bold">{update.quality}</span>
          <span>Peak</span>
        </div>
        <div className="flex space-x-0.5">
          {Array.from({ length: segments }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-3 rounded-sm transition-all duration-500"
              style={{
                backgroundColor: i < filled
                  ? `rgba(212, 175, 55, ${0.3 + (i / segments) * 0.7})`
                  : 'rgba(212, 175, 55, 0.05)',
              }}
            />
          ))}
        </div>
        <div className="text-center mt-2">
          <span className="text-3xl font-bold text-[#D4AF37]">{rating}</span>
          <span className="text-sm text-white/40">/100</span>
        </div>
      </div>

      <div className="bg-[#020617]/40 rounded-xl p-4 border border-[#D4AF37]/10">
        <p className="text-sm text-white/70 leading-relaxed italic text-center">
          {update.guidance}
        </p>
      </div>
    </motion.div>
  );
};

const HistoricalCard = ({ parallel, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    className="glass-card rounded-xl p-4 border-[#D4AF37]/20"
    data-testid={`historical-parallel-${index}`}
  >
    <div className="flex items-start space-x-3">
      <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
        <Globe className="w-5 h-5 text-[#D4AF37]" />
      </div>
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1.5">
          <span className="text-sm font-semibold text-white">{parallel.planet}</span>
          <span className="text-xs text-[#D4AF37]">in {parallel.sign} at {parallel.degree}</span>
        </div>
        <p className="text-xs text-white/50 leading-relaxed italic">{parallel.parallel}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-[#D4AF37]/30 flex-shrink-0 mt-1" />
    </div>
  </motion.div>
);

export default OracleFeed;
