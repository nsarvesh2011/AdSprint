# YouTube Ad Speedup

A lightweight Chrome extension that speeds up YouTube ads and automatically
clicks visible Skip Ad controls.

## Features

- Detects when a YouTube ad is playing.
- Speeds up ads to a maximum of 4.5x.
- Clicks an official Skip Ad button when it becomes visible and enabled.
- Restores the user's previous playback speed when the ad ends.
- Continues working when navigating between YouTube videos.
- Does not block or intercept ad requests.

## Load locally

1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this `AdSprint` folder.
5. Open YouTube and play a video.

## Verify behavior

1. Open Chrome DevTools on a YouTube page.
2. Select the **Console** tab.
3. Filter the Console using `YT Ad Speedup`.
4. Play a video that receives an ad.

Expected logs include:

```text
[YT Ad Speedup] Initialized
[YT Ad Speedup] Ad detected
[YT Ad Speedup] Playback rate set to 4.5x
[YT Ad Speedup] Skip button detected
[YT Ad Speedup] Skip button clicked
[YT Ad Speedup] Restored playback rate to 1x
[YT Ad Speedup] Ad ended
```

## Reload after a change

1. Open `chrome://extensions`.
2. Click **Reload** on the YouTube Ad Speedup extension card.
3. Refresh any open YouTube tabs when content-script code changes.

The extension relies on YouTube's rendered player and controls. Future changes
to YouTube's page structure may require corresponding extension updates.
