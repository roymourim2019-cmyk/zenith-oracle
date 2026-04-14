import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Trophy, TrendingUp, Clock, Play, Award } from 'lucide-react';
import axios from 'axios';
import { AdBanner, AdRewarded } from './AdComponents';
import { ShareButton } from './ShareCard';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MarketSiege = () => {
  const [gameState, setGameState] = useState('intro');
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [playerName, setPlayerName] = useState('');
  const [playerDate, setPlayerDate] = useState('');
  const [opponentName, setOpponentName] = useState('');
  const [opponentDate, setOpponentDate] = useState('');
  const [result, setResult] = useState(null);
  const [showAd, setShowAd] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const [showCosmicReset, setShowCosmicReset] = useState(false);

  const opponents = [
    { name: 'Alexander Magnus', date: '1985-07-23' },
    { name: 'Victoria Sterling', date: '1992-03-15' },
    { name: 'Marcus Aurelius', date: '1988-11-08' },
    { name: 'Diana Athena', date: '1990-05-20' },
    { name: 'Zeus Olympus', date: '1987-09-12' }
  ];

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'playing' && timeLeft === 0) {
      handleTimeUp();
    }
  }, [gameState, timeLeft]);

  useEffect(() => {
    if (showAd && adCountdown > 0) {
      const timer = setTimeout(() => setAdCountdown(adCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showAd && adCountdown === 0) {
      setShowAd(false);
      revealResult();
    }
  }, [showAd, adCountdown]);

  const startGame = () => {
    if (!playerName || !playerDate) return;
    const opponent = opponents[Math.floor(Math.random() * opponents.length)];
    setOpponentName(opponent.name);
    setOpponentDate(opponent.date);
    setGameState('playing');
    setTimeLeft(60);
    setCurrentRound(1);
    setScore(0);
  };

  const handleTimeUp = () => {
    setShowAd(true);
    setAdCountdown(5);
  };

  const revealResult = async () => {
    try {
      const playerResult = await axios.post(`${API}/numerology/calculate`, {
        name: playerName,
        birth_date: playerDate,
        birth_time: '12:00:00',
        latitude: 0,
        longitude: 0
      });

      const opponentResult = await axios.post(`${API}/numerology/calculate`, {
        name: opponentName,
        birth_date: opponentDate,
        birth_time: '12:00:00',
        latitude: 0,
        longitude: 0
      });

      const playerPower = playerResult.data.chaldean_number + playerResult.data.pythagorean_number;
      const opponentPower = opponentResult.data.chaldean_number + opponentResult.data.pythagorean_number;

      const winner = playerPower >= opponentPower ? 'player' : 'opponent';
      const points = Math.abs(playerPower - opponentPower) * 100;

      setResult({
        winner,
        playerPower,
        opponentPower,
        points,
        playerData: playerResult.data,
        opponentData: opponentResult.data
      });

      if (winner === 'player') {
        setScore(score + points);
      }

      setGameState('result');
    } catch (error) {
      console.error('Failed to calculate numerology:', error);
    }
  };

  const playAgain = () => {
    setGameState('intro');
    setResult(null);
    setTimeLeft(60);
    setAdCountdown(5);
  };

  return (
    <div className="min-h-screen bg-[#020617] py-12" data-testid="market-siege">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center" style={{fontFamily: 'Playfair Display, serif'}}>
            <Zap className="w-12 h-12 text-[#D4AF37] mr-4" />
            Market <span className="text-[#D4AF37] ml-2">Siege</span>
          </h1>
          <p className="text-[#94A3B8] text-lg">60-Second Numerology Battle | Test Your Name Vibrations</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {gameState === 'intro' && (
            <IntroScreen
              playerName={playerName}
              setPlayerName={setPlayerName}
              playerDate={playerDate}
              setPlayerDate={setPlayerDate}
              startGame={startGame}
              score={score}
            />
          )}

          {gameState === 'playing' && (
            <PlayingScreen
              timeLeft={timeLeft}
              playerName={playerName}
              opponentName={opponentName}
            />
          )}

          {showAd && (
            <AdScreen countdown={adCountdown} />
          )}

          {gameState === 'result' && result && (
            <ResultScreen
              result={result}
              playerName={playerName}
              opponentName={opponentName}
              playAgain={playAgain}
              showCosmicReset={showCosmicReset}
              setShowCosmicReset={setShowCosmicReset}
            />
          )}
        </AnimatePresence>
      </div>
      <AdRewarded show={showCosmicReset} onReward={() => { setShowCosmicReset(false); startGame(); }} onClose={() => setShowCosmicReset(false)} />
    </div>
  );
};

const IntroScreen = ({ playerName, setPlayerName, playerDate, setPlayerDate, startGame, score }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="glass-card rounded-2xl p-8"
  >
    <div className="text-center mb-8">
      <Trophy className="w-20 h-20 text-[#D4AF37] mx-auto mb-4" />
      <h2 className="text-3xl font-bold text-white mb-4" style={{fontFamily: 'Playfair Display, serif'}}>Prove Your Dominance</h2>
      <p className="text-white/70">Use the power of Numerology to defeat legendary opponents in 60 seconds</p>
      {score > 0 && (
        <div className="mt-4 bg-[#D4AF37]/20 border border-[#D4AF37] rounded-lg px-6 py-3 inline-block">
          <p className="text-[#D4AF37] font-bold text-xl">Total Score: {score}</p>
        </div>
      )}
    </div>

    <div className="space-y-6 max-w-md mx-auto">
      <div>
        <label className="text-sm uppercase tracking-widest text-[#D4AF37] block mb-2">Your Name</label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your full name"
          className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:border-[#D4AF37] focus:outline-none"
          data-testid="player-name-input"
        />
      </div>

      <div>
        <label className="text-sm uppercase tracking-widest text-[#D4AF37] block mb-2">Birth Date</label>
        <input
          type="date"
          value={playerDate}
          onChange={(e) => setPlayerDate(e.target.value)}
          className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none"
          data-testid="player-date-input"
        />
      </div>

      <button
        onClick={startGame}
        disabled={!playerName || !playerDate}
        className="w-full bg-[#D4AF37] text-[#020617] font-bold py-4 hover:bg-[#F3E5AB] hover:shadow-[0_0_15px_rgba(212,175,55,0.6)] transition-all duration-300 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed gold-pulse"
        data-testid="start-game-button"
      >
        <Play className="w-5 h-5 inline mr-2" />
        Enter Battle
      </button>
    </div>
  </motion.div>
);

const PlayingScreen = ({ timeLeft, playerName, opponentName }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="glass-card rounded-2xl p-8"
  >
    <div className="text-center mb-8">
      <div className="inline-block bg-[#D4AF37]/20 border-2 border-[#D4AF37] rounded-full px-8 py-4 mb-6">
        <div className="flex items-center space-x-3">
          <Clock className="w-8 h-8 text-[#D4AF37]" />
          <span className="text-5xl font-bold text-[#D4AF37]">{timeLeft}</span>
        </div>
      </div>
      <p className="text-white/60 text-sm uppercase tracking-widest">Seconds Remaining</p>
    </div>

    <div className="grid md:grid-cols-2 gap-8">
      <BattleCard name={playerName} label="You" color="#D4AF37" />
      <BattleCard name={opponentName} label="Opponent" color="#DC2626" />
    </div>

    <div className="mt-8 text-center">
      <p className="text-white/70 text-sm">Calculating Name Vibrations & Cosmic Frequencies...</p>
    </div>
  </motion.div>
);

const BattleCard = ({ name, label, color }) => (
  <div className="bg-[#020617]/60 border-2 rounded-xl p-6 text-center" style={{ borderColor: color }}>
    <div className="text-xs uppercase tracking-widest mb-2" style={{ color }}>{label}</div>
    <div className="text-2xl font-bold text-white mb-4">{name}</div>
    <div className="flex justify-center space-x-2">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: color }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
        />
      ))}
    </div>
  </div>
);

const AdScreen = ({ countdown }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="glass-card rounded-2xl p-12 text-center border-2 border-[#D4AF37]"
  >
    <div className="mb-6">
      <div className="w-32 h-32 mx-auto bg-[#020617] border-2 border-[#D4AF37] rounded-full flex items-center justify-center mb-6">
        <TrendingUp className="w-16 h-16 text-[#D4AF37]" />
      </div>
    </div>
    <h3 className="text-3xl font-bold text-white mb-4" style={{fontFamily: 'Playfair Display, serif'}}>Transmission Incoming</h3>
    <p className="text-white/70 mb-6">Watch this strategic intelligence to unlock your results</p>
    <div className="text-6xl font-bold text-[#D4AF37] mb-2">{countdown}</div>
    <p className="text-sm text-white/60 uppercase tracking-widest">Revealing in {countdown}s</p>
  </motion.div>
);

const ResultScreen = ({ result, playerName, opponentName, playAgain, showCosmicReset, setShowCosmicReset }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card rounded-2xl p-8"
  >
    <div className="text-center mb-8">
      {result.winner === 'player' ? (
        <>
          <Trophy className="w-24 h-24 text-[#D4AF37] mx-auto mb-4" />
          <h2 className="text-4xl font-bold text-[#D4AF37] mb-2" style={{fontFamily: 'Playfair Display, serif'}}>Victory!</h2>
          <p className="text-white/70">Your name vibrations dominated the battlefield</p>
        </>
      ) : (
        <>
          <Award className="w-24 h-24 text-white/40 mx-auto mb-4" />
          <h2 className="text-4xl font-bold text-white/70 mb-2" style={{fontFamily: 'Playfair Display, serif'}}>Defeated</h2>
          <p className="text-white/70">Study your numbers and return stronger</p>
        </>
      )}
    </div>

    <div className="grid md:grid-cols-2 gap-6 mb-8">
      <ResultCard
        name={playerName}
        power={result.playerPower}
        data={result.playerData}
        isWinner={result.winner === 'player'}
      />
      <ResultCard
        name={opponentName}
        power={result.opponentPower}
        data={result.opponentData}
        isWinner={result.winner === 'opponent'}
      />
    </div>

    {result.winner === 'player' && (
      <div className="bg-[#D4AF37]/20 border border-[#D4AF37] rounded-xl p-6 mb-6 text-center">
        <p className="text-[#D4AF37] font-bold text-2xl mb-2">+{result.points} Points</p>
        <p className="text-white/70 text-sm">Added to your total score</p>
      </div>
    )}

    <AdBanner slot="market-siege-result" className="mb-4" />

    <div className="space-y-3">
      {result.winner === 'opponent' && (
        <button
          onClick={() => setShowCosmicReset(true)}
          className="w-full bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#020617] font-bold py-4 rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] transition-all uppercase tracking-widest text-sm"
          data-testid="cosmic-reset-btn"
        >
          Cosmic Reset — Watch & Retry
        </button>
      )}
      <div className="flex gap-3">
        <ShareButton title="Market Siege" text={`I scored ${result.winner === 'player' ? result.points + ' points in' : 'a fierce battle at'} Market Siege on Zenith Oracle!`} />
        <button
          onClick={playAgain}
          className="flex-1 bg-transparent border border-[#D4AF37] text-[#D4AF37] font-bold py-3 rounded-xl hover:bg-[#D4AF37]/10 transition-all uppercase tracking-widest text-sm"
          data-testid="play-again-button"
        >
          Battle Again
        </button>
      </div>
    </div>
  </motion.div>
);

const ResultCard = ({ name, power, data, isWinner }) => (
  <div className={`bg-[#020617]/60 border-2 rounded-xl p-6 ${isWinner ? 'border-[#D4AF37]' : 'border-white/20'}`}>
    <div className="text-center mb-4">
      <div className="text-sm uppercase tracking-widest text-white/60 mb-2">{name}</div>
      <div className={`text-5xl font-bold mb-2 ${isWinner ? 'text-[#D4AF37]' : 'text-white/70'}`}>{power}</div>
      <div className="text-xs uppercase tracking-widest text-white/60">Total Power</div>
    </div>
    <div className="space-y-2 text-sm">
      <div className="flex justify-between text-white/70">
        <span>Chaldean:</span>
        <span className="text-[#D4AF37]">{data.chaldean_number}</span>
      </div>
      <div className="flex justify-between text-white/70">
        <span>Pythagorean:</span>
        <span className="text-[#D4AF37]">{data.pythagorean_number}</span>
      </div>
      <div className="flex justify-between text-white/70">
        <span>Vedic:</span>
        <span className="text-[#D4AF37]">{data.vedic_number}</span>
      </div>
    </div>
  </div>
);

export default MarketSiege;