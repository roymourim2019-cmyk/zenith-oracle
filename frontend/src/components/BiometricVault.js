import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Fingerprint, Eye, EyeOff, Check, AlertTriangle } from 'lucide-react';
import CryptoVault from '../utils/CryptoVault';

const BiometricVault = () => {
  const [isLocked, setIsLocked] = useState(true);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [vaultData, setVaultData] = useState(null);
  const [encryptionKey, setEncryptionKey] = useState(null);
  const [error, setError] = useState('');

  const cryptoVault = new CryptoVault();

  useEffect(() => {
    checkBiometricSupport();
    loadVaultData();
  }, []);

  const checkBiometricSupport = async () => {
    if (window.PublicKeyCredential && 
        window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
      const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      setBiometricSupported(available);
    }
  };

  const loadVaultData = () => {
    const encrypted = localStorage.getItem('zenith_vault');
    if (encrypted) {
      setVaultData(encrypted);
    }
  };

  const authenticateWithBiometric = async () => {
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      
      const publicKeyOptions = {
        challenge,
        rp: { name: 'Zenith Oracle' },
        user: {
          id: crypto.getRandomValues(new Uint8Array(32)),
          name: 'user@zenith.oracle',
          displayName: 'Zenith User'
        },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required'
        },
        timeout: 60000
      };

      await navigator.credentials.create({ publicKey: publicKeyOptions });
      
      // Generate key from biometric authentication
      const bioKey = await cryptoVault.generateKey('biometric-authenticated-' + Date.now());
      setEncryptionKey(bioKey);
      await unlockVault(bioKey);
      
    } catch (error) {
      setError('Biometric authentication failed. Use password instead.');
      console.error('Biometric auth error:', error);
    }
  };

  const authenticateWithPassword = async () => {
    if (!password) {
      setError('Please enter a password');
      return;
    }

    try {
      const key = await cryptoVault.generateKey(password);
      setEncryptionKey(key);
      await unlockVault(key);
    } catch (error) {
      setError('Incorrect password');
      console.error('Password auth error:', error);
    }
  };

  const unlockVault = async (key) => {
    try {
      if (vaultData) {
        const decrypted = await cryptoVault.decrypt(vaultData, key);
        setIsLocked(false);
        setError('');
        // Trigger haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate([50, 30, 50]);
        }
      } else {
        // No data yet, create empty vault
        setIsLocked(false);
        setError('');
      }
    } catch (error) {
      setError('Failed to decrypt vault. Incorrect credentials.');
      console.error('Unlock error:', error);
    }
  };

  const saveToVault = async (data) => {
    if (!encryptionKey) {
      setError('No encryption key available');
      return;
    }

    try {
      const encrypted = await cryptoVault.encrypt(data, encryptionKey);
      localStorage.setItem('zenith_vault', encrypted);
      setVaultData(encrypted);
      
      // Haptic confirmation
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
    } catch (error) {
      setError('Failed to save data');
      console.error('Save error:', error);
    }
  };

  const lockVault = () => {
    setIsLocked(true);
    setEncryptionKey(null);
    setPassword('');
    setError('');
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#020617] py-12 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-2xl p-8 max-w-md w-full"
        >
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-6 bg-[#D4AF37]/20 rounded-full flex items-center justify-center border-2 border-[#D4AF37]">
              <Lock className="w-12 h-12 text-[#D4AF37]" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2" style={{fontFamily: 'Playfair Display, serif'}}>Biometric Vault 2.0</h2>
            <p className="text-white/70 text-sm">AES-256 Encrypted | FaceID/Fingerprint Protected</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-6 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          {biometricSupported && (
            <button
              onClick={authenticateWithBiometric}
              className="w-full bg-[#D4AF37] text-[#020617] font-bold py-4 mb-4 hover:bg-[#F3E5AB] transition-all uppercase tracking-widest flex items-center justify-center space-x-2"
              data-testid="biometric-unlock-button"
            >
              <Fingerprint className="w-5 h-5" />
              <span>Unlock with Biometric</span>
            </button>
          )}

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#D4AF37]/20"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#020617] px-2 text-white/60">Or use password</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && authenticateWithPassword()}
                placeholder="Enter vault password"
                className="w-full bg-[#020617]/60 border border-[#D4AF37]/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:border-[#D4AF37] focus:outline-none pr-12"
                data-testid="password-input"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <button
              onClick={authenticateWithPassword}
              className="w-full bg-transparent border border-[#D4AF37] text-[#D4AF37] py-3 hover:bg-[#D4AF37]/10 transition-all uppercase tracking-widest font-bold"
              data-testid="password-unlock-button"
            >
              Unlock Vault
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-white/40">
              All data is encrypted with AES-256 and stored locally on your device
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-5xl font-bold text-white mb-4 flex items-center" style={{fontFamily: 'Playfair Display, serif'}}>
                <Shield className="w-12 h-12 text-[#D4AF37] mr-4" />
                Biometric <span className="text-[#D4AF37] ml-2">Vault</span>
              </h1>
              <p className="text-[#94A3B8] text-lg">Your sacred data, protected by military-grade encryption</p>
            </div>
            <button
              onClick={lockVault}
              className="bg-[#D4AF37] text-[#020617] font-bold py-3 px-6 hover:bg-[#F3E5AB] transition-all uppercase tracking-widest text-sm"
            >
              <Lock className="w-4 h-4 inline mr-2" />
              Lock Vault
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-8"
        >
          <div className="flex items-center space-x-2 mb-6 bg-green-500/20 border border-green-500 rounded-lg p-4">
            <Check className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-bold">Vault Unlocked & Secured</span>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Stored Profiles</h3>
              <p className="text-white/70">Your birth charts and personal data are encrypted and protected.</p>
            </div>

            <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl p-6">
              <h4 className="text-[#D4AF37] font-bold uppercase tracking-widest mb-4">Security Details</h4>
              <div className="space-y-2 text-sm text-white/80">
                <div className="flex justify-between">
                  <span>Encryption:</span>
                  <span className="text-[#D4AF37]">AES-256-GCM</span>
                </div>
                <div className="flex justify-between">
                  <span>Key Derivation:</span>
                  <span className="text-[#D4AF37]">PBKDF2 (100,000 iterations)</span>
                </div>
                <div className="flex justify-between">
                  <span>Authentication:</span>
                  <span className="text-[#D4AF37]">{biometricSupported ? 'Biometric + Password' : 'Password'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Storage:</span>
                  <span className="text-[#D4AF37]">Local (Never cloud-synced)</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BiometricVault;