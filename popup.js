(() => {
  'use strict';

  const DEFAULT_SETTINGS = Object.freeze({
    enabled: true,
    adSpeed: 4.5
  });
  const AVAILABLE_SPEEDS = new Set([2, 3, 4, 4.5, 10, 16]);

  const enabledInput = document.querySelector('#enabled');
  const speedSelect = document.querySelector('#ad-speed');
  const status = document.querySelector('#status');

  function getPopupSpeed(value) {
    const parsed = Number(value);

    return AVAILABLE_SPEEDS.has(parsed) ? parsed : DEFAULT_SETTINGS.adSpeed;
  }

  function setStatus(message, isError = false) {
    status.textContent = message;
    status.classList.toggle('status-error', isError);
  }

  function renderSettings(settings) {
    enabledInput.checked = settings.enabled;
    speedSelect.value = String(settings.adSpeed);
  }

  function setControlsDisabled(disabled) {
    enabledInput.disabled = disabled;
    speedSelect.disabled = disabled;
  }

  async function saveSetting(key, value) {
    try {
      await chrome.storage.sync.set({ [key]: value });
      setStatus('Saved. Changes apply immediately.');
    } catch (error) {
      setStatus(`Could not save settings: ${error.message}`, true);
    }
  }

  async function init() {
    setControlsDisabled(true);

    try {
      const storedSettings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
      const settings = {
        enabled:
          typeof storedSettings.enabled === 'boolean'
            ? storedSettings.enabled
            : DEFAULT_SETTINGS.enabled,
        adSpeed: getPopupSpeed(storedSettings.adSpeed)
      };

      renderSettings(settings);
      setStatus('Settings sync with Chrome.');
    } catch (error) {
      renderSettings(DEFAULT_SETTINGS);
      setStatus(`Using defaults: ${error.message}`, true);
    } finally {
      setControlsDisabled(false);
    }

    enabledInput.addEventListener('change', () => {
      saveSetting('enabled', enabledInput.checked);
    });

    speedSelect.addEventListener('change', () => {
      const speed = getPopupSpeed(speedSelect.value);

      speedSelect.value = String(speed);
      saveSetting('adSpeed', speed);
    });
  }

  init();
})();
