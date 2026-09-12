# Winamp YouTube Web Player (with Pitchfork High-Granularity Control)

An embedded YouTube web player interface replicating the iconic **Winamp 2.x Classic Skin** paired with the **PaceMaker / Pitchfork** DSP plugin for fine-grained audio tempo, speed, and pitch control.

---

## 🎯 Target UI & Design References

This project aims to faithfully duplicate the aesthetic and layout of Winamp 2.x and its classic audio DSP plugins.

### Current UI Prototype
The prototype recreates the classic Winamp main window (dark metallic panels, bevelled buttons, green/yellow LED matrix display, spectrum visualization) alongside a Pitchfork/PaceMaker-style plugin window with high-precision Speed, Pitch, and Tempo sliders, plus a playlist/video window.

![Winamp YouTube Player UI Prototype](screenshot-ui.png)
*(Live screenshot of the current HTML5/CSS prototype in this repo)*

---

## 🚀 Project Overview & Architecture

### Current Stage: HTML5 / CSS UI Prototype
* **Standalone UI (`index.html`, `styles.css`):** Pixel-styled HTML5 layout mimicking the classic Winamp main window, equalizers, playlist, and Pitchfork plugin deck.
* **Granular Controls:** Speed slider configured for high-precision steps (`0.005x` increments), semitone pitch adjustments, and tempo sliders.

### Planned Stack & Capabilities
* **Rust + WebAssembly (Wasm):** Rust application state management, playlist handling, keyboard shortcuts, and player logic.
* **YouTube IFrame API / Browser Extension Interop:**
  * Standard YouTube IFrame API integration for basic playback.
  * Browser extension component (Chromium / Edge / Brave / Firefox) to bypass cross-origin iframe security boundaries and directly manipulate `HTMLVideoElement.playbackRate` with arbitrary float precision (`0.0625x` to `16.0x`).

---

## 🖥️ How to Preview the UI

Simply open `index.html` in any web browser:

```bash
# Double-click index.html or open via local HTTP server
npx serve .
# or
python3 -m http.server 8000
```

---

## 📁 Repository Structure

```
winamp-youtube-player/
├── index.html        # HTML5 layout of Winamp & Pitchfork UI
├── styles.css        # Retro Winamp classic skin stylesheet
├── screenshot-ui.png # Screenshot of the current UI prototype
└── README.md         # Project documentation & reference images
```
