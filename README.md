# 📓 Study Log (Diario de Estudio)

A minimalist, didactic, and static web application to log daily study sessions, track study streaks, and visualize learning consistency over time.

This project is intentionally designed so anyone learning to code can read, understand, and modify the codebase without dealing with unnecessary tooling or complex configurations.

---

## 🚀 Features

- **Session logging:** Record study date, topic, and duration in minutes.
- **Streak calculation:** Tracks consecutive study days and records your all-time best streak.
- **Local metrics:** Weekly totals and monthly session counts computed strictly in the user's local timezone.
- **Visual progress:** Includes a GitHub-style heat-map reflecting study volume over recent weeks.
- **Privacy & local-first:** All data stays directly in your browser (`localStorage`). No trackers, third-party cookies, or remote databases.
- **Zero build steps:** Works immediately by double-clicking `index.html` (`file://`).

---

## 🛠 Tech Stack

- **HTML5:** Semantic, accessible layout (`index.html`).
- **CSS3:** Clean, responsive styling for mobile and desktop screens (`styles.css`).
- **Pure JavaScript (Vanilla ES6):** Core logic and data persistence without libraries, frameworks, or bundlers (`app.js`).

> **Core stack principle:** Zero dependencies (`node_modules`), no bundlers (Vite, Webpack), no transpilers, and no required local development servers.

---

## 📂 Project Structure

```text
diario-estudio/
├── docs/
│   └── constitution.md        # Core non-negotiable architectural principles
├── specs/                     # Spec-Driven Development (SDD) workspace
│   ├── 001-heat-map/          # Spec, plan, and tasks for the heat map
│   └── ...                    # Future specification packages
├── tests/                     # Unit tests run via Node's native test runner
│   └── app.test.js
├── .opencode/                 # Custom commands and skills for AI assistants
├── AGENTS.md                  # Project rules and agent development guidelines
├── MEMORY.md                  # Short working memory of decisions and active status
├── index.html                 # Main interface
├── styles.css                 # Responsive styles
├── app.js                     # Business logic and DOM handling
└── README.md
