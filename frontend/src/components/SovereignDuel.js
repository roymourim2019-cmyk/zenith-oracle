import { useState } from 'react';
import { motion } from 'framer-motion';
import { Swords, Shield, Crown, Star, Play, RotateCcw } from 'lucide-react';
import axios from 'axios';
import { AdBanner, AdRewarded } from './AdComponents';
import { ShareButton } from './ShareCard';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MYTHIC_OPPONENTS = [
  { name: 'Augustus Caesar', birth_date: '1963-09-23', birth_time: '05:00:00', title: 'The Imperator', latitude: 41.9028, longitude: 12.4964 },
  { name: 'Cleopatra VII', birth_date: '1969-01-15', birth_time: '22:30:00', title: 'The Sovereign Queen', latitude: 31.2001, longitude: 29.9187 },
  { name: 'Sun Tzu', birth_date: '1975-03-12', birth_time: '03:15:00', title: 'The Strategist', latitude: 31.2304, longitude: 121.4737 },
  { name: 'Chanakya', birth_date: '1971-07-08', birth_time: '11:45:00', title: 'The Kingmaker', latitude: 25.3176, longitude: 82.9739 },
  { name: 'Miyamoto Musashi', birth_date: '1984-11-11', birth_time: '06:00:00', title: 'The Undefeated', latitude: 34.6937, longitude: 135.5023 },
];

const PLANET_WEIGHT = { Sun: 12, Moon: 10, Mars: 8, Jupiter: 15, Saturn: 10, Mercury: 6, Venus: 7 };
const DIGNITY = {
  Sun: { exalted: 'Aries', own: 'Leo', debilitated: 'Libra' },
  Moon: { exalted: 'Taurus', own: 'Cancer', debilitated: 'Scorpio' },
  Mars: { exalted: 'Capricorn', own: 'Aries', debilitated: 'Cancer' },
  Jupiter: { exalted: 'Cancer', own: 'Sagittarius', debilitated: 'Capricorn' },
  Saturn: { exalted: 'Libra', own: 'Aquarius', debilitated: 'Aries' },
  Mercury: { exalted: 'Virgo', own: 'Gemini', debilitated: 'Pisces' },
  Venus: { exalted: 'Pisces', own: 'Taurus', debilitated: 'Virgo' },
};

const scorePlanet = (planet) => {
  const base = PLANET_WEIGHT[planet.name] || 5;
  const dig = DIGNITY[planet.name];
  if (!dig) return base;
  if (planet.sign === dig.exalted) return base * 2;
  if (planet.sign === dig.own) return base * 1.5;
  if (planet.sign === dig.debilitated) return base * 0.5;
  if (!planet.retrograde) return base * 1.1;
  return base * 0.8;
};

const SovereignDuel = () => {
  const [phase, setPhase] = useState('setup');
  const [showCosmicReset, setShowCosmicReset] = useState(false);
  const [form, setForm] = useState({ name: '', birth_date: '', birth_time: '', latitude: 28.6139, longitude: 77.209, timezone_offset: 5.5 });
  const [opponent, setOpponent] = useState(null);
  const [playerChart, setPlayerChart] = useState(null);
  const [opponentChart, setOpponentChart] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [loading, setLoading] = useState(false);

  const startDuel = async () => {
    if (!form.name || !form.birth_date || !form.birth_time) return;
    setLoading(true);
    const opp = MYTHIC_OPPONENTS[Math.floor(Math.random() * MYTHIC_OPPONENTS.length)];
    setOpponent(opp);

    try {
      const [pRes, oRes] = await Promise.all([
        axios.post(`${API}/vedic/birth-chart`, form),
        axios.post(`${API}/vedic/birth-chart`, { name: opp.name, birth_date: opp.birth_date, birth_time: opp.birth_time, latitude: opp.latitude, longitude: opp.longitude, timezone_offset: 5.5 }),
      ]);

      setPlayerChart(pRes.data);
      setOpponentChart(oRes.data);

      const planetNames = ['Sun', 'Moon', 'Mars', 'Jupiter', 'Saturn', 'Mercury', 'Venus'];
      const roundData = planetNames.map(name => {
        const pp = pRes.data.planets.find(p => p.name === name);
        const op = oRes.data.planets.find(p => p.name === name);
        const ps = pp ? Math.round(scorePlanet(pp)) : 0;
        const os = op ? Math.round(scorePlanet(op)) : 0;
        return { planet: name, player: { ...pp, score: ps }, opponent: { ...op, score: os }, winner: ps > os ? 'player' : ps < os ? 'opponent' : 'tie' };
      });

      setRounds(roundData);
      setCurrentRound(0);
      setPlayerScore(0);
      setOppScore(0);
      setPhase('battle');
    } catch (err) {
      console.error('Duel fetch error:', err);
    }
    setLoading(false);
  };

  const revealRound = () => {
    if (currentRound >= rounds.length) return;
    const r = rounds[currentRound];
    if (r.winner === 'player') setPlayerScore(s => s + r.player.score);
    else if (r.winner === 'opponent') setOppScore(s => s + r.opponent.score);
    if (currentRound + 1 >= rounds.length) {
      setTimeout(() => setPhase('result'), 600);
    }
    setCurrentRound(c => c + 1);
  };

  const reset = () => {
    setPhase('setup');
    setRounds([]);
    setCurrentRound(0);
    setPlayerScore(0);
    setOppScore(0);
  };

  return (
    <div className="min-h-screen bg-[#020617] py-12" data-testid="sovereign-duel">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center" style={{ fontFamily: 'Playfair Display, serif' }}>
            <Crown className="w-12 h-12 text-[#D4AF37] mr-4" />
            Sovereign <span className="text-[#D4AF37] ml-2">Duel</span>
          </h1>
          <p className="text-[#94A3B8] text-lg">Chart vs. Chart | Planet-by-Planet Dominance Clash</p>
        </motion.div>

        {phase === 'setup' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-8">
            <div className="text-center mb-8">
              <Swords className="w-20 h-20 text-[#D4AF37] mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-4">Challenge the Legends</h2>
              <p className="text-white/70">Your birth chart faces a mythic opponent. Seven planets clash for supremacy.</p>
            </div>
            <div className="space-y-4 max-w-md mx-auto">
              <input type="text" placeholder="Your Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:border-[#D4AF37] focus:outline-none" data-testid="duel-name-input" />
              <div className="grid grid-cols-2 gap-4">
                <input type="date" value={form.birth_date} onChange={e => setForm({ ...form, birth_date: e.target.value })} className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none" data-testid="duel-date-input" />
                <input type="time" step="1" value={form.birth_time} onChange={e => setForm({ ...form, birth_time: e.target.value })} className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none" data-testid="duel-time-input" />
              </div>
              <button onClick={startDuel} disabled={loading || !form.name || !form.birth_date || !form.birth_time} className="w-full bg-[#D4AF37] text-[#020617] font-bold py-4 hover:bg-[#F3E5AB] transition-all uppercase tracking-widest disabled:opacity-50 gold-pulse" data-testid="start-duel-button">
                <Play className="w-5 h-5 inline mr-2" />
                {loading ? 'Summoning Opponent...' : 'Begin Duel'}
              </button>
            </div>
          </motion.div>
        )}

        {phase === 'battle' && opponent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex justify-between items-center">
                <div className="text-center flex-1">
                  <div className="text-xs uppercase tracking-widest text-[#D4AF37] mb-1">You</div>
                  <div className="text-xl font-bold text-white">{form.name}</div>
                  <div className="text-3xl font-bold text-[#D4AF37] mt-1">{playerScore}</div>
                </div>
                <div className="text-center px-6">
                  <Swords className="w-10 h-10 text-[#D4AF37]/60 mx-auto" />
                  <div className="text-xs text-white/40 mt-1">Round {Math.min(currentRound + 1, 7)}/7</div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-xs uppercase tracking-widest text-white/60 mb-1">{opponent.title}</div>
                  <div className="text-xl font-bold text-white">{opponent.name}</div>
                  <div className="text-3xl font-bold text-white/70 mt-1">{oppScore}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {rounds.slice(0, currentRound).map((r, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={`glass-card rounded-xl p-4 flex items-center justify-between ${r.winner === 'player' ? 'border-[#D4AF37]/50' : 'border-white/10'}`}>
                  <div className="flex items-center space-x-3 flex-1">
                    <span className={`text-sm font-bold ${r.winner === 'player' ? 'text-[#D4AF37]' : 'text-white/50'}`}>{r.player.sign} {r.player.degree_in_sign?.toFixed(1)}</span>
                    <span className={`text-lg font-bold ${r.winner === 'player' ? 'text-[#D4AF37]' : 'text-white/40'}`}>{r.player.score}</span>
                  </div>
                  <div className="text-center px-4">
                    <span className="text-white font-semibold text-sm">{r.planet}</span>
                  </div>
                  <div className="flex items-center justify-end space-x-3 flex-1">
                    <span className={`text-lg font-bold ${r.winner === 'opponent' ? 'text-white' : 'text-white/40'}`}>{r.opponent.score}</span>
                    <span className={`text-sm font-bold ${r.winner === 'opponent' ? 'text-white' : 'text-white/50'}`}>{r.opponent.sign} {r.opponent.degree_in_sign?.toFixed(1)}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {currentRound < rounds.length && (
              <button onClick={revealRound} className="w-full bg-[#D4AF37] text-[#020617] font-bold py-4 hover:bg-[#F3E5AB] transition-all uppercase tracking-widest" data-testid="reveal-round-button">
                <Shield className="w-5 h-5 inline mr-2" />
                Reveal {rounds[currentRound]?.planet} Clash
              </button>
            )}
          </motion.div>
        )}

        {phase === 'result' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-8 text-center">
            {playerScore > oppScore ? (
              <>
                <Crown className="w-24 h-24 text-[#D4AF37] mx-auto mb-4" />
                <h2 className="text-4xl font-bold text-[#D4AF37] mb-2">Sovereign Victory</h2>
                <p className="text-white/70 mb-6">Your celestial dominion is absolute. The stars bow to your chart.</p>
              </>
            ) : playerScore < oppScore ? (
              <>
                <Shield className="w-24 h-24 text-white/40 mx-auto mb-4" />
                <h2 className="text-4xl font-bold text-white/70 mb-2">Defeated</h2>
                <p className="text-white/70 mb-6">The legends prevail this day. Study the cosmos and return.</p>
              </>
            ) : (
              <>
                <Star className="w-24 h-24 text-[#D4AF37] mx-auto mb-4" />
                <h2 className="text-4xl font-bold text-white mb-2">Celestial Stalemate</h2>
                <p className="text-white/70 mb-6">Equal forces. The universe demands a rematch.</p>
              </>
            )}
            <div className="grid grid-cols-2 gap-6 mb-8 max-w-sm mx-auto">
              <div className="bg-[#020617]/60 border border-[#D4AF37]/40 rounded-lg p-4">
                <div className="text-sm text-white/60 mb-1">Your Total</div>
                <div className="text-3xl font-bold text-[#D4AF37]">{playerScore}</div>
              </div>
              <div className="bg-[#020617]/60 border border-white/20 rounded-lg p-4">
                <div className="text-sm text-white/60 mb-1">{opponent?.name}</div>
                <div className="text-3xl font-bold text-white/70">{oppScore}</div>
              </div>
            </div>
            <AdBanner slot="sovereign-duel-result" className="mb-4" />
            <div className="space-y-3">
              {playerScore < oppScore && (
                <button onClick={() => setShowCosmicReset(true)} className="w-full bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#020617] font-bold py-4 rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] transition-all uppercase tracking-widest text-sm" data-testid="cosmic-reset-btn">Cosmic Reset — Watch & Retry</button>
              )}
              <div className="flex gap-3">
                <ShareButton title="Sovereign Duel" text={`I ${playerScore > oppScore ? 'conquered' : 'battled'} ${opponent?.name} (${playerScore}-${oppScore}) in Sovereign Duel on Zenith Oracle!`} />
                <button onClick={reset} className="flex-1 bg-transparent border border-[#D4AF37] text-[#D4AF37] font-bold py-3 rounded-xl hover:bg-[#D4AF37]/10 transition-all uppercase tracking-widest text-sm" data-testid="duel-again-button">
                  <RotateCcw className="w-4 h-4 inline mr-2" />
                  Challenge Again
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      <AdRewarded show={showCosmicReset} onReward={() => { setShowCosmicReset(false); reset(); }} onClose={() => setShowCosmicReset(false)} />
    </div>
  );
};

export default SovereignDuel;
