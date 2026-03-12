# Pixel AI Chatbot

A retro 8-bit pixel art styled AI chat interface built with React 18+ and Tailwind CSS.

![Pixel AI Chatbot](https://img.shields.io/badge/React-18.3.1-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38b2ac?style=flat-square&logo=tailwind-css)

## ✨ Features

- 🎮 **Authentic Pixel Art Style** - 8-bit retro aesthetic with "Press Start 2P" font
- 🎨 **Neon Color Palette** - Cyberpunk-inspired cyan, magenta, green, and orange
- 💬 **Chat Interface** - Clean layout similar to ChatGPT/Claude
- ⌨️ **Keyboard Shortcuts** - Enter to send, Shift+Enter for new line
- ⏳ **Loading States** - Blinking "SAM is thinking..." animation
- 📱 **Responsive Design** - Works on mobile and desktop
- 🔌 **Backend Integration** - Connected to FastAPI backend with ReACT agent
- 🔄 **Auto Fallback** - Automatically falls back to simulation if backend is unavailable

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Navigate to the frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment (optional)**
   - Copy `.env.example` to `.env`
   - Edit `VITE_API_URL` if your backend is on a different port
   ```bash
   cp .env.example .env
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Visit `http://localhost:5173`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── App.tsx          # Main chat component
│   ├── App.css          # App-specific styles
│   ├── main.tsx         # Entry point
│   ├── index.css        # Global pixel styles
│   └── vite-env.d.ts    # TypeScript declarations
├── index.html           # HTML template
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── tailwind.config.js   # Tailwind configuration
├── vite.config.ts       # Vite configuration
└── README.md            # This file
```

## 🎨 Design Features

### Pixel Art Elements

- **Font**: "Press Start 2P" from Google Fonts
- **Borders**: 4px solid borders with offset shadows
- **Colors**: 
  - Background: `#0a0a0f` (deep black-purple)
  - Primary: `#00ffff` (cyan)
  - Secondary: `#ff00ff` (magenta)
  - Accent: `#00ff00` (green)
  - Warning: `#ff9900` (orange)

### Animations

- Button hover/active states with pixel-perfect位移
- Blinking loading indicator
- Smooth message slide-in effects
- Neon glow pulsing

### Message Bubbles

- **User**: Magenta background with cyan shadow (right-aligned)
- **AI**: Cyan background with magenta shadow (left-aligned)
- Both feature thick white borders and pixelated corners

## 🛠️ Customization

### Change Colors

Edit `tailwind.config.js`:

```js
colors: {
  'pixel-bg': '#0a0a0f',      // Background
  'pixel-primary': '#00ffff',  // AI bubbles
  'pixel-secondary': '#ff00ff',// User bubbles
  'pixel-accent': '#00ff00',   // Accents
  'pixel-warning': '#ff9900',  // Warnings
}
```

### Modify AI Responses

Edit `src/App.tsx`:

```ts
const SIMULATED_RESPONSES = [
  "Your custom response here",
  "Another response...",
]
```

### Adjust Response Delay

In `src/App.tsx`, modify the `simulateAIResponse` function:

```ts
const delay = Math.floor(Math.random() * 1000) + 1000 // 1-2 seconds
```

## 🔌 Backend Integration

The frontend is now connected to a FastAPI backend (`/backend` directory):

### Backend Features
- **ReACT Agent** - Full integration with `src.agent.ConversationAgent`
- **Tool Support** - Access to all MCP tools and skills
- **Memory Management** - Persistent conversation history
- **Auto Fallback** - Frontend falls back to simulation if backend is unavailable

### Starting the Backend

1. **Navigate to project root**
   ```bash
   cd ..
   ```

2. **Ensure dependencies are installed**
   ```bash
   uv sync
   ```

3. **Start the backend server**
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

4. **Backend will be available at**
   - API: `http://localhost:8000`
   - Docs: `http://localhost:8000/docs`

### API Endpoints

- `POST /api/chat` - Send a message and get AI response
- `POST /api/reset` - Reset conversation history
- `GET /api/health` - Health check

## 📝 TODO: Future Enhancements

- [ ] **Clear Chat Button** - UI button to reset conversation
- [ ] **Chat History** - Save/load previous conversations
- [ ] **Markdown Support** - Render formatted text in messages
- [ ] **Code Highlighting** - Syntax highlighting for code blocks
- [ ] **Export Chat** - Download conversation as text/image
- [ ] **Theme Switcher** - Toggle between pixel themes
- [ ] **Sound Effects** - Retro 8-bit SFX on send/receive
- [ ] **Emoji Support** - Pixel art emoji picker
- [ ] **Typing Indicator** - Show when AI is "typing"

## 🎯 Technical Details

### Built With

- **React 18.3.1** - UI framework with hooks
- **TypeScript 5.6** - Type safety
- **Tailwind CSS 3.4** - Utility-first styling
- **Vite 5.4** - Fast build tool
- **Lucide React** - Icon library

### Key Components

1. **Message Interface** - TypeScript interface for chat messages
2. **Auto-scroll** - Automatically scrolls to latest message
3. **Textarea Auto-resize** - Grows with content (max 120px)
4. **Loading State** - Disables input while AI "thinks"
5. **Error Handling** - Graceful error messages

## 📄 License

MIT License - Feel free to use this in your projects!

## 🙏 Credits

Inspired by:
- Pixelact UI (pixelactui.com)
- Classic 8-bit video games
- Cyberpunk aesthetics

---

**Made with 💖 and pixel power**

*Need backend integration or additional features? Just ask!*
