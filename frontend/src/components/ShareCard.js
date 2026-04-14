import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Download, X, Copy, Check } from 'lucide-react';

export const ShareButton = ({ title, text, onShare }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (onShare) onShare();
    const shareData = {
      title: title || 'Zenith Oracle Reading',
      text: text || 'Check out my cosmic reading on Zenith Oracle!',
      url: window.location.href,
    };

    if (navigator.share) {
      try { await navigator.share(shareData); } catch (e) {}
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {}
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#D4AF37]/30 text-[#D4AF37] text-xs uppercase tracking-widest font-semibold hover:bg-[#D4AF37]/10 transition-all"
      data-testid="share-reading-btn"
    >
      {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
      {copied ? 'Copied!' : 'Share Reading'}
    </button>
  );
};

export const ShareableCard = ({ show, onClose, data }) => {
  const cardRef = useRef(null);

  if (!show || !data) return null;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(cardRef.current, { backgroundColor: '#020617', scale: 2 });
      const link = document.createElement('a');
      link.download = `zenith-oracle-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Download failed:', e);
    }
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[250] flex items-center justify-center p-4" data-testid="shareable-card-modal">
        <div className="max-w-sm w-full">
          <div ref={cardRef} className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #020617 0%, #0a1628 100%)' }}>
            <div className="p-6 border border-[#D4AF37]/30 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[#D4AF37] text-xl">&#x2728;</span>
                <span className="text-[#D4AF37] text-xs uppercase tracking-[0.3em] font-bold">Zenith Oracle</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>{data.title}</h3>
              <p className="text-sm text-white/70 leading-relaxed mb-4">{data.content}</p>
              {data.details && (
                <div className="bg-[#D4AF37]/10 rounded-lg p-3 mb-4">
                  <p className="text-xs text-[#D4AF37]">{data.details}</p>
                </div>
              )}
              <div className="flex items-center justify-between pt-3 border-t border-[#D4AF37]/15">
                <span className="text-[8px] text-white/20 uppercase tracking-widest">Scripture-Bound Deterministic Math</span>
                <span className="text-[8px] text-[#D4AF37]/40">zenith-oracle.app</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleDownload} className="flex-1 flex items-center justify-center gap-2 bg-[#D4AF37] text-[#020617] font-bold py-3 rounded-xl text-xs uppercase tracking-widest" data-testid="download-card-btn">
              <Download className="w-4 h-4" /> Save Image
            </button>
            <button onClick={onClose} className="px-4 py-3 rounded-xl border border-white/10 text-white/40 hover:text-white/70 transition-colors" data-testid="close-share-modal">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
