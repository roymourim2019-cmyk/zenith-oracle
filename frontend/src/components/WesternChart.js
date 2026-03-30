const WesternChart = ({ userTier }) => {
  return (
    <div className="min-h-screen bg-[#020617] py-12">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-bold text-white mb-8">Western Astrology Chart</h1>
        <div className="glass-card rounded-2xl p-8">
          <p className="text-white/80">Western tropical chart with Placidus houses</p>
        </div>
      </div>
    </div>
  );
};

export default WesternChart;