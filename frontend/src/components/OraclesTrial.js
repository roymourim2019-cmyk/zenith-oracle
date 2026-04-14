import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, Eye, Coins, Award, Play } from 'lucide-react';
import axios from 'axios';
import { AdBanner, AdRewarded } from './AdComponents';
import { ShareButton } from './ShareCard';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const OraclesTrial = () => {
  const [gameState, setGameState] = useState('intro');
  const [goldDust, setGoldDust] = useState(0);
  const [currentCard, setCurrentCard] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [round, setRound] = useState(1);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showAd, setShowAd] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const [showCosmicReset, setShowCosmicReset] = useState(false);

  const totalRounds = 5;

  useEffect(() => {
    if (showAd && adCountdown > 0) {
      const timer = setTimeout(() => setAdCountdown(adCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showAd && adCountdown === 0) {
      setShowAd(false);
      revealResult();
    }
  }, [showAd, adCountdown]);

  const startGame = async () => {
    setGameState('playing');
    setRound(1);
    setCorrectAnswers(0);
    await loadNextCard();
  };

  const loadNextCard = async () => {
    try {
      const response = await axios.post(`${API}/tarot/reading`, null, {
        params: { question: 'Oracle Trial', num_cards: 1 }
      });

      const card = response.data.cards[0];
      setCurrentCard(card);

      const correctMeaning = card.upright_meaning;
      const wrongMeanings = [
        'Deception, illusion, and false promises await',
        'Stagnation and resistance to necessary change',
        'Loss of control and chaotic transformation',
        'Betrayal from those you trust most'
      ];

      const shuffledOptions = [
        { text: correctMeaning, correct: true },
        { text: wrongMeanings[Math.floor(Math.random() * wrongMeanings.length)], correct: false },
        { text: wrongMeanings[Math.floor(Math.random() * wrongMeanings.length)], correct: false },
        { text: wrongMeanings[Math.floor(Math.random() * wrongMeanings.length)], correct: false }
      ].sort(() => Math.random() - 0.5);

      setOptions(shuffledOptions);
      setSelectedOption(null);
    } catch (error) {
      console.error('Failed to load card:', error);
    }
  };

  const selectOption = (index) => {
    setSelectedOption(index);
  };

  const submitAnswer = () => {
    if (selectedOption === null) return;

    const isCorrect = options[selectedOption].correct;
    if (isCorrect) {
      setCorrectAnswers(correctAnswers + 1);
    }

    if (round < totalRounds) {
      setRound(round + 1);
      loadNextCard();
    } else {
      setShowAd(true);
      setAdCountdown(5);
    }
  };

  const revealResult = () => {
    const dustEarned = correctAnswers * 100;
    setGoldDust(goldDust + dustEarned);
    setGameState('result');
  };

  const playAgain = () => {
    setGameState('intro');
    setAdCountdown(5);
  };

  return (
    <div className="min-h-screen bg-[#020617] py-12" data-testid="oracles-trial">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center" style={{fontFamily: 'Playfair Display, serif'}}>
            <Eye className="w-12 h-12 text-[#D4AF37] mr-4" />
            The Oracle's <span className="text-[#D4AF37] ml-2">Trial</span>
          </h1>
          <p className="text-[#94A3B8] text-lg">High-Stakes Tarot Intuition Challenge | Earn Gold Dust</p>
          {goldDust > 0 && (
            <div className="mt-4 inline-flex items-center space-x-2 bg-[#D4AF37]/20 border border-[#D4AF37] rounded-lg px-6 py-2">
              <Coins className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-[#D4AF37] font-bold text-xl">{goldDust} Gold Dust</span>
            </div>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {gameState === 'intro' && (
            <IntroScreen startGame={startGame} goldDust={goldDust} />
          )}

          {gameState === 'playing' && currentCard && (
            <PlayingScreen
              card={currentCard}
              options={options}
              selectedOption={selectedOption}
              selectOption={selectOption}
              submitAnswer={submitAnswer}
              round={round}
              totalRounds={totalRounds}
            />
          )}

          {showAd && (
            <AdScreen countdown={adCountdown} />
          )}

          {gameState === 'result' && (
            <ResultScreen
              correctAnswers={correctAnswers}
              totalRounds={totalRounds}
              dustEarned={correctAnswers * 100}
              goldDust={goldDust}
              playAgain={playAgain}
              showCosmicReset={showCosmicReset}
              setShowCosmicReset={setShowCosmicReset}
            />
          )}
        </AnimatePresence>
      </div>
      <AdRewarded show={showCosmicReset} onReward={() => { setShowCosmicReset(false); setGameState('intro'); setCorrectAnswers(0); setRound(1); }} onClose={() => setShowCosmicReset(false)} />
    </div>
  );
};

const IntroScreen = ({ startGame, goldDust }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="glass-card rounded-2xl p-8"
  >
    <div className="text-center mb-8">
      <Eye className="w-20 h-20 text-[#D4AF37] mx-auto mb-4" />
      <h2 className="text-3xl font-bold text-white mb-4" style={{fontFamily: 'Playfair Display, serif'}}>Test Your Intuition</h2>
      <p className="text-white/70 max-w-lg mx-auto">
        The Oracle presents 5 sacred Tarot cards. Your task: identify their true meanings through pure intuition. 
        Correct answers earn you Gold Dust - the currency of cosmic wisdom.
      </p>
    </div>

    <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl p-6 mb-8 max-w-md mx-auto">
      <h3 className="text-[#D4AF37] font-bold uppercase tracking-widest mb-4 text-center">Rewards</h3>
      <div className="space-y-3 text-white/80 text-sm">
        <div className="flex justify-between">
          <span>Per Correct Answer:</span>
          <span className="text-[#D4AF37] font-bold">100 Gold Dust</span>
        </div>
        <div className="flex justify-between">
          <span>Perfect Score Bonus:</span>
          <span className="text-[#D4AF37] font-bold">+500 Gold Dust</span>
        </div>
        <div className="flex justify-between">
          <span>Total Possible:</span>
          <span className="text-[#D4AF37] font-bold">1000 Gold Dust</span>
        </div>
      </div>
    </div>

    <button
      onClick={startGame}
      className="w-full max-w-md mx-auto block bg-[#D4AF37] text-[#020617] font-bold py-4 hover:bg-[#F3E5AB] hover:shadow-[0_0_15px_rgba(212,175,55,0.6)] transition-all duration-300 uppercase tracking-widest gold-pulse"
      data-testid="start-trial-button"
    >
      <Play className="w-5 h-5 inline mr-2" />
      Begin Trial
    </button>
  </motion.div>
);

const PlayingScreen = ({ card, options, selectedOption, selectOption, submitAnswer, round, totalRounds }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="space-y-6"
  >
    <div className="text-center">
      <div className="inline-block bg-[#D4AF37]/20 border border-[#D4AF37] rounded-full px-6 py-2 mb-4">
        <span className="text-[#D4AF37] font-bold">Round {round} of {totalRounds}</span>
      </div>
    </div>

    <motion.div
      initial={{ rotateY: 90 }}
      animate={{ rotateY: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-card rounded-2xl p-8 text-center"
    >
      <Sparkles className="w-16 h-16 text-[#D4AF37] mx-auto mb-4 liquid-gold-animation" />
      <h3 className="text-3xl font-bold text-white mb-2" style={{fontFamily: 'Playfair Display, serif'}}>
        {card.name}
      </h3>
      <p className="text-sm uppercase tracking-widest text-white/60 mb-6">{card.arcana} Arcana</p>
      <p className="text-white/70 text-lg">What does this card reveal?</p>
    </motion.div>

    <div className="space-y-4">
      {options.map((option, index) => (
        <motion.button
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => selectOption(index)}
          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
            selectedOption === index
              ? 'border-[#D4AF37] bg-[#D4AF37]/20'
              : 'border-[#D4AF37]/20 hover:border-[#D4AF37]/40 bg-[#020617]/40'
          }`}
          data-testid={`option-${index}`}
        >
          <div className="flex items-center space-x-4">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              selectedOption === index ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-white/40'
            }`}>
              {selectedOption === index && <Star className="w-4 h-4 text-[#020617]" />}
            </div>
            <span className="text-white/80 flex-1">{option.text}</span>
          </div>
        </motion.button>
      ))}
    </div>

    <button
      onClick={submitAnswer}
      disabled={selectedOption === null}
      className="w-full bg-[#D4AF37] text-[#020617] font-bold py-4 hover:bg-[#F3E5AB] transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
      data-testid="submit-answer-button"
    >
      {round < totalRounds ? 'Next Card' : 'Complete Trial'}
    </button>
  </motion.div>
);

const AdScreen = ({ countdown }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="glass-card rounded-2xl p-12 text-center border-2 border-[#D4AF37]"
  >
    <div className="mb-6">
      <div className="w-32 h-32 mx-auto bg-[#020617] border-2 border-[#D4AF37] rounded-full flex items-center justify-center mb-6">
        <Sparkles className="w-16 h-16 text-[#D4AF37] liquid-gold-animation" />
      </div>
    </div>
    <h3 className="text-3xl font-bold text-white mb-4" style={{fontFamily: 'Playfair Display, serif'}}>Cosmic Transmission</h3>
    <p className="text-white/70 mb-6">The Oracle reveals your destiny through this strategic message</p>
    <div className="text-6xl font-bold text-[#D4AF37] mb-2">{countdown}</div>
    <p className="text-sm text-white/60 uppercase tracking-widest">Results in {countdown}s</p>
  </motion.div>
);

const ResultScreen = ({ correctAnswers, totalRounds, dustEarned, goldDust, playAgain, showCosmicReset, setShowCosmicReset }) => {
  const isPerfect = correctAnswers === totalRounds;
  const isLoss = correctAnswers < 3;
  const bonus = isPerfect ? 500 : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-8">
      <div className="text-center mb-8">
        {isPerfect ? (
          <><Award className="w-24 h-24 text-[#D4AF37] mx-auto mb-4" /><h2 className="text-4xl font-bold text-[#D4AF37] mb-2" style={{fontFamily: 'Playfair Display, serif'}}>Perfect Intuition!</h2><p className="text-white/70">The Oracle bows to your wisdom</p></>
        ) : !isLoss ? (
          <><Star className="w-24 h-24 text-[#D4AF37] mx-auto mb-4" /><h2 className="text-4xl font-bold text-white mb-2" style={{fontFamily: 'Playfair Display, serif'}}>Well Done</h2><p className="text-white/70">Your intuition serves you well</p></>
        ) : (
          <><Eye className="w-24 h-24 text-white/40 mx-auto mb-4" /><h2 className="text-4xl font-bold text-white/70 mb-2" style={{fontFamily: 'Playfair Display, serif'}}>Trial Failed</h2><p className="text-white/70">Sharpen your intuition and return</p></>
        )}
      </div>
      <div className="bg-[#020617]/60 border border-[#D4AF37]/40 rounded-xl p-6 mb-6">
        <div className="text-center mb-6"><div className="text-6xl font-bold text-[#D4AF37] mb-2">{correctAnswers}/{totalRounds}</div><div className="text-sm uppercase tracking-widest text-white/60">Correct Answers</div></div>
        <div className="space-y-3 border-t border-[#D4AF37]/20 pt-4">
          <div className="flex justify-between text-white/70"><span>Base Reward:</span><span className="text-[#D4AF37] font-bold">+{dustEarned}</span></div>
          {isPerfect && <div className="flex justify-between text-white/70"><span>Perfect Bonus:</span><span className="text-[#D4AF37] font-bold">+{bonus}</span></div>}
          <div className="flex justify-between text-lg font-bold border-t border-[#D4AF37]/20 pt-3"><span className="text-white">Total Gold Dust:</span><span className="text-[#D4AF37]">{goldDust}</span></div>
        </div>
      </div>
      <AdBanner slot="oracles-trial-result" className="mb-4" />
      <div className="space-y-3">
        {isLoss && (
          <button onClick={() => setShowCosmicReset(true)} className="w-full bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#020617] font-bold py-4 rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] transition-all uppercase tracking-widest text-sm" data-testid="cosmic-reset-btn">Cosmic Reset — Watch & Retry</button>
        )}
        <div className="flex gap-3">
          <ShareButton title="Oracle's Trial" text={`I scored ${correctAnswers}/${totalRounds} in Oracle's Trial on Zenith Oracle!`} />
          <button onClick={playAgain} className="flex-1 bg-transparent border border-[#D4AF37] text-[#D4AF37] font-bold py-3 rounded-xl hover:bg-[#D4AF37]/10 transition-all uppercase tracking-widest text-sm" data-testid="play-again-button">Face the Oracle Again</button>
        </div>
      </div>
    </motion.div>
  );
};

export default OraclesTrial;