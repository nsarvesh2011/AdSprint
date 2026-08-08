(() => {
  'use strict';

  const DEBUG = true;
  const MAX_AD_SPEED = 4.5;
  const DEFAULT_AD_SPEED = 4.5;
  const ACTIVE_CHECK_INTERVAL_MS = 400;
  const IDLE_CHECK_INTERVAL_MS = 1500;

  let adActive = false;
  let previousPlaybackRate = 1;
  let observer = null;
  let observedPlayer = null;
  let maintenanceInterval = null;
  let maintenanceIntervalMs = null;
  let stateCheckScheduled = false;
  let initialized = false;

  function log(...args) {
    if (!DEBUG) return;

    console.log('[YT Ad Speedup]', ...args);
  }

  function getSafeAdSpeed(speed) {
    const parsed = Number(speed);

    if (!Number.isFinite(parsed)) {
      return DEFAULT_AD_SPEED;
    }

    return Math.max(1, Math.min(parsed, MAX_AD_SPEED));
  }

  function getPlayerElement() {
    return (
      document.querySelector('#movie_player.html5-video-player') ||
      document.querySelector('.html5-video-player')
    );
  }

  function getVideoElement(player = getPlayerElement()) {
    return player?.querySelector('video.html5-main-video') || null;
  }

  function isAdPlaying(player = getPlayerElement()) {
    return Boolean(player?.classList.contains('ad-showing'));
  }

  function startAdMode() {
    if (adActive) return;

    const video = getVideoElement();

    if (!video) return;

    previousPlaybackRate = video.playbackRate || 1;
    adActive = true;

    const speed = getSafeAdSpeed(DEFAULT_AD_SPEED);
    video.playbackRate = speed;

    log('Ad detected');
    log(`Playback rate set to ${speed}x`);
    startMaintenanceInterval(ACTIVE_CHECK_INTERVAL_MS);
  }

  function maintainAdMode() {
    if (!adActive) return;

    const video = getVideoElement();

    if (!video) return;

    const targetSpeed = getSafeAdSpeed(DEFAULT_AD_SPEED);

    if (video.playbackRate !== targetSpeed) {
      video.playbackRate = targetSpeed;
      log(`Playback rate restored to ${targetSpeed}x`);
    }
  }

  function endAdMode() {
    if (!adActive) return;

    const video = getVideoElement();

    if (video) {
      video.playbackRate = previousPlaybackRate;
      log(`Restored playback rate to ${previousPlaybackRate}x`);
    }

    adActive = false;
    previousPlaybackRate = 1;

    log('Ad ended');
    startMaintenanceInterval(IDLE_CHECK_INTERVAL_MS);
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
      maintainAdMode();
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

  function startMaintenanceInterval(intervalMs = IDLE_CHECK_INTERVAL_MS) {
    if (maintenanceInterval && maintenanceIntervalMs === intervalMs) return;

    if (maintenanceInterval) {
      clearInterval(maintenanceInterval);
    }

    maintenanceIntervalMs = intervalMs;
    maintenanceInterval = setInterval(checkPlayerState, intervalMs);
  }

  function handleYouTubeNavigation() {
    setupObserver();
    checkPlayerState();
  }

  function init() {
    if (initialized) return;

    initialized = true;
    setupObserver();
    startMaintenanceInterval(IDLE_CHECK_INTERVAL_MS);
    document.addEventListener('yt-navigate-finish', handleYouTubeNavigation);
    checkPlayerState();

    log('Initialized');
  }

  init();
})();
