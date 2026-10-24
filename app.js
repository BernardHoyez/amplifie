(() => {
  'use strict';

  // --- DOM ---
  const toggleBtn = document.getElementById('toggleBtn');
  const btnIcon = document.getElementById('btnIcon');
  const btnLabel = document.getElementById('btnLabel');
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const gainSlider = document.getElementById('gainSlider');
  const gainValue = document.getElementById('gainValue');

  // --- State ---
  let audioCtx = null;
  let mediaStream = null;
  let sourceNode = null;
  let gainNode = null;
  let isRunning = false;

  // --- UI helpers ---
  function setStatus(text, state = 'idle') {
    statusText.textContent = text;
    statusDot.classList.remove('active', 'error');
    if (state === 'active') statusDot.classList.add('active');
    if (state === 'error') statusDot.classList.add('error');
  }

  function setButtonRunning(running) {
    isRunning = running;
    if (running) {
      toggleBtn.classList.add('running');
      btnIcon.textContent = '■';
      btnLabel.textContent = 'Arrêter';
    } else {
      toggleBtn.classList.remove('running');
      btnIcon.textContent = '▶';
      btnLabel.textContent = 'Démarrer';
    }
  }

  // --- Audio ---
  async function start() {
    try {
      setStatus('Autorisation micro…', 'idle');

      // Request microphone (prefer voice isolation if available)
      const constraints = {
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          channelCount: 1
        },
        video: false
      };

      mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      sourceNode = audioCtx.createMediaStreamSource(mediaStream);
      gainNode = audioCtx.createGain();
      gainNode.gain.value = parseFloat(gainSlider.value);

      // Mic → Gain → Destination (speakers / Bluetooth)
      sourceNode.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      setButtonRunning(true);
      setStatus('Amplification active', 'active');
    } catch (err) {
      console.error(err);
      stop();
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setStatus('Permission micro refusée', 'error');
      } else if (err.name === 'NotFoundError') {
        setStatus('Aucun micro trouvé', 'error');
      } else {
        setStatus('Erreur : ' + (err.message || err.name), 'error');
      }
    }
  }

  function stop() {
    if (sourceNode) {
      try { sourceNode.disconnect(); } catch (_) {}
      sourceNode = null;
    }
    if (gainNode) {
      try { gainNode.disconnect(); } catch (_) {}
      gainNode = null;
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach(t => t.stop());
      mediaStream = null;
    }
    if (audioCtx) {
      audioCtx.close().catch(() => {});
      audioCtx = null;
    }
    setButtonRunning(false);
    setStatus('Arrêté', 'idle');
  }

  // --- Events ---
  toggleBtn.addEventListener('click', () => {
    if (isRunning) {
      stop();
    } else {
      start();
    }
  });

  gainSlider.addEventListener('input', () => {
    const v = parseFloat(gainSlider.value);
    gainValue.textContent = v.toFixed(1) + '×';
    if (gainNode) {
      gainNode.gain.setTargetAtTime(v, audioCtx.currentTime, 0.05);
    }
  });

  // Clean up on page hide / unload
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && isRunning) {
      // Optional: keep running in background on mobile if possible
    }
  });

  window.addEventListener('beforeunload', () => {
    if (isRunning) stop();
  });

  // --- Service Worker registration (cache-bust) ---
  if ('serviceWorker' in navigator) {
    // Always register with a cache-busting query to force update check
    const swUrl = 'sw.js?v=' + Date.now();
    navigator.serviceWorker.register(swUrl, { scope: './' })
      .then(reg => {
        console.log('SW registered', reg.scope);
        // Force check for updates
        reg.update();
      })
      .catch(err => console.warn('SW registration failed', err));
  }

  // Initial UI
  setStatus('Prêt', 'idle');
  gainValue.textContent = parseFloat(gainSlider.value).toFixed(1) + '×';
})();
