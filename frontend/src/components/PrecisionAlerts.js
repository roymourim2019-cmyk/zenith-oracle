import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertCircle, Check, X, Settings } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PrecisionAlerts = ({ birthInfo }) => {
  const [alerts, setAlerts] = useState([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [precision, setPrecision] = useState(0.01); // 1% of arc-second
  const [monitoring, setMonitoring] = useState(false);

  useEffect(() => {
    checkNotificationPermission();
  }, []);

  useEffect(() => {
    if (monitoring && birthInfo) {
      const interval = setInterval(() => {
        checkMicroTransits();
      }, 60000); // Check every minute

      return () => clearInterval(interval);
    }
  }, [monitoring, birthInfo]);

  const checkNotificationPermission = async () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setNotificationsEnabled(true);
      }
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        new Notification('Zenith Oracle Alerts', {
          body: 'Precision micro-transit monitoring is now active',
          icon: '/logo.png',
          badge: '/logo.png'
        });
      }
    }
  };

  const checkMicroTransits = async () => {
    try {
      // Get current transits
      const today = new Date();
      const currentTransits = await axios.post(`${API}/vedic/birth-chart`, {
        name: 'Transit',
        birth_date: today.toISOString().split('T')[0],
        birth_time: today.toTimeString().split(' ')[0],
        latitude: birthInfo.latitude || 0,
        longitude: birthInfo.longitude || 0,
        timezone_offset: 0
      });

      // Get natal chart
      const natalChart = await axios.post(`${API}/vedic/birth-chart`, birthInfo);

      // Compare positions
      const newAlerts = [];
      currentTransits.data.planets.forEach(transitPlanet => {
        natalChart.data.planets.forEach(natalPlanet => {
          const difference = Math.abs(transitPlanet.longitude - natalPlanet.longitude);
          const arcSecondDiff = difference * 3600; // Convert to arc-seconds

          // Check if within precision threshold (0.01 arc-second)
          if (arcSecondDiff <= precision) {
            const alert = {
              id: Date.now() + Math.random(),
              transitPlanet: transitPlanet.name,
              natalPlanet: natalPlanet.name,
              difference: arcSecondDiff,
              timestamp: new Date().toISOString(),
              type: 'conjunction'
            };

            newAlerts.push(alert);

            // Send notification
            if (notificationsEnabled) {
              new Notification('Micro-Transit Alert! 🎯', {
                body: `${transitPlanet.name} is within ${arcSecondDiff.toFixed(4)}" of your natal ${natalPlanet.name}`,
                icon: '/logo.png',
                badge: '/logo.png',
                vibrate: [200, 100, 200]
              });
            }
          }
        });
      });

      if (newAlerts.length > 0) {
        setAlerts(prev => [...newAlerts, ...prev].slice(0, 50));
      }
    } catch (error) {
      console.error('Failed to check micro-transits:', error);
    }
  };

  const toggleMonitoring = () => {
    if (!notificationsEnabled) {
      requestNotificationPermission();
    }
    setMonitoring(!monitoring);
  };

  const dismissAlert = (id) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#020617] py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center" style={{fontFamily: 'Playfair Display, serif'}}>
            <Bell className="w-12 h-12 text-[#D4AF37] mr-4" />
            Precision <span className="text-[#D4AF37] ml-2">Alerts</span>
          </h1>
          <p className="text-[#94A3B8] text-lg">Micro-transit monitoring within 1% arc-second accuracy</p>
        </motion.div>

        {/* Control Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-8 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Alert System</h2>
              <p className="text-white/70 text-sm">Real-time monitoring of planetary positions</p>
            </div>
            <button
              onClick={toggleMonitoring}
              className={`px-6 py-3 font-bold uppercase tracking-widest text-sm transition-all ${
                monitoring
                  ? 'bg-green-500 text-white'
                  : 'bg-[#D4AF37] text-[#020617] hover:bg-[#F3E5AB]'
              }`}
              data-testid="toggle-monitoring-button"
            >
              {monitoring ? 'Active' : 'Start Monitoring'}
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Settings className="w-5 h-5 text-[#D4AF37]" />
                <span className="text-white font-bold">Precision Threshold</span>
              </div>
              <div className="text-3xl font-bold text-[#D4AF37] mb-1">{precision}"</div>
              <div className="text-xs text-white/60">Arc-second accuracy</div>
            </div>

            <div className="bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Bell className="w-5 h-5 text-[#D4AF37]" />
                <span className="text-white font-bold">Total Alerts</span>
              </div>
              <div className="text-3xl font-bold text-[#D4AF37] mb-1">{alerts.length}</div>
              <div className="text-xs text-white/60">Micro-transits detected</div>
            </div>
          </div>

          {!notificationsEnabled && (
            <div className="mt-6 bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 text-sm">
                Enable notifications to receive real-time alerts when micro-transits occur
              </span>
            </div>
          )}
        </motion.div>

        {/* Alerts List */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white">Recent Alerts</h3>
          <AnimatePresence>
            {alerts.length === 0 ? (
              <div className="glass-card rounded-xl p-8 text-center">
                <Bell className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">No micro-transits detected yet. Monitoring will check every minute.</p>
              </div>
            ) : (
              alerts.map(alert => (
                <AlertCard key={alert.id} alert={alert} onDismiss={dismissAlert} />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const AlertCard = ({ alert, onDismiss }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    className="glass-card rounded-xl p-6 flex items-start justify-between"
  >
    <div className="flex-1">
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-3 h-3 bg-[#D4AF37] rounded-full animate-pulse"></div>
        <span className="text-sm uppercase tracking-widest text-[#D4AF37] font-bold">
          {alert.type.toUpperCase()}
        </span>
      </div>
      <h4 className="text-lg font-bold text-white mb-2">
        {alert.transitPlanet} ↔ Natal {alert.natalPlanet}
      </h4>
      <div className="space-y-1 text-sm text-white/70">
        <p>Precision: <span className="text-[#D4AF37] font-bold">{alert.difference.toFixed(4)}"</span> arc-seconds</p>
        <p>Detected: {new Date(alert.timestamp).toLocaleString()}</p>
      </div>
    </div>
    <button
      onClick={() => onDismiss(alert.id)}
      className="text-white/60 hover:text-white transition-colors"
    >
      <X className="w-5 h-5" />
    </button>
  </motion.div>
);

export default PrecisionAlerts;