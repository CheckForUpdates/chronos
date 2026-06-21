import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hourglass, Lock, Clock, ShieldCheck, Download, Key, Upload, Unlock } from 'lucide-react';
import { createCapsuleFile, openCapsule } from './lib/crypto';
import type { ChronosCapsule } from './lib/crypto';
import './index.css';

const WebFonts = () => (
  <style>
    {`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
    `}
  </style>
);

function App() {
  const [view, setView] = useState<'landing' | 'creator' | 'reader'>('landing');

  return (
    <>
      <WebFonts />
      <div className="app-container">
        <header className="nav-header">
          <div className="logo" onClick={() => setView('landing')} style={{ cursor: 'pointer' }}>
            <Hourglass size={32} />
            CHRONOS
          </div>
          <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <button className="btn-secondary" style={{ border: 'none' }} onClick={() => setView('reader')}>Open a Capsule</button>
            <a href="https://github.com/CheckForUpdates/chronos/blob/main/ARCHITECTURE.md" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>How it Works</a>
            <button className="btn-secondary" onClick={() => setView('creator')}>Create Capsule</button>
          </nav>
        </header>

        <AnimatePresence mode="wait">
          {view === 'landing' && (
            <motion.div 
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <section className="hero-section">
                <h1>The Open-Source Digital Time Capsule</h1>
                <p>
                  Chronos produces self-contained, encrypted <code>.chronos</code> files. No servers, no promises, no liability. 
                  Leave messages locked until the day you choose. Your passphrase is the only key.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button className="btn-primary" onClick={() => setView('creator')}>Seal a Message</button>
                  <button className="btn-secondary" onClick={() => setView('reader')}>Unlock a Capsule</button>
                </div>
              </section>

              <section className="capsule-grid">
                <div className="capsule-card glass-panel">
                  <div className="capsule-icon">
                    <Lock size={32} />
                  </div>
                  <h3>Zero-Knowledge Encryption</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Messages never leave your browser unencrypted. AES-GCM and PBKDF2 guarantee your payload is safe.
                  </p>
                </div>
                <div className="capsule-card glass-panel">
                  <div className="capsule-icon">
                    <Clock size={32} />
                  </div>
                  <h3>Client-Side Time-Lock</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    The app checks the local date before decrypting. A soft-enforcement time lock to prevent early peaking.
                  </p>
                </div>
                <div className="capsule-card glass-panel">
                  <div className="capsule-icon">
                    <ShieldCheck size={32} />
                  </div>
                  <h3>Zero Server Liability</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    We store nothing. You download the <code>.chronos</code> file and deliver it yourself.
                  </p>
                </div>
              </section>
            </motion.div>
          )}
          {view === 'creator' && (
            <motion.div 
              key="creator"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5 }}
            >
              <CapsuleCreator />
            </motion.div>
          )}
          {view === 'reader' && (
            <motion.div 
              key="reader"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5 }}
            >
              <CapsuleReader />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function CapsuleCreator() {
  const [step, setStep] = useState(1);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [sealedCapsuleData, setSealedCapsuleData] = useState<ChronosCapsule | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    unlockDate: '',
    passphrase: '',
    hint: ''
  });

  const nextStep = () => setStep(s => s + 1);

  const handleSeal = async () => {
    setIsEncrypting(true);
    try {
      const [year, month, day] = formData.unlockDate.split('-');
      const formattedDate = `${month}${day}${year}`;
      const capsule = await createCapsuleFile(
        formData.title,
        formData.message,
        formattedDate,
        formData.passphrase,
        formData.hint
      );
      setSealedCapsuleData(capsule);
      nextStep();
    } catch (e) {
      console.error(e);
      alert("Encryption failed.");
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleDownload = () => {
    if (!sealedCapsuleData) return;
    const blob = new Blob([JSON.stringify(sealedCapsuleData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'capsule'}.chronos`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2>Create a Time Capsule</h2>
        <p style={{ color: 'var(--text-muted)' }}>Step {step} of 3</p>
      </div>

      <div className="creator-layout">
        <div className="creator-form glass-panel">
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="form-group">
              <div className="form-group">
                <label>Capsule Title</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g., Time-locked apologies and confessions"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Confidential Message</label>
                <textarea 
                  className="input-field" 
                  rows={6}
                  placeholder="Pour your thoughts here. They will be encrypted in your browser..."
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                />
              </div>
              <button 
                className="btn-primary" 
                style={{ marginTop: '2rem' }} 
                onClick={nextStep}
                disabled={!formData.title || !formData.message}
              >
                Next: Encryption Keys
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="form-group">
              <div className="form-group">
                <label>Unlock Date</label>
                <input 
                  type="date" 
                  className="input-field" 
                  value={formData.unlockDate}
                  onChange={e => setFormData({...formData, unlockDate: e.target.value})}
                />
              </div>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Decryption Passphrase</label>
                <input 
                  type="password" 
                  className="input-field" 
                  placeholder="Keep this safe!"
                  value={formData.passphrase}
                  onChange={e => setFormData({...formData, passphrase: e.target.value})}
                />
              </div>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Passphrase Hint (Public)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g., The name of our first pet"
                  value={formData.hint}
                  onChange={e => setFormData({...formData, hint: e.target.value})}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
                <button 
                  className="btn-primary" 
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} 
                  onClick={handleSeal}
                  disabled={!formData.unlockDate || !formData.passphrase || isEncrypting}
                >
                  <Key size={18} />
                  {isEncrypting ? "Encrypting..." : "Seal Capsule"}
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="form-group" style={{ textAlign: 'center' }}>
              <Lock size={48} color="var(--gold-primary)" style={{ margin: '0 auto 1rem' }} />
              <h3>Your Capsule is Sealed</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                Your message has been encrypted and a <code>.chronos</code> file has been generated. 
                Download the file and send it to your recipient.
              </p>
              
              <button 
                className="btn-primary" 
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                onClick={handleDownload}
              >
                <Download size={20} />
                Download .chronos File
              </button>
              
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2rem' }}>
                <strong>Warning:</strong> We do not store a copy of your capsule or your passphrase. 
                If you lose either, the data is permanently unrecoverable.
              </p>
            </motion.div>
          )}
        </div>

        <div className="creator-preview">
          <div className="capsule-visual">
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <Hourglass size={48} color="var(--gold-primary)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                {formData.title || "Untitled Capsule"}
              </h3>
              {formData.unlockDate && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Unlocks on: <br/>
                  <strong style={{ color: 'white' }}>{formData.unlockDate}</strong>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CapsuleReader() {
  const [capsule, setCapsule] = useState<ChronosCapsule | null>(null);
  const [error, setError] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [decryptedMessage, setDecryptedMessage] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content) as ChronosCapsule;
        if (!parsed.version || !parsed.metadata || !parsed.hmac) {
          throw new Error("Invalid .chronos file format.");
        }
        setCapsule(parsed);
        setError('');
        setDecryptedMessage(null);
        setPassphrase('');
      } catch (err) {
        setError('Failed to parse .chronos file. It might be corrupted.');
        setCapsule(null);
      }
    };
    reader.readAsText(file);
  };

  let unlockTimestamp = 0;
  if (capsule) {
    const d = capsule.metadata.unlockDate;
    if (d && d.length === 8) {
      const month = d.slice(0, 2);
      const day = d.slice(2, 4);
      const year = d.slice(4, 8);
      unlockTimestamp = new Date(`${year}-${month}-${day}T00:00:00`).getTime();
    }
  }

  const isLocked = capsule ? new Date().getTime() < unlockTimestamp : false;

  const handleUnlock = async () => {
    if (!capsule) return;
    setIsDecrypting(true);
    setError('');
    try {
      const message = await openCapsule(capsule, passphrase);
      setDecryptedMessage(message);
    } catch (err) {
      setError('Decryption failed. Incorrect passphrase or corrupted data.');
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2>Open a Time Capsule</h2>
        <p style={{ color: 'var(--text-muted)' }}>Select a .chronos file to begin</p>
      </div>

      <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
        {!capsule && (
          <div 
            style={{ border: '2px dashed var(--border-light)', borderRadius: '12px', padding: '3rem 1rem', cursor: 'pointer' }}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={48} color="var(--gold-primary)" style={{ margin: '0 auto 1rem' }} />
            <h3>Upload .chronos file</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Drag and drop or click to browse</p>
            <input 
              type="file" 
              accept=".chronos" 
              style={{ display: 'none' }} 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(255,0,50,0.1)', color: '#ff4444', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
            {error}
          </div>
        )}

        {capsule && !decryptedMessage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Hourglass size={48} color="var(--gold-primary)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>{capsule.metadata.title}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Unlocks on: {new Date(unlockTimestamp).toLocaleDateString()}
            </p>

            {isLocked ? (
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px' }}>
                <Lock size={24} color="#ff4444" style={{ margin: '0 auto 1rem' }} />
                <h4 style={{ color: '#ff4444' }}>Time-Lock Active</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  This capsule cannot be opened until {new Date(unlockTimestamp).toLocaleString()}. 
                  The decryption will be rejected by the client software.
                </p>
              </div>
            ) : (
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', textAlign: 'left' }}>
                <div className="form-group">
                  <label>Passphrase</label>
                  <input 
                    type="password" 
                    className="input-field" 
                    placeholder="Enter the secret passphrase"
                    value={passphrase}
                    onChange={e => setPassphrase(e.target.value)}
                  />
                </div>
                {capsule.metadata.hint && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Hint: {capsule.metadata.hint}
                  </p>
                )}
                <button 
                  className="btn-primary" 
                  style={{ width: '100%', marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                  onClick={handleUnlock}
                  disabled={!passphrase || isDecrypting}
                >
                  <Unlock size={18} />
                  {isDecrypting ? "Decrypting..." : "Unlock Capsule"}
                </button>
              </div>
            )}
            
            <button className="btn-secondary" style={{ marginTop: '1.5rem' }} onClick={() => { setCapsule(null); setError(''); }}>
              Upload different file
            </button>
          </motion.div>
        )}

        {decryptedMessage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
              <Unlock size={32} color="var(--gold-primary)" />
              <div>
                <h3 style={{ margin: 0 }}>{capsule?.metadata.title}</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--gold-primary)' }}>Successfully Decrypted</span>
              </div>
            </div>
            
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', minHeight: '200px', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
              {decryptedMessage}
            </div>

            <button className="btn-secondary" style={{ width: '100%', marginTop: '2rem' }} onClick={() => setDecryptedMessage(null)}>
              Close and Lock
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default App;
