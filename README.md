# YouTube Ad Speedup

A lightweight Chrome extension that speeds up YouTube ads and automatically
clicks visible Skip Ad controls.

## Features

- Detects when a YouTube ad is playing.
- Speeds up ads to a maximum of 16x.
- Clicks an official Skip Ad button when it becomes visible and enabled.
- Restores the user's previous playback speed when the ad ends.
- Continues working when navigating between YouTube videos.
- Provides an enable toggle and 2x, 3x, 4x, 4.5x, 10x, and 16x ad-speed
  settings.
- Applies synced setting changes without reloading YouTube.
- Does not block or intercept ad requests.

## Load locally

1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this `AdSprint` folder.
5. Open YouTube and play a video.

## Verify behavior

### Playback speed

1. Open Chrome DevTools on a YouTube page.
2. Select the **Console** tab.
3. Filter the Console using `YT Ad Speedup`.
4. Play a video that receives an ad.

Expected logs include:

```text
[YT Ad Speedup] Initialized
[YT Ad Speedup] Ad detected
[YT Ad Speedup] Playback rate set to 4.5x
[YT Ad Speedup] Restored playback rate to 1x
[YT Ad Speedup] Ad ended
```

### Automatic skipping

1. Close DevTools on the YouTube tab so it does not conflict with the
   extension's short-lived debugger connection.
2. Play a video that receives a skippable ad.
3. Confirm the visible Skip Ad control is activated automatically.

## Permissions

- `storage` is included for persistent extension settings.
- `debugger` dispatches browser-level mouse input to a validated, visible Skip
  Ad control. The extension attaches only to the relevant YouTube tab and
  detaches immediately after sending the click.

## Reload after a change

1. Open `chrome://extensions`.
2. Click **Reload** on the YouTube Ad Speedup extension card.
3. Refresh any open YouTube tabs when content-script code changes.

The extension relies on YouTube's rendered player and controls. Future changes
to YouTube's page structure may require corresponding extension updates.
