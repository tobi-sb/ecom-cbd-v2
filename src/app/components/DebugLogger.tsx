'use client';

import { useState, useEffect } from 'react';
import styles from '../styles.module.css';
import { FaBug } from 'react-icons/fa';

const DebugLogger = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [userAgent, setUserAgent] = useState('');
  const [screenInfo, setScreenInfo] = useState('');

  // Intercepter les logs console
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Sauvegarder les méthodes originales
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;
      const originalConsoleWarn = console.warn;
      const originalConsoleInfo = console.info;

      // Capturer l'user agent
      setUserAgent(window.navigator.userAgent);
      
      // Capturer les infos d'écran
      setScreenInfo(`Width: ${window.innerWidth}px, Height: ${window.innerHeight}px, DPR: ${window.devicePixelRatio}`);

      // Redéfinir console.log
      console.log = function(...args) {
        const logMessage = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ');
        
        setLogs(prevLogs => [...prevLogs, `[LOG] ${logMessage}`]);
        originalConsoleLog.apply(console, args);
      };

      // Redéfinir console.error
      console.error = function(...args) {
        const logMessage = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ');
        
        setLogs(prevLogs => [...prevLogs, `[ERROR] ${logMessage}`]);
        originalConsoleError.apply(console, args);
      };

      // Redéfinir console.warn
      console.warn = function(...args) {
        const logMessage = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ');
        
        setLogs(prevLogs => [...prevLogs, `[WARN] ${logMessage}`]);
        originalConsoleWarn.apply(console, args);
      };

      // Redéfinir console.info
      console.info = function(...args) {
        const logMessage = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ');
        
        setLogs(prevLogs => [...prevLogs, `[INFO] ${logMessage}`]);
        originalConsoleInfo.apply(console, args);
      };

      // Capturer les erreurs non gérées
      window.addEventListener('error', (event) => {
        setLogs(prevLogs => [...prevLogs, `[UNCAUGHT ERROR] ${event.message} at ${event.filename}:${event.lineno}:${event.colno}`]);
      });

      // Capturer les rejets de promesses non gérés
      window.addEventListener('unhandledrejection', (event) => {
        setLogs(prevLogs => [...prevLogs, `[UNHANDLED PROMISE] ${event.reason}`]);
      });

      // Ajouter un log initial
      console.log('DebugLogger initialized');

      // Restaurer les méthodes originales lors du nettoyage
      return () => {
        console.log = originalConsoleLog;
        console.error = originalConsoleError;
        console.warn = originalConsoleWarn;
        console.info = originalConsoleInfo;
      };
    }
  }, []);

  // Fonction pour effacer les logs
  const clearLogs = () => {
    setLogs([]);
  };

  // Fonction pour copier les logs dans le presse-papiers
  const copyLogs = () => {
    const logText = logs.join('\n');
    navigator.clipboard.writeText(logText)
      .then(() => {
        console.log('Logs copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy logs:', err);
      });
  };

  // Ajouter un log de test
  const addTestLog = () => {
    console.log('Test log message');
    console.warn('Test warning message');
    console.error('Test error message');
    
    // Tester la lecture vidéo
    const videoTest = document.createElement('video');
    videoTest.src = "https://test-tobi.s3.eu-north-1.amazonaws.com/version+final+finaliste+.mp4";
    videoTest.muted = true;
    
    videoTest.play()
      .then(() => {
        console.log('Video playback test successful');
        videoTest.pause();
      })
      .catch(error => {
        console.error('Video playback test failed:', error.message);
      });
  };

  return (
    <>
      {/* Bouton de débogage fixe en bas à droite */}
      <div 
        className={styles.debugButton}
        onClick={() => setIsOpen(true)}
      >
        <FaBug />
      </div>

      {/* Modal de logs */}
      {isOpen && (
        <div className={styles.debugModal}>
          <div className={styles.debugModalContent}>
            <div className={styles.debugModalHeader}>
              <h3>Debug Logs</h3>
              <button onClick={() => setIsOpen(false)} className={styles.closeButton}>×</button>
            </div>
            
            <div className={styles.deviceInfo}>
              <p><strong>User Agent:</strong> {userAgent}</p>
              <p><strong>Screen:</strong> {screenInfo}</p>
            </div>
            
            <div className={styles.debugActions}>
              <button onClick={clearLogs} className={styles.debugActionButton}>Clear Logs</button>
              <button onClick={copyLogs} className={styles.debugActionButton}>Copy Logs</button>
              <button onClick={addTestLog} className={styles.debugActionButton}>Test Video</button>
            </div>
            
            <div className={styles.logsContainer}>
              {logs.length === 0 ? (
                <p className={styles.noLogs}>No logs yet. Interact with the site to generate logs.</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className={
                    log.includes('[ERROR]') ? styles.errorLog : 
                    log.includes('[WARN]') ? styles.warnLog : 
                    log.includes('[INFO]') ? styles.infoLog : 
                    styles.standardLog
                  }>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DebugLogger;
