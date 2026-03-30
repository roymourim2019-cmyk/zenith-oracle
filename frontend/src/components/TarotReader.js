import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, User, Calendar, Volume2 } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TarotReader = () => {
  const [stage, setStage] = useState('input'); // input, shuffle, select, reveal
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [question, setQuestion] = useState('');
  const [auraProfile, setAuraProfile] = useState(null);
  const [shuffledDeck, setShuffledDeck] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [numCardsToSelect, setNumCardsToSelect] = useState(3);
  const [interpretation, setInterpretation] = useState(null);
  const [shuffleAudio] = useState(new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGnODyu2kiCCqCzfLaizsIGGS57OihUhELTKXh8bllHAU1j9bzxnkqBSh+y/HajDkIHGy+7OaoVBYKPpjc8sBrIQYyiM/yz30qBSh+y/HajDkIHGy+7OaoVBYKPpjc8sBrIQYyiM/yz30qBSh+y/HajDkI'));

  const fullDeck = [
    // Major Arcana
    { id: 0, name: 'The Fool', arcana: 'Major', element: 'Air', keywords: ['new beginnings', 'spontaneity', 'innocence', 'freedom'] },
    { id: 1, name: 'The Magician', arcana: 'Major', element: 'Fire', keywords: ['manifestation', 'power', 'action', 'resourcefulness'] },
    { id: 2, name: 'The High Priestess', arcana: 'Major', element: 'Water', keywords: ['intuition', 'mystery', 'subconscious', 'wisdom'] },
    { id: 3, name: 'The Empress', arcana: 'Major', element: 'Earth', keywords: ['abundance', 'nature', 'nurturing', 'creativity'] },
    { id: 4, name: 'The Emperor', arcana: 'Major', element: 'Fire', keywords: ['authority', 'structure', 'leadership', 'stability'] },
    { id: 5, name: 'The Hierophant', arcana: 'Major', element: 'Earth', keywords: ['tradition', 'conformity', 'morality', 'ethics'] },
    { id: 6, name: 'The Lovers', arcana: 'Major', element: 'Air', keywords: ['relationships', 'harmony', 'choices', 'values'] },
    { id: 7, name: 'The Chariot', arcana: 'Major', element: 'Water', keywords: ['willpower', 'victory', 'determination', 'control'] },
    { id: 8, name: 'Strength', arcana: 'Major', element: 'Fire', keywords: ['courage', 'patience', 'control', 'compassion'] },
    { id: 9, name: 'The Hermit', arcana: 'Major', element: 'Earth', keywords: ['introspection', 'solitude', 'guidance', 'wisdom'] },
    { id: 10, name: 'Wheel of Fortune', arcana: 'Major', element: 'Fire', keywords: ['destiny', 'cycles', 'change', 'luck'] },
    { id: 11, name: 'Justice', arcana: 'Major', element: 'Air', keywords: ['fairness', 'truth', 'law', 'accountability'] },
    { id: 12, name: 'The Hanged Man', arcana: 'Major', element: 'Water', keywords: ['surrender', 'perspective', 'sacrifice', 'waiting'] },
    { id: 13, name: 'Death', arcana: 'Major', element: 'Water', keywords: ['transformation', 'endings', 'change', 'renewal'] },
    { id: 14, name: 'Temperance', arcana: 'Major', element: 'Fire', keywords: ['balance', 'moderation', 'patience', 'purpose'] },
    { id: 15, name: 'The Devil', arcana: 'Major', element: 'Earth', keywords: ['bondage', 'materialism', 'temptation', 'restriction'] },
    { id: 16, name: 'The Tower', arcana: 'Major', element: 'Fire', keywords: ['upheaval', 'revelation', 'chaos', 'awakening'] },
    { id: 17, name: 'The Star', arcana: 'Major', element: 'Air', keywords: ['hope', 'inspiration', 'serenity', 'renewal'] },
    { id: 18, name: 'The Moon', arcana: 'Major', element: 'Water', keywords: ['illusion', 'intuition', 'anxiety', 'subconscious'] },
    { id: 19, name: 'The Sun', arcana: 'Major', element: 'Fire', keywords: ['success', 'vitality', 'joy', 'confidence'] },
    { id: 20, name: 'Judgement', arcana: 'Major', element: 'Fire', keywords: ['reflection', 'reckoning', 'awakening', 'renewal'] },
    { id: 21, name: 'The World', arcana: 'Major', element: 'Earth', keywords: ['completion', 'achievement', 'fulfillment', 'success'] },
  ];

  const calculateAura = async () => {
    try {
      // Get numerology profile
      const numResponse = await axios.post(`${API}/numerology/calculate`, {
        name,
        birth_date: birthDate,
        birth_time: '12:00:00',
        latitude: 0,
        longitude: 0
      });

      // Get vedic chart for astrological influence
      const chartResponse = await axios.post(`${API}/vedic/birth-chart`, {
        name,
        birth_date: birthDate,
        birth_time: '12:00:00',
        latitude: 0,
        longitude: 0,
        timezone_offset: 0
      });

      // Calculate aura signature
      const aura = {
        numerology: numResponse.data,
        sun_sign: chartResponse.data.planets.find(p => p.name === 'Sun')?.sign,
        moon_sign: chartResponse.data.planets.find(p => p.name === 'Moon')?.sign,
        ascendant: chartResponse.data.ascendant_sign,
        life_path: numResponse.data.chaldean_number,
        soul_number: numResponse.data.pythagorean_number,
        destiny_number: numResponse.data.vedic_number,
        power_score: chartResponse.data.power_score,
        aura_color: getAuraColor(numResponse.data.chaldean_number),
        dominant_element: getDominantElement(chartResponse.data.planets)
      };

      setAuraProfile(aura);
      return aura;
    } catch (error) {
      console.error('Failed to calculate aura:', error);
      return null;
    }
  };

  const getAuraColor = (lifePathNumber) => {
    const colors = {
      1: { name: 'Red', meaning: 'Leadership & Action' },
      2: { name: 'Orange', meaning: 'Partnership & Balance' },
      3: { name: 'Yellow', meaning: 'Creativity & Expression' },
      4: { name: 'Green', meaning: 'Stability & Growth' },
      5: { name: 'Blue', meaning: 'Freedom & Adventure' },
      6: { name: 'Indigo', meaning: 'Responsibility & Love' },
      7: { name: 'Violet', meaning: 'Spirituality & Wisdom' },
      8: { name: 'Gold', meaning: 'Power & Abundance' },
      9: { name: 'White', meaning: 'Completion & Compassion' }
    };
    return colors[lifePathNumber] || colors[1];
  };

  const getDominantElement = (planets) => {
    const elements = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
    const signElements = {
      'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
      'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
      'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
      'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water'
    };
    
    planets.forEach(p => {
      const element = signElements[p.sign];
      if (element) elements[element]++;
    });
    
    return Object.keys(elements).reduce((a, b) => elements[a] > elements[b] ? a : b);
  };

  const startReading = async () => {
    if (!name || !birthDate || !question) {
      alert('Please fill in all fields');
      return;
    }

    // Calculate aura profile
    const aura = await calculateAura();
    if (!aura) {
      alert('Failed to calculate aura profile');
      return;
    }

    // Shuffle deck with sound
    playShuffleSound();
    setStage('shuffle');

    setTimeout(() => {
      // Seed shuffle based on user's aura
      const seed = aura.life_path * aura.soul_number * aura.destiny_number;
      const shuffled = seededShuffle([...fullDeck], seed);
      setShuffledDeck(shuffled);
      setStage('select');
    }, 2000);
  };

  const playShuffleSound = () => {
    shuffleAudio.play().catch(e => console.log('Audio play failed:', e));
  };

  const seededShuffle = (array, seed) => {
    let currentIndex = array.length;
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    while (currentIndex !== 0) {
      const randomIndex = Math.floor(random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  };

  const selectCard = (index) => {
    if (selectedCards.includes(index)) {
      setSelectedCards(selectedCards.filter(i => i !== index));
    } else if (selectedCards.length < numCardsToSelect) {
      setSelectedCards([...selectedCards, index]);
      playShuffleSound();
    }
  };

  const revealReading = () => {
    if (selectedCards.length !== numCardsToSelect) {
      alert(`Please select exactly ${numCardsToSelect} cards`);
      return;
    }

    const cards = selectedCards.map(i => shuffledDeck[i]);
    const reading = generateAuraBasedInterpretation(cards, auraProfile, question);
    setInterpretation(reading);
    setStage('reveal');
  };

  const generateAuraBasedInterpretation = (cards, aura, userQuestion) => {
    const positions = ['Past Influence', 'Present Energy', 'Future Potential', 'Hidden Factor', 'Outcome', 'Advice', 'Challenge', 'Opportunity'];
    
    let interpretation = `**${aura.numerology.name}'s Aura-Aligned Reading**\n\n`;
    interpretation += `**Your Cosmic Signature:**\n`;
    interpretation += `- Aura Color: ${aura.aura_color.name} (${aura.aura_color.meaning})\n`;
    interpretation += `- Sun in ${aura.sun_sign}, Moon in ${aura.moon_sign}\n`;
    interpretation += `- Life Path: ${aura.life_path} | Dominant Element: ${aura.dominant_element}\n`;
    interpretation += `- Current Power Level: ${aura.power_score}/100\n\n`;
    interpretation += `**Question:** ${userQuestion}\n\n`;

    cards.forEach((card, idx) => {
      const position = positions[idx];
      const elementMatch = card.element === aura.dominant_element;
      const powerBoost = elementMatch ? ' (Element Resonance: +20% influence)' : '';
      
      interpretation += `**${position}:** ${card.name}${powerBoost}\n`;
      interpretation += `Keywords: ${card.keywords.join(', ')}\n`;
      interpretation += `Aura Insight: `;
      
      // Personalized interpretation based on aura
      if (elementMatch) {
        interpretation += `This card resonates strongly with your ${aura.dominant_element} dominant nature. `;
      }
      
      if (card.arcana === 'Major') {
        interpretation += `As a Major Arcana, this represents a significant life force in your journey. `;
      }
      
      // Add numerology connection
      if (card.id === aura.life_path || card.id === aura.soul_number) {
        interpretation += `This card vibrates with your personal numerology - pay special attention to its message. `;
      }
      
      interpretation += `\\n\\n`;
    });

    // Strategic Action Plan based on reading
    interpretation += `**Strategic Action Plan (Based on Your ${aura.aura_color.name} Aura):**\n`;
    interpretation += `1. ${getAuraAdvice(aura, cards[0])}\n`;
    interpretation += `2. ${getAuraAdvice(aura, cards[1])}\n`;
    interpretation += `3. ${getAuraAdvice(aura, cards[2])}\n`;

    return interpretation;
  };

  const getAuraAdvice = (aura, card) => {
    const advice = {
      Fire: 'Take bold, decisive action while maintaining control',
      Earth: 'Build solid foundations and trust in gradual progress',
      Air: 'Communicate your vision clearly and gather information',
      Water: 'Trust your intuition and emotional intelligence'
    };
    
    return `${card.keywords[0].charAt(0).toUpperCase() + card.keywords[0].slice(1)} through ${advice[aura.dominant_element]}`;
  };

  const resetReading = () => {
    setStage('input');
    setSelectedCards([]);
    setInterpretation(null);
    setShuffledDeck([]);
  };

  return (
    <div className="min-h-screen bg-[#020617] py-12" data-testid="tarot-reader">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{
          backgroundImage: "url('https://images.pexels.com/photos/32771818/pexels-photo-32771818.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940')"
        }}
      />
      
      <div className="container mx-auto px-6 max-w-6xl relative z-10">\n        <motion.div\n          initial={{ opacity: 0, y: -20 }}\n          animate={{ opacity: 1, y: 0 }}\n          className=\"text-center mb-12\"\n        >\n          <h1 className=\"text-5xl font-bold text-white mb-4 flex items-center justify-center\" style={{fontFamily: 'Playfair Display, serif'}}>\n            <Sparkles className=\"w-12 h-12 text-[#D4AF37] mr-4\" />\n            Aura-Linked <span className=\"text-[#D4AF37] ml-2\">Tarot</span>\n          </h1>\n          <p className=\"text-[#94A3B8] text-lg\">Your Reading Aligned with Astrology & Numerology</p>\n        </motion.div>\n\n        <AnimatePresence mode=\"wait\">\n          {stage === 'input' && (\n            <InputStage\n              name={name}\n              setName={setName}\n              birthDate={birthDate}\n              setBirthDate={setBirthDate}\n              question={question}\n              setQuestion={setQuestion}\n              numCardsToSelect={numCardsToSelect}\n              setNumCardsToSelect={setNumCardsToSelect}\n              startReading={startReading}\n            />\n          )}\n\n          {stage === 'shuffle' && <ShuffleStage />}\n\n          {stage === 'select' && (\n            <SelectStage\n              shuffledDeck={shuffledDeck}\n              selectedCards={selectedCards}\n              selectCard={selectCard}\n              numCardsToSelect={numCardsToSelect}\n              revealReading={revealReading}\n              auraProfile={auraProfile}\n            />\n          )}\n\n          {stage === 'reveal' && (\n            <RevealStage\n              selectedCards={selectedCards}\n              shuffledDeck={shuffledDeck}\n              interpretation={interpretation}\n              auraProfile={auraProfile}\n              resetReading={resetReading}\n            />\n          )}\n        </AnimatePresence>\n      </div>\n    </div>\n  );\n};\n\nconst InputStage = ({ name, setName, birthDate, setBirthDate, question, setQuestion, numCardsToSelect, setNumCardsToSelect, startReading }) => (\n  <motion.div\n    initial={{ opacity: 0, y: 20 }}\n    animate={{ opacity: 1, y: 0 }}\n    exit={{ opacity: 0, y: -20 }}\n    className=\"glass-card rounded-2xl p-8 max-w-2xl mx-auto\"\n  >\n    <div className=\"text-center mb-8\">\n      <div className=\"w-20 h-20 mx-auto mb-4 bg-[#D4AF37]/20 rounded-full flex items-center justify-center border-2 border-[#D4AF37]\">\n        <User className=\"w-10 h-10 text-[#D4AF37]\" />\n      </div>\n      <h2 className=\"text-2xl font-bold text-white mb-2\">Connect Your Aura</h2>\n      <p className=\"text-white/70 text-sm\">Your reading will be personalized using astrology and numerology</p>\n    </div>\n\n    <div className=\"space-y-6\">\n      <div>\n        <label className=\"text-sm uppercase tracking-widest text-[#D4AF37] block mb-2\">Full Name</label>\n        <input\n          type=\"text\"\n          value={name}\n          onChange={(e) => setName(e.target.value)}\n          placeholder=\"Enter your full name\"\n          className=\"w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:border-[#D4AF37] focus:outline-none\"\n          data-testid=\"tarot-name-input\"\n        />\n      </div>\n\n      <div>\n        <label className=\"text-sm uppercase tracking-widest text-[#D4AF37] block mb-2\">Birth Date</label>\n        <input\n          type=\"date\"\n          value={birthDate}\n          onChange={(e) => setBirthDate(e.target.value)}\n          className=\"w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none\"\n          data-testid=\"tarot-birthdate-input\"\n        />\n      </div>\n\n      <div>\n        <label className=\"text-sm uppercase tracking-widest text-[#D4AF37] block mb-2\">Your Question</label>\n        <textarea\n          value={question}\n          onChange={(e) => setQuestion(e.target.value)}\n          placeholder=\"What strategic insight do you seek?\"\n          rows=\"4\"\n          className=\"w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:border-[#D4AF37] focus:outline-none resize-none\"\n          data-testid=\"tarot-question-input\"\n        />\n      </div>\n\n      <div>\n        <label className=\"text-sm uppercase tracking-widest text-[#D4AF37] block mb-2\">\n          Number of Cards to Select: {numCardsToSelect}\n        </label>\n        <input\n          type=\"range\"\n          min=\"3\"\n          max=\"8\"\n          value={numCardsToSelect}\n          onChange={(e) => setNumCardsToSelect(parseInt(e.target.value))}\n          className=\"w-full\"\n          data-testid=\"num-cards-slider\"\n        />\n        <div className=\"flex justify-between text-xs text-white/60 mt-1\">\n          <span>3 cards</span>\n          <span>8 cards</span>\n        </div>\n      </div>\n\n      <button\n        onClick={startReading}\n        className=\"w-full bg-[#D4AF37] text-[#020617] font-bold py-4 hover:bg-[#F3E5AB] hover:shadow-[0_0_15px_rgba(212,175,55,0.6)] transition-all duration-300 uppercase tracking-widest gold-pulse\"\n        data-testid=\"start-reading-button\"\n      >\n        <Volume2 className=\"w-5 h-5 inline mr-2\" />\n        Begin Aura Reading\n      </button>\n    </div>\n  </motion.div>\n);\n\nconst ShuffleStage = () => (\n  <motion.div\n    initial={{ opacity: 0, scale: 0.9 }}\n    animate={{ opacity: 1, scale: 1 }}\n    exit={{ opacity: 0, scale: 0.9 }}\n    className=\"glass-card rounded-2xl p-12 text-center max-w-2xl mx-auto\"\n  >\n    <motion.div\n      animate={{ rotate: 360 }}\n      transition={{ duration: 2, repeat: Infinity, ease: \"linear\" }}\n      className=\"w-32 h-32 mx-auto mb-6 bg-[#D4AF37]/20 rounded-full flex items-center justify-center border-4 border-[#D4AF37]\"\n    >\n      <Sparkles className=\"w-16 h-16 text-[#D4AF37]\" />\n    </motion.div>\n    <h3 className=\"text-3xl font-bold text-white mb-4\" style={{fontFamily: 'Playfair Display, serif'}}>Aligning Cards with Your Aura</h3>\n    <p className=\"text-white/70\">The deck is being shuffled based on your unique cosmic signature...</p>\n  </motion.div>\n);\n\nconst SelectStage = ({ shuffledDeck, selectedCards, selectCard, numCardsToSelect, revealReading, auraProfile }) => (\n  <motion.div\n    initial={{ opacity: 0 }}\n    animate={{ opacity: 1 }}\n    exit={{ opacity: 0 }}\n    className=\"space-y-6\"\n  >\n    {auraProfile && (\n      <div className=\"glass-card rounded-xl p-6 max-w-4xl mx-auto\">\n        <h3 className=\"text-xl font-bold text-white mb-4\">Your Aura Profile</h3>\n        <div className=\"grid md:grid-cols-4 gap-4 text-sm\">\n          <div className=\"text-center\">\n            <div className=\"text-[#D4AF37] font-bold\">{auraProfile.aura_color.name}</div>\n            <div className=\"text-white/60 text-xs\">Aura Color</div>\n          </div>\n          <div className=\"text-center\">\n            <div className=\"text-[#D4AF37] font-bold\">{auraProfile.dominant_element}</div>\n            <div className=\"text-white/60 text-xs\">Dominant Element</div>\n          </div>\n          <div className=\"text-center\">\n            <div className=\"text-[#D4AF37] font-bold\">{auraProfile.life_path}</div>\n            <div className=\"text-white/60 text-xs\">Life Path</div>\n          </div>\n          <div className=\"text-center\">\n            <div className=\"text-[#D4AF37] font-bold\">{auraProfile.power_score}/100</div>\n            <div className=\"text-white/60 text-xs\">Current Power</div>\n          </div>\n        </div>\n      </div>\n    )}\n\n    <div className=\"text-center mb-6\">\n      <h3 className=\"text-2xl font-bold text-white mb-2\">Select {numCardsToSelect} Cards</h3>\n      <p className=\"text-[#D4AF37]\">{selectedCards.length} / {numCardsToSelect} selected</p>\n    </div>\n\n    <div className=\"grid grid-cols-4 md:grid-cols-7 gap-4 max-w-5xl mx-auto\">\n      {shuffledDeck.slice(0, 21).map((card, index) => (\n        <CardBack\n          key={index}\n          index={index}\n          selected={selectedCards.includes(index)}\n          onClick={() => selectCard(index)}\n        />\n      ))}\n    </div>\n\n    <div className=\"text-center\">\n      <button\n        onClick={revealReading}\n        disabled={selectedCards.length !== numCardsToSelect}\n        className=\"bg-[#D4AF37] text-[#020617] font-bold py-4 px-12 hover:bg-[#F3E5AB] transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed gold-pulse\"\n        data-testid=\"reveal-reading-button\"\n      >\n        Reveal Your Destiny\n      </button>\n    </div>\n  </motion.div>\n);\n\nconst CardBack = ({ index, selected, onClick }) => (\n  <motion.button\n    whileHover={{ scale: 1.05 }}\n    whileTap={{ scale: 0.95 }}\n    onClick={onClick}\n    className={`aspect-[2/3] rounded-lg border-2 transition-all cursor-pointer ${\n      selected \n        ? 'border-[#D4AF37] bg-[#D4AF37]/30 scale-105' \n        : 'border-[#D4AF37]/40 bg-[#020617]/80 hover:border-[#D4AF37]/80'\n    }`}\n    data-testid={`card-back-${index}`}\n  >\n    <div className=\"w-full h-full flex items-center justify-center\">\n      <Sparkles className=\"w-8 h-8 text-[#D4AF37]\" />\n    </div>\n  </motion.button>\n);\n\nconst RevealStage = ({ selectedCards, shuffledDeck, interpretation, auraProfile, resetReading }) => (\n  <motion.div\n    initial={{ opacity: 0, y: 20 }}\n    animate={{ opacity: 1, y: 0 }}\n    exit={{ opacity: 0 }}\n    className=\"space-y-6\"\n  >\n    <div className=\"glass-card rounded-2xl p-8\">\n      <h3 className=\"text-3xl font-bold text-white mb-6 text-center\" style={{fontFamily: 'Playfair Display, serif'}}>Your Aura-Aligned Reading</h3>\n      \n      <div className=\"grid md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8\">\n        {selectedCards.map((cardIndex, idx) => {\n          const card = shuffledDeck[cardIndex];\n          return (\n            <motion.div\n              key={idx}\n              initial={{ rotateY: 90 }}\n              animate={{ rotateY: 0 }}\n              transition={{ delay: idx * 0.2, duration: 0.6 }}\n              className=\"glass-card rounded-xl p-4\"\n            >\n              <Sparkles className=\"w-12 h-12 text-[#D4AF37] mx-auto mb-3\" />\n              <h4 className=\"text-lg font-bold text-[#D4AF37] text-center mb-2\">{card.name}</h4>\n              <p className=\"text-xs text-white/60 text-center mb-2\">{card.arcana} Arcana</p>\n              <div className=\"text-xs text-white/70 text-center\">\n                {card.keywords.join(' • ')}\n              </div>\n            </motion.div>\n          );\n        })}\n      </div>\n\n      <div className=\"bg-[#020617]/60 border border-[#D4AF37]/30 rounded-xl p-6\">\n        <div className=\"prose prose-invert max-w-none\">\n          {interpretation.split('\\n').map((line, idx) => {\n            if (line.startsWith('**') && line.endsWith('**')) {\n              return <h4 key={idx} className=\"text-[#D4AF37] font-bold mt-4 mb-2\">{line.replace(/\\*\\*/g, '')}</h4>;\n            } else if (line.startsWith('**')) {\n              return <p key={idx} className=\"text-white/90 mb-2\"><strong className=\"text-[#D4AF37]\">{line.split(':**')[0].replace(/\\*\\*/g, '')}:</strong>{line.split(':**')[1]}</p>;\n            } else if (line.trim()) {\n              return <p key={idx} className=\"text-white/80 mb-2\">{line}</p>;\n            }\n            return <br key={idx} />;\n          })}\n        </div>\n      </div>\n    </div>\n\n    <div className=\"text-center\">\n      <button\n        onClick={resetReading}\n        className=\"bg-transparent border border-[#D4AF37] text-[#D4AF37] py-4 px-12 hover:bg-[#D4AF37]/10 transition-all uppercase tracking-widest font-bold\"\n        data-testid=\"new-reading-button\"\n      >\n        New Reading\n      </button>\n    </div>\n  </motion.div>\n);\n\nexport default TarotReader;
