'use strict';

const DEBUG = false;
const PROTOCOL_VERSION = '1.3';
const SKIP_CLICK_MESSAGE = 'dispatch-skip-click';
const activeTabClicks = new Set();

function log(...args) {
  if (!DEBUG) return;

  console.log('[YT Ad Speedup]', ...args);
}

function isValidCoordinate(value) {
  return Number.isFinite(value) && value >= 0 && value <= 100000;
}

async function dispatchBrowserClick(tabId, x, y) {
  if (activeTabClicks.has(tabId)) {
    throw new Error('A skip click is already in progress');
  }

  const target = { tabId };
  let attached = false;

  activeTabClicks.add(tabId);

  try {
    await chrome.debugger.attach(target, PROTOCOL_VERSION);
    attached = true;

    await chrome.debugger.sendCommand(target, 'Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x,
      y
    });
    await chrome.debugger.sendCommand(target, 'Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x,
      y,
      button: 'left',
      buttons: 1,
      clickCount: 1
    });
    await chrome.debugger.sendCommand(target, 'Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x,
      y,
      button: 'left',
      buttons: 0,
      clickCount: 1
    });

    log('Browser-level Skip Ad click dispatched');
  } finally {
    if (attached) {
      try {
        await chrome.debugger.detach(target);
      } catch (error) {
        log(`Debugger detach failed: ${error.message}`);
      }
    }

    activeTabClicks.delete(tabId);
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== SKIP_CLICK_MESSAGE) return false;

  const tabId = sender.tab?.id;
  const senderUrl = sender.url || sender.tab?.url || '';

  if (!Number.isInteger(tabId) || !senderUrl.startsWith('https://www.youtube.com/')) {
    sendResponse({ ok: false, error: 'Rejected non-YouTube click request' });
    return false;
  }

  if (!isValidCoordinate(message.x) || !isValidCoordinate(message.y)) {
    sendResponse({ ok: false, error: 'Rejected invalid click coordinates' });
    return false;
  }

  dispatchBrowserClick(tabId, message.x, message.y)
    .then(() => sendResponse({ ok: true }))
    .catch((error) => {
      log(`Browser-level click failed: ${error.message}`);
      sendResponse({ ok: false, error: error.message });
    });

  return true;
});
