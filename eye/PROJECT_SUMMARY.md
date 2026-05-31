# Project Summary: The Asemic Eye (6-Month Exhibit)

This document summarizes the technical and artistic iterations made to ensure the "Asemic Eye" installation runs autonomously and stably on a Samsung Tab A for a 6-month art exhibit.

## 🚀 Current Production Version
- **File:** `asemic_eye_v3_auto.html`
- **Dependency:** `sound.mp3` (must be in the same directory)
- **Deployment Mode:** 100% Autonomous (No user interaction required to start audio or animation).

---

## 🛠 Technical Improvements

### 1. Long-Term Stability (The "6-Month Shield")
- **Base64 Asset Inlining:** The `eye2.png` (iris) is hardcoded into the HTML. This prevents "file not found" errors during months of uptime.
- **24-Hour Watchdog:** The page automatically reloads every 24 hours (`location.reload()`) to clear memory leaks and GPU fragmentation.
- **Heartbeat Monitor:** A background interval checks if the `requestAnimationFrame` loop has stalled (due to tablet sleep/hiccup) and restarts the animation if necessary.
- **FPS Limiter:** Fixed at **30 FPS** to reduce CPU/GPU load and prevent the tablet from overheating.
- **Hardware Acceleration:** Uses `translate3d`, `backface-visibility: hidden`, and `perspective: 1000px` to ensure the weak Tab A GPU handles the rendering.

### 2. Biological Realism (V2 & V3 Refinements)
- **Parallax Shine:** The glint (shine) moves at a different rate than the iris, creating a 3D depth effect (cornea over iris).
- **Pupillary Breathing:** The pupil subtly pulses (5% scale change) to simulate biological life.
- **Lid Shadows:** Replaced CSS "glow" with a realistic linear-gradient shadow that follows the eyelid movement.
- **Organic Sclera:** The "white" of the eye has a warm, fleshy gradient (`#f2e6e6` to `#cfbebe`) instead of pure digital white.
- **Iris Bleed Fix:** The iris image is scaled to **106%** inside a clipped container to hide "white ring" artifacts from the original PNG edge.
- **Smooth Gaze:** Removed "Saccadic Jitter" to ensure fluid, non-glitchy movement on the tablet screen.

### 3. Audio Implementation
- **Autonomous Start:** Uses an `autoplay` loop with a background **Retry Loop** that attempts to trigger `sound.mp3` every 1 second until the browser/OS allows it.
- **Zero-Touch UI:** Removed all "Touch to Start" prompts for a true hands-off exhibit.

---

## ⚙️ Mandatory Fully Kiosk Settings
To ensure the autonomous logic works, the following must be enabled in the **Fully Kiosk Browser** app:
1. **Web Content Settings > Autoplay HTML5 video/audio** (ON)
2. **Web Content Settings > Enable JavaScript Interface** (ON)
3. **Web Content Settings > Play Video/Audio in Background** (ON)
4. **Device Management > Keep Screen On** (ON)
5. **Advanced Web Settings > Allow Cross-Origin Requests** (ON)

---

## 📝 Future Suggestions (V4 Ideas)
- **Subliminal Asemic Drifting:** Enhance the floating symbols to appear and disappear based on the 24h clock.
- **Environmental Awareness:** If a camera is connected, use basic motion detection to make the eye "look" at people (though this may impact 6-month stability).
- **Time-of-Day Moods:** Change the `lidBase` (tiredness) based on the actual hour of the day (narrower lids at night).

---
*Last Updated: Thursday, March 19, 2026*
