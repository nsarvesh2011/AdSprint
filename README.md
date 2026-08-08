# YouTube Ad Speedup

Manifest V3 scaffold for a dependency-free Chrome extension that will speed up
YouTube ads and click visible Skip Ad controls.

The extension behavior has not been implemented yet. This commit contains only
the loadable package structure.

## Load locally

1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this `AdSprint` folder.
5. Pin or open the extension to confirm its placeholder popup appears.

## Reload after a change

1. Open `chrome://extensions`.
2. Click **Reload** on the YouTube Ad Speedup extension card.
3. Refresh any open YouTube tabs when content-script code changes.

## Planned implementation passes

1. Ad detection, capped playback speed, restoration, and state-change logging.
2. Safe detection and clicking of visible Skip Ad controls.
3. Persistent enable and speed settings in the popup.
