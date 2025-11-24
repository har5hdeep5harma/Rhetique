# Rhetique


A sophisticated React application for professional-level linguistic and rhetorical analysis of speeches. Powered by AI with the rigor of academic linguistics and the artistry of classical rhetoric.

## Check out the live demo: [rhetique.app](https://rhetique.vercel.app/)

## Features

- **9 Integrated Analytical Layers**: Comprehensive linguistic analysis from phonetics to pragmatics
  - **Linguistic Layers**: Phonetic–Phonological, Morpho–Lexical, Syntactic
  - **Semantic Layers**: Semantic Analysis, Pragmatic Intent
  - **Rhetorical Layers**: Classical Rhetoric (Ethos–Pathos–Logos–Kairos), Cognitive Processing, Metarhetoric
  - **Affective Layer**: Affective & Mnemonic Analysis
  - **Global Synthesis**: Comprehensive Rhetorical DNA profile
- **Academic-Quality Output**: Analysis reads like expert scholarly work with poetic clarity
- **AI-Powered**: Currently optimized for Groq (Llama 3.3), with support for Gemini and OpenAI
- **Professional UI**: Dark mode interface with color-coded layer groups and real-time progress
- **PDF Export**: Generate publication-ready PDF reports with formatted analysis
- **Responsive Design**: Clean, professional layout with smooth animations

## Tech Stack

- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **PDF Generation**: jsPDF + html2canvas
- **State Management**: Custom React Hooks

## Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Setup

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

## Usage

1. **Enter Groq API Key**: Get your free API key at [console.groq.com/keys](https://console.groq.com/keys)
2. **Enter Orator Name**: Name of the speaker being analyzed (e.g., "Richard Feynman")
3. **Paste Transcript**: The complete speech transcript or dialogue
4. **Click "Analyze Speech"**: The engine will execute all 9 analytical layers sequentially
5. **Review Results**: Each layer appears as it completes with color-coded cards
6. **Export to PDF**: Generate a comprehensive PDF report of the complete analysis

## What Makes This Different

This is not a simple sentiment analyzer or keyword counter. The Rhetorical Intelligence Engine performs:

- **Phonetic Analysis**: Sound patterns, rhythm, prosody (like a linguist)
- **Lexical Analysis**: Word frequency, semantic fields, cohesion (like a lexicographer)
- **Syntactic Analysis**: Sentence structure, complexity, rhythm (like a grammarian)
- **Semantic Analysis**: Metaphors, analogies, conceptual recursions (like a semanticist)
- **Pragmatic Analysis**: Speech acts, illocutionary force (like a pragmatist)
- **Rhetorical Analysis**: Ethos, pathos, logos, kairos (like a classical rhetorician)
- **Cognitive Analysis**: Information flow, curiosity loops (like a cognitive scientist)
- **Metarhetoric**: Self-reflexivity, thought modeling (like a philosopher)
- **Affective Analysis**: Emotional valence, mnemonic structures (like a psycholinguist)

The output reads like an academic paper meets literary criticism.

## API Keys

Currently optimized for **Groq** (free tier available):

- **Groq** (Recommended): https://console.groq.com/keys
  - Fast inference with Llama 3.3 70B
  - Free tier available
  - Optimized for linguistic analysis

API keys are entered directly in the application and are **not stored** anywhere - they're only used for the current session.

## Security Notes

- API keys are only stored in memory during the session
- No data is sent to any backend server
- All API calls are made directly from the browser to the respective LLM providers
- For production deployment, consider implementing rate limiting or using a backend proxy for API calls

## Project Structure

```
/src
  /components
    Sidebar.jsx          # API configuration and controls
    ReportFeed.jsx       # Analysis results display
    AnalysisCard.jsx     # Individual analysis layer card
    ProgressBar.jsx      # Analysis progress indicator
  /hooks
    useAnalysisEngine.js # Core analysis logic and state management
  /utils
    apiClients.js        # API abstraction for LLM providers
    pdfExporter.js       # PDF generation logic
  /data
    masterPrompt.js      # Master system prompt and analysis steps
  App.jsx                # Main application layout
  main.jsx               # Application entry point
  index.css              # Global styles and Tailwind directives
```

## Customization

### Modify Analysis Steps

Edit `src/data/masterPrompt.js` to customize:
- The master system prompt
- Analysis step titles and instructions
- Number of analysis layers

### Styling

- Update `tailwind.config.js` for theme customization
- Modify component styles in individual `.jsx` files
- Edit `src/index.css` for global styles

## Troubleshooting

### Build Errors

If you encounter build errors, try:
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### API Errors

- Verify your API key is correct
- Check rate limits for your API provider
- Ensure you have sufficient credits/quota
- Check browser console for detailed error messages

### PDF Export Issues

- Ensure all analysis cards have completed rendering
- Try waiting a few seconds after analysis completes before exporting
- Check browser console for canvas/PDF generation errors
