import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TarotReader = () => {
  const [question, setQuestion] = useState('');
  const [numCards, setNumCards] = useState(3);
  const [reading, setReading] = useState(null);
  const [loading, setLoading] = useState(false);
  const [flipped, setFlipped] = useState([]);

  const getReading = async () => {
    if (!question.trim()) return;
    
    setLoading(true);
    setFlipped([]);
    try {
      const response = await axios.post(`${API}/tarot/reading`, null, {
        params: { question, num_cards: numCards }
      });
      setReading(response.data);
      
      // Play shuffle sound
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 100]);
      }
    } catch (error) {
      console.error('Tarot reading error:', error);
      alert('Failed to get tarot reading.');
    }
    setLoading(false);
  };

  const toggleFlip = (index) => {
    setFlipped(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
    
    // Play card flip sound via vibration
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] py-12" data-testid="tarot-reader">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{
          backgroundImage: "url('https://images.pexels.com/photos/32771818/pexels-photo-32771818.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940')"
        }}
      />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center" style={{fontFamily: 'Playfair Display, serif'}}>
            <Sparkles className="w-12 h-12 text-[#D4AF37] mr-4" />
            The Oracle's <span className="text-[#D4AF37] ml-2">Trial</span>
          </h1>
          <p className="text-[#94A3B8] text-lg">78+44 Alpha Strategy Cards | Mersenne Twister Precision</p>
        </motion.div>

        {!reading ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto glass-card rounded-2xl p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Ask Your Question</h2>
            <div className="space-y-6">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What strategic insight do you seek?"
                rows="4"
                className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:border-[#D4AF37] focus:outline-none resize-none"
                data-testid="tarot-question-input"
              />
              
              <div>
                <label className="text-sm uppercase tracking-widest text-[#D4AF37] block mb-2">
                  Number of Cards: {numCards}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={numCards}
                  onChange={(e) => setNumCards(parseInt(e.target.value))}
                  className="w-full"
                  data-testid="num-cards-slider"
                />
              </div>

              <button
                onClick={getReading}
                disabled={loading || !question.trim()}
                className="w-full bg-[#D4AF37] text-[#020617] font-bold py-4 hover:bg-[#F3E5AB] hover:shadow-[0_0_15px_rgba(212,175,55,0.6)] transition-all duration-300 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="draw-cards-button"
              >
                {loading ? 'Drawing Cards...' : 'Draw Cards'}
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="glass-card rounded-2xl p-6 mb-8">
              <p className="text-lg text-white/80">
                <strong className="text-[#D4AF37]">Your Question:</strong> {reading.question}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {reading.cards.map((card, index) => (
                <TarotCard
                  key={index}
                  card={card}
                  index={index}
                  flipped={flipped.includes(index)}
                  onFlip={() => toggleFlip(index)}
                />
              ))}
            </div>

            <div className="glass-card rounded-2xl p-8 mb-6">
              <h3 className="text-2xl font-bold text-white mb-4">Strategic Interpretation</h3>
              <p className="text-white/80 leading-relaxed">{reading.interpretation}</p>
            </div>

            <button
              onClick={() => {
                setReading(null);
                setQuestion('');
                setFlipped([]);
              }}
              className="w-full bg-transparent border border-[#D4AF37] text-[#D4AF37] py-4 hover:bg-[#D4AF37]/10 transition-all uppercase tracking-widest font-bold"
              data-testid="new-reading-button"
            >
              <RefreshCw className="w-5 h-5 inline mr-2" />
              New Reading
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const TarotCard = ({ card, index, flipped, onFlip }) => (
  <motion.div
    initial={{ opacity: 0, rotateY: 90 }}
    animate={{ opacity: 1, rotateY: 0 }}
    transition={{ delay: index * 0.2, duration: 0.6 }}
    className="tarot-card cursor-pointer"
    onClick={onFlip}
    data-testid={`tarot-card-${index}`}
  >
    <div className="glass-card rounded-2xl p-6 h-80 flex flex-col justify-between hover:border-[#D4AF37]/60 transition-all">
      {!flipped ? (
        <div className="flex flex-col items-center justify-center h-full">
          <Sparkles className="w-16 h-16 text-[#D4AF37] mb-4 liquid-gold-animation" />
          <p className="text-sm uppercase tracking-widest text-white/60">Tap to Reveal</p>
        </div>
      ) : (
        <>
          <div>
            <h4 className="text-xl font-bold text-[#D4AF37] mb-2">{card.name}</h4>
            <p className="text-xs uppercase tracking-widest text-white/60 mb-4">
              {card.arcana} Arcana
            </p>
          </div>
          <div>
            <p className="text-sm text-white/80 leading-relaxed">
              {card.upright_meaning}
            </p>
          </div>
        </>
      )}
    </div>
  </motion.div>
);

export default TarotReader;
