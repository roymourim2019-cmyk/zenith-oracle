// Haptic feedback patterns for each planet
class HapticSignature {
  constructor() {
    this.patterns = {
      Sun: [100, 50, 100, 50, 100],           // Strong, rhythmic
      Moon: [50, 30, 50, 30, 50, 30, 50],     // Gentle, flowing
      Mercury: [30, 20, 30, 20, 30, 20, 30],  // Quick, sharp
      Venus: [80, 40, 80, 40, 80],            // Smooth, harmonious
      Mars: [150, 30, 150, 30, 150],          // Intense, aggressive
      Jupiter: [120, 60, 120, 60, 120],       // Expansive, grand
      Saturn: [200, 100, 200],                // Heavy, deliberate
      Rahu: [50, 100, 50, 100, 50],           // Unpredictable
      Ketu: [100, 50, 50, 50, 100]            // Mystical, detached
    };
  }

  trigger(planetName) {
    if (!navigator.vibrate) {
      console.log(`Haptic not supported - would vibrate for ${planetName}`);
      return;
    }

    const pattern = this.patterns[planetName];
    if (pattern) {
      navigator.vibrate(pattern);
      console.log(`✨ Haptic signature for ${planetName}:`, pattern);
    }
  }

  triggerAllPlanets(delay = 300) {
    if (!navigator.vibrate) return;

    const planets = Object.keys(this.patterns);
    planets.forEach((planet, index) => {
      setTimeout(() => {
        this.trigger(planet);
      }, index * delay);
    });
  }
}

export default HapticSignature;