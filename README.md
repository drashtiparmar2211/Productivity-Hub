# 🚀 Productivity Hub - Vadodara Edition

A modern, glassmorphic productivity dashboard that adapts its visual identity based on the **seasons and festivals of Vadodara, Gujarat**.

## ✨ Key Features
- **Adaptive UI:** The theme colors and background animations change automatically (e.g., Kites for Uttarayan, Rain for Monsoon).
- **Glassmorphic Design:** Sleek, translucent interface for a high-end feel.
- **2026 Ready:** Precise festival logic for the upcoming year.
- **Mobile Responsive:** Optimized for both desktop and mobile devices.

## 🎨 Seasonal Themes
| Season/Festival | Primary Color | Particle Effect |
| :--- | :--- | :--- |
| **Monsoon** | Sky Blue | Falling Raindrops |
| **Navratri** | Marigold Orange | Sparkles & Dandiya |
| **Uttarayan** | Sky Blue | Flying Kites |
| **Autumn** | Burnt Orange | Falling SVG Leaves |

## 🛠️ Tech Stack
- **HTML5** & **CSS3** (Advanced Keyframe Animations)
- **Vanilla JavaScript** (DOM Manipulation & Date Logic)
- **SVG Pathing** (For organic leaf animations)

### 🧠 Logic Overview
The application uses a custom JavaScript engine to monitor the current date and match it against the Vadodara cultural calendar. 

- **Festival Priority:** If a festival date is detected (e.g., Jan 14 for Uttarayan), the festival theme overrides the seasonal theme.
- **Dynamic CSS Variables:** Instead of rewriting styles, the JS updates `:root` CSS variables. This ensures that every UI element (buttons, borders, icons) remains consistent with the active theme.
- **Performance-First Particles:** Animations are offloaded to the browser's GPU using CSS keyframes, ensuring smooth performance even on mobile devices.
