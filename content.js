(() => {
  'use strict';

  const DEBUG = true;
  const MAX_AD_SPEED = 4.5;
  const DEFAULT_AD_SPEED = 4.5;
  const ACTIVE_CHECK_INTERVAL_MS = 400;
  const IDLE_CHECK_INTERVAL_MS = 1500;
  const SKIP_CLICK_COOLDOWN_MS = 1000;
  const SKIP_CONTROL_RESET_MS = 1500;
  const SKIP_SELECTORS = [
    'button.ytp-ad-skip-button',
    'button.ytp-ad-skip-button-modern',
    'button.ytp-skip-ad-button',
    '.ytp-ad-skip-button button',
    '.ytp-ad-skip-button-modern button',
    '.ytp-skip-ad-button button'
  ];
  const SKIP_LABELS = new Set(['skip', 'skip ad', 'skip ads']);

  let adActive = false;
  let previousPlaybackRate = 1;
  let lastSkipClick = 0;
  let lastSkipButtonSeenAt = 0;
  let skipClickLocked = false;
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

  function isVisibleAndEnabled(element) {
    if (!element) return false;

    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    const visible =
      !element.hidden &&
      !element.closest('[aria-hidden="true"]') &&
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.visibility !== 'collapse' &&
      Number.parseFloat(style.opacity) > 0 &&
      style.pointerEvents !== 'none' &&
      rect.width > 0 &&
      rect.height > 0;
    const disabled =
      element.disabled ||
      element.matches(':disabled') ||
      element.getAttribute('aria-disabled') === 'true' ||
      Boolean(element.closest('[inert]'));

    return visible && !disabled;
  }

  function normalizeSkipLabel(value) {
    return value?.trim().toLowerCase().replace(/\s+/g, ' ') || '';
  }

  function hasReadySkipLabel(button) {
    const labels = [
      button.getAttribute('aria-label'),
      button.getAttribute('title'),
      button.textContent
    ];

    return labels.some((label) =>
      SKIP_LABELS.has(normalizeSkipLabel(label))
    );
  }

  function getSkipButton(player = getPlayerElement()) {
    if (!player) return null;

    for (const selector of SKIP_SELECTORS) {
      for (const button of player.querySelectorAll(selector)) {
        if (hasReadySkipLabel(button) && isVisibleAndEnabled(button)) {
          return button;
        }
      }
    }

    for (const button of player.querySelectorAll('button')) {
      if (hasReadySkipLabel(button) && isVisibleAndEnabled(button)) {
        return button;
      }
    }

    return null;
  }

  function trySkipAd() {
    if (!adActive) return;

    const now = Date.now();
    const button = getSkipButton();

    if (!button) {
      if (
        skipClickLocked &&
        now - lastSkipButtonSeenAt >= SKIP_CONTROL_RESET_MS
      ) {
        skipClickLocked = false;
      }

      return;
    }

    lastSkipButtonSeenAt = now;

    if (
      skipClickLocked ||
      now - lastSkipClick < SKIP_CLICK_COOLDOWN_MS
    ) {
      return;
    }

    skipClickLocked = true;
    lastSkipClick = now;

    log('Skip button detected');
    button.click();
    log('Skip button clicked');
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

    trySkipAd();
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
    lastSkipClick = 0;
    lastSkipButtonSeenAt = 0;
    skipClickLocked = false;

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

  function handlePlayerMutations(mutations) {
    const stateMayHaveChanged = mutations.some(
      (mutation) =>
        mutation.type === 'childList' || mutation.target === observedPlayer
    );

    if (stateMayHaveChanged) {
      schedulePlayerStateCheck();
    }
  }

  function setupObserver(player = getPlayerElement()) {
    if (player === observedPlayer && observer) return;

    cleanupObserver();

    if (!player) return;

    observedPlayer = player;
    observer = new MutationObserver(handlePlayerMutations);
    observer.observe(player, {
      attributes: true,
      attributeFilter: ['class'],
      childList: true,
      subtree: true
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
