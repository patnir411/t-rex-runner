# Setup Guide - Gemini 2.5 Flash Image Sprite Pipeline

**Complete setup instructions for the AI sprite generation pipeline**

---

## Prerequisites

### Required Software

- **Python 3.7+**
- **Node.js 18+**
- **npm** (comes with Node.js)

Check your versions:

```bash
python --version   # Should be 3.7+
node --version     # Should be 18+
npm --version      # Any recent version
```

### Gemini API Key

You need a **free** Google AI Studio API key:

1. Go to https://aistudio.google.com/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key

**Free tier includes:**
- 500 requests per day
- 250,000 tokens per minute
- More than enough for multiple themes!

---

## Installation Steps

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd t-rex-runner
```

### 2. Install Python Dependencies

```bash
pip install Pillow numpy
```

**What this installs:**
- `Pillow` - Image processing (resize, crop, transparency)
- `numpy` - Fast array operations for background detection

### 3. Install Node.js Dependencies

```bash
npm install
```

**What this installs:**
- `@google/genai` - Gemini API client
- `mime` - MIME type detection for images
- `typescript` - TypeScript compiler
- `ts-node` - Run TypeScript directly
- `@types/node` - Node.js type definitions

### 4. Set Up API Key

#### Option A: Environment Variable (Recommended)

```bash
export GEMINI_API_KEY="your-api-key-here"
```

To make permanent, add to your shell config:

**Bash:**
```bash
echo 'export GEMINI_API_KEY="your-api-key-here"' >> ~/.bashrc
source ~/.bashrc
```

**Zsh:**
```bash
echo 'export GEMINI_API_KEY="your-api-key-here"' >> ~/.zshrc
source ~/.zshrc
```

**Fish:**
```bash
set -Ux GEMINI_API_KEY "your-api-key-here"
```

#### Option B: .env File

Create a `.env` file in the project root:

```bash
echo "GEMINI_API_KEY=your-api-key-here" > .env
```

**Note:** Add `.env` to `.gitignore` to keep your key private!

### 5. Verify Setup

```bash
# Check Python packages
python -c "import PIL; import numpy; print('✅ Python packages OK')"

# Check Node packages
node -e "console.log('✅ Node.js OK')"

# Check API key
echo $GEMINI_API_KEY
# Should print your key
```

---

## Quick Test

Generate a single sprite to test your setup:

```bash
# Create test directory
mkdir -p ai_generated

# Generate one sprite (manual test with Gemini)
ts-node -e "
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
  console.log('Testing Gemini API...');
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [{ text: 'Hello!' }] }],
  });
  console.log('✅ API works!');
  console.log('Response:', response.candidates[0].content.parts[0].text);
}

test();
"
```

If this succeeds, you're ready to generate sprites!

---

## Directory Structure

After installation, your project should look like:

```
t-rex-runner/
├── node_modules/              # Node.js packages (auto-created)
├── ai_generated/              # Raw AI images will go here
├── processed_sprites/         # Processed sprites will go here
├── output/                    # Final sprite sheets will go here
│
├── generate_sprites_gemini.ts # 🎨 Main generation script
├── process_ai_sprites.py      # 🔧 Processing script
├── pack_sprites.py            # 📦 Packing script
├── validate_sprites.py        # ✔️  Validation script
├── run_pipeline.ts            # 🚀 End-to-end automation
│
├── package.json               # Node.js config
├── tsconfig.json              # TypeScript config
├── sprite_config.json         # Sprite specifications
│
└── README_GEMINI_PIPELINE.md  # Complete documentation
```

---

## Your First Theme

### Option 1: Complete Pipeline (Recommended)

```bash
ts-node run_pipeline.ts --full --theme=retro --backup
```

This will:
1. Generate 27 sprites with Gemini (~3-5 minutes)
2. Process them (remove backgrounds, crop, resize)
3. Pack into sprite sheets
4. Validate pixel-perfect alignment
5. Deploy to game assets

### Option 2: Step-by-Step

```bash
# 1. Generate sprites
ts-node generate_sprites_gemini.ts --theme=retro --parallel=3

# 2. Process sprites
python process_ai_sprites.py --input ai_generated/ --output processed_sprites/ --preview

# 3. Pack sprite sheets
python pack_sprites.py --input processed_sprites/ --output output/

# 4. Validate
python validate_sprites.py --visualize

# 5. Deploy
cp output/default_100_percent/100-offline-sprite.png assets/default_100_percent/
cp output/default_200_percent/200-offline-sprite.png assets/default_200_percent/
```

### Option 3: Use npm Scripts

```bash
# Generate
npm run generate -- --theme=cyberpunk

# Process
npm run process

# Pack
npm run pack

# Validate
npm run validate

# Complete pipeline
npm run pipeline:full -- --theme=fantasy
```

---

## Themes

Available built-in themes:

### 1. **Retro** (default)
Classic Chrome dinosaur game aesthetic
```bash
ts-node run_pipeline.ts --full --theme=retro
```

### 2. **Cyberpunk**
Neon colors, futuristic vibes
```bash
ts-node run_pipeline.ts --full --theme=cyberpunk
```

### 3. **Fantasy**
Medieval RPG style, magical elements
```bash
ts-node run_pipeline.ts --full --theme=fantasy
```

### 4. **Underwater**
Ocean theme, aquatic colors
```bash
ts-node run_pipeline.ts --full --theme=underwater
```

### 5. **Space**
Cosmic sci-fi theme
```bash
ts-node run_pipeline.ts --full --theme=space
```

---

## Configuration

### Adjust Generation Speed

```bash
# Slower, more respectful (default)
ts-node generate_sprites_gemini.ts --parallel=3

# Faster
ts-node generate_sprites_gemini.ts --parallel=5

# Slowest (sequential)
ts-node generate_sprites_gemini.ts --parallel=1
```

### Adjust Processing

Edit `sprite_config.json`:

```json
{
  "processing_config": {
    "background_detection": {
      "edge_sample_percent": 5,
      "color_threshold": 30,
      "crop_padding": 2
    }
  }
}
```

---

## Troubleshooting

### "Cannot find module '@google/genai'"

**Fix:**
```bash
npm install
```

### "ModuleNotFoundError: No module named 'PIL'"

**Fix:**
```bash
pip install Pillow numpy
```

### "GEMINI_API_KEY environment variable not set"

**Fix:**
```bash
export GEMINI_API_KEY="your-key-here"
```

### "Permission denied" when running scripts

**Fix:**
```bash
chmod +x *.ts *.py
```

### Node.js version too old

**Fix:** Install Node.js 18+ from https://nodejs.org/

---

## Development

### Editing Prompts

Edit `generate_sprites_gemini.ts`:

```typescript
function getSpritePrompts(theme: string = 'retro'): SpritePrompt[] {
  // Add your custom theme here
  const themeStyles: Record<string, string> = {
    retro: '...',
    yourtheme: 'your custom style description here',
  };

  // ...
}
```

### Testing Individual Sprites

```bash
# Generate just one sprite type
ts-node generate_sprites_gemini.ts --sprites trex

# Process just one sprite type
python process_ai_sprites.py --sprites trex
```

---

## Updating

Pull latest changes:

```bash
git pull origin main
npm install  # Update Node packages
pip install --upgrade Pillow numpy  # Update Python packages
```

---

## Uninstalling

```bash
# Remove Node packages
rm -rf node_modules package-lock.json

# Remove Python packages
pip uninstall Pillow numpy

# Remove generated files
rm -rf ai_generated processed_sprites output
```

---

## Next Steps

1. **Read the full documentation:** [README_GEMINI_PIPELINE.md](README_GEMINI_PIPELINE.md)
2. **Understand the architecture:** [ARCHITECTURE.md](ARCHITECTURE.md)
3. **Learn prompting:** [AI_PROMPTS.md](AI_PROMPTS.md)
4. **Create custom themes!**

---

## Support

- Check [README_GEMINI_PIPELINE.md](README_GEMINI_PIPELINE.md) for detailed usage
- Read [Troubleshooting](#troubleshooting) section above
- Review [Gemini API docs](https://ai.google.dev/gemini-api/docs/image-generation)

---

**Happy sprite generating!** 🦖✨
