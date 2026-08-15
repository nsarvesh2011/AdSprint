# Privacy Policy for YouTube Ad Speedup

Effective date: August 15, 2026

YouTube Ad Speedup is a browser extension that speeds up advertisements during YouTube video playback and activates visible Skip controls according to the user's selected settings.

## Information the extension handles

The extension processes the following information only as needed to provide its functionality:

- The current YouTube page URL, to confirm that extension actions are limited to YouTube pages.
- YouTube video-player content and state, including whether an advertisement is playing, the video's playback rate, and whether a visible Skip control is available.
- The extension's enabled setting and the advertisement speed selected by the user.

The extension does not collect names, email addresses, authentication information, financial information, personal communications, precise location, or keystrokes.

## How information is used

YouTube page information is processed locally in the browser to detect advertisements, adjust playback speed, activate visible Skip controls, and restore the previous playback speed when an advertisement ends.

The extension temporarily uses Chrome's debugger API only when necessary to send a browser-level click to a visible and enabled Skip control on the active YouTube tab. It detaches immediately after the click attempt. It does not use the debugger API to inspect network traffic or extract unrelated page information.

## Storage

The enabled setting and selected advertisement speed are stored using `chrome.storage.sync`. Chrome may synchronize these preferences between browsers where the user is signed in and has synchronization enabled. This storage is provided and managed by Google Chrome.

The developer does not operate a server that receives or stores extension settings, browsing information, or website content.

## Sharing and selling information

The extension does not sell, rent, disclose, or transfer user information to the developer, advertisers, analytics providers, or other third parties. It does not use information for advertising, profiling, creditworthiness, or any purpose unrelated to its stated functionality.

## Remote code

The extension does not download or execute remote code. All executable code is included in the extension package.

## Data retention and control

YouTube page information is processed only while the extension operates on a YouTube page and is not retained by the extension. Users can change the stored enabled setting and advertisement speed through the extension popup. Users can also remove the extension and manage synchronized browser data through their Chrome settings.

## Limited Use

The extension's use of information is limited to providing its single user-facing purpose. The use of information received from Google APIs will adhere to the Chrome Web Store User Data Policy, including the Limited Use requirements.

## Changes to this policy

This policy may be updated if the extension's functionality or data practices change. Updates will be published on this page with a revised effective date.

## Contact

For privacy questions or support, open an issue at:

https://github.com/nsarvesh2011/AdSprint/issues
