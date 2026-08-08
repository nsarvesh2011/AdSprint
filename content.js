(() => {
  'use strict';

  const DEBUG = true;
  const FALLBACK_CHECK_INTERVAL_MS = 1500;

  let adActive = false;
  let observer = null;
  let observedPlayer = null;
  let maintenanceInterval = null;
  let stateCheckScheduled = false;
  let initialized = false;

  function log(...args) {
    if (!DEBUG) return;

    console.log('[YT Ad Speedup]', ...args);
  }

  function getPlayerElement() {
    return (
      document.querySelector('#movie_player.html5-video-player') ||
      document.querySelector('.html5-video-player')
    );
  }

  function isAdPlaying(player = getPlayerElement()) {
    return Boolean(player?.classList.contains('ad-showing'));
  }

  function startAdMode() {
    if (adActive) return;

    adActive = true;
    log('Ad detected');
  }

  function endAdMode() {
    if (!adActive) return;

    adActive = false;
    log('Ad ended');
  }

  function cleanupObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }

    observedPlayer = null;
  }

  function setupObserver(player = getPlayerElement()) {
    if (player === observedPlayer && observer) return;

    cleanupObserver();

    if (!player) return;

    observedPlayer = player;
    observer = new MutationObserver(schedulePlayerStateCheck);
    observer.observe(player, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  function checkPlayerState() {
    const player = getPlayerElement();

    if (player !== observedPlayer) {
      setupObserver(player);
    }

    if (isAdPlaying(player)) {
      startAdMode();
    } else {
      endAdMode();
    }
  }

  function schedulePlayerStateCheck() {
    if (stateCheckScheduled) return;

    stateCheckScheduled = true;

    queueMicrotask(() => {
      stateCheckScheduled = false;
      checkPlayerState();
    });
  }

  function startMaintenanceInterval() {
    if (maintenanceInterval) return;

    maintenanceInterval = setInterval(
      checkPlayerState,
      FALLBACK_CHECK_INTERVAL_MS
    );
  }

  function handleYouTubeNavigation() {
    setupObserver();
    checkPlayerState();
  }

  function init() {
    if (initialized) return;

    initialized = true;
    setupObserver();
    startMaintenanceInterval();
    document.addEventListener('yt-navigate-finish', handleYouTubeNavigation);
    checkPlayerState();

    log('Initialized');
  }

  init();
})();
