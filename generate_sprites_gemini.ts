#!/usr/bin/env ts-node
/**
 * Gemini 2.5 Flash Image Sprite Generator for T-Rex Runner
 *
 * Automatically generates all game sprites using Google's Gemini 2.5 Flash Image (nano-banana)
 * with optimized prompts and parallel batch processing.
 *
 * Usage:
 *   ts-node generate_sprites_gemini.ts
 *   ts-node generate_sprites_gemini.ts --theme "cyberpunk"
 *   ts-node generate_sprites_gemini.ts --parallel 5
 *
 * Requirements:
 *   npm install @google/genai mime
 *   npm install -D @types/node ts-node typescript
 *   export GEMINI_API_KEY="your-api-key"
 */

import { GoogleGenAI } from '@google/genai';
import mime from 'mime';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

// ============================================================================
// SPRITE DEFINITIONS
// ============================================================================

interface SpritePrompt {
  filename: string;
  prompt: string;
  aspectRatio?: '1:1' | '3:2' | '2:3' | '3:4' | '4:3' | '16:9' | '9:16';
  expectedDimensions: { width: number; height: number };
  notes?: string;
}

/**
 * Get optimized prompts for all sprites based on theme
 * Uses Gemini 2.5 Flash Image best practices:
 * - Narrative-driven detailed descriptions
 * - Explicit style, palette, and background specification
 * - Photographic/cinematic language for composition control
 */
function getSpritePrompts(theme: string = 'retro'): SpritePrompt[] {
  // Base style modifiers by theme
  const themeStyles: Record<string, string> = {
    retro: 'pixel art, 8-bit retro game style, classic chrome dinosaur game aesthetic, simple flat colors, clean black outlines',
    cyberpunk: 'pixel art, cyberpunk neon aesthetic, vibrant neon colors (cyan, magenta, yellow), futuristic retro game style, glowing edges',
    fantasy: 'pixel art, fantasy RPG style, medieval theme, vibrant fantasy colors, magical retro game aesthetic',
    underwater: 'pixel art, underwater ocean theme, aquatic colors (blues, teals, greens), bubble effects, marine retro game style',
    space: 'pixel art, space theme, cosmic colors (dark blues, purples, stars), sci-fi retro game style, stellar aesthetic',
  };

  const style = themeStyles[theme] || themeStyles.retro;
  const basePromptSuffix = 'centered on solid white background, clean sprite, minimal shadows, game asset';

  return [
    // ========== T-REX CHARACTER (7 frames) ==========
    {
      filename: 'trex_standing.png',
      prompt: `A cute pixelated T-Rex dinosaur character standing upright on two legs, side view facing right. ${style}. The dinosaur has small arms, thick powerful legs, and a friendly expression. Retro browser game character sprite. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 44, height: 47 },
      notes: 'Main character standing pose - this becomes the template for all T-Rex variations'
    },
    {
      filename: 'trex_blinking.png',
      prompt: `The exact same cute pixelated T-Rex dinosaur from before, identical pose and body position, but with eyes closed in a blink. ${style}. Everything else must be identical - same stance, same body, same colors, same position. Only the eyes are closed. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 44, height: 47 },
      notes: 'CRITICAL: Only eyes should change from standing pose'
    },
    {
      filename: 'trex_running_1.png',
      prompt: `The same cute pixelated T-Rex dinosaur running, left leg forward and right leg back, active running pose. ${style}. Side view facing right, body leaning slightly forward in motion. Dynamic running animation frame 1. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 44, height: 47 },
      notes: 'Running animation frame 1 - left leg forward'
    },
    {
      filename: 'trex_running_2.png',
      prompt: `The same cute pixelated T-Rex dinosaur running, right leg forward and left leg back, active running pose. ${style}. Identical to previous running frame but with opposite leg positions. Side view facing right. Dynamic running animation frame 2. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 44, height: 47 },
      notes: 'Running animation frame 2 - right leg forward, alternates with frame 1'
    },
    {
      filename: 'trex_crashed.png',
      prompt: `The same pixelated T-Rex dinosaur fallen over dead after collision, lying on the ground, game over pose. ${style}. Side view, defeated position, stars or dizziness indicators optional. Retro game death animation sprite. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 44, height: 47 },
      notes: 'Game over crash pose'
    },
    {
      filename: 'trex_ducking_1.png',
      prompt: `The same pixelated T-Rex dinosaur crouching very low to the ground, ducking to avoid obstacles. ${style}. Body stretched horizontally, head lowered, legs bent. Wide horizontal sprite for ducking animation. Side view facing right. ${basePromptSuffix}`,
      aspectRatio: '4:3',
      expectedDimensions: { width: 59, height: 47 },
      notes: 'Ducking frame 1 - wider sprite (59px vs 44px)'
    },
    {
      filename: 'trex_ducking_2.png',
      prompt: `The same pixelated T-Rex dinosaur crouching low, identical to previous ducking pose but with slightly different leg position for animation. ${style}. Body stretched horizontally, head lowered. Wide horizontal sprite for ducking animation frame 2. Side view facing right. ${basePromptSuffix}`,
      aspectRatio: '4:3',
      expectedDimensions: { width: 59, height: 47 },
      notes: 'Ducking frame 2 - alternates with frame 1'
    },

    // ========== PTERODACTYL (2 frames) ==========
    {
      filename: 'pterodactyl_1.png',
      prompt: `A pixelated pterodactyl flying dinosaur, wings spread upward in flight. ${style}. Side view, prehistoric flying reptile, simple sprite design, retro game enemy character. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 46, height: 40 },
      notes: 'Flying enemy - wings up'
    },
    {
      filename: 'pterodactyl_2.png',
      prompt: `The same pixelated pterodactyl flying dinosaur, wings down in flapping motion. ${style}. Identical body and style to previous frame, only wing position changes. Side view, wing flapping animation frame 2. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 46, height: 40 },
      notes: 'Flying enemy - wings down, alternates with frame 1'
    },

    // ========== CACTI (6 total: 3 small + 3 large) ==========
    {
      filename: 'cactus_small_1.png',
      prompt: `A pixelated small desert cactus obstacle, variation 1 with 1-2 arms. ${style}. Simple saguaro cactus sprite, compact size, retro game obstacle. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 17, height: 35 },
      notes: 'Small cactus variation 1'
    },
    {
      filename: 'cactus_small_2.png',
      prompt: `A pixelated small desert cactus obstacle, variation 2 with different arm configuration. ${style}. Simple saguaro cactus sprite, similar size to previous but different shape, retro game obstacle. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 17, height: 35 },
      notes: 'Small cactus variation 2'
    },
    {
      filename: 'cactus_small_3.png',
      prompt: `A pixelated small desert cactus obstacle, variation 3 with unique arm arrangement. ${style}. Simple saguaro cactus sprite, different from previous two, retro game obstacle. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 17, height: 35 },
      notes: 'Small cactus variation 3'
    },
    {
      filename: 'cactus_large_1.png',
      prompt: `A pixelated tall large desert cactus obstacle, variation 1 with multiple arms. ${style}. Tall saguaro cactus sprite, imposing size, retro game obstacle. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 25, height: 50 },
      notes: 'Large cactus variation 1'
    },
    {
      filename: 'cactus_large_2.png',
      prompt: `A pixelated tall large desert cactus obstacle, variation 2 with different arm positions. ${style}. Tall saguaro cactus sprite, similar height but different shape, retro game obstacle. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 25, height: 50 },
      notes: 'Large cactus variation 2'
    },
    {
      filename: 'cactus_large_3.png',
      prompt: `A pixelated tall large desert cactus obstacle, variation 3 with unique design. ${style}. Tall saguaro cactus sprite, different from previous two, retro game obstacle. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 25, height: 50 },
      notes: 'Large cactus variation 3'
    },

    // ========== MOON PHASES (7 phases) ==========
    {
      filename: 'moon_phase_1.png',
      prompt: `A pixelated new moon (very thin crescent), celestial sprite. ${style}. Minimal crescent moon shape, night mode decoration, retro game sky element. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 20, height: 40 },
      notes: 'Moon phase 1 - new moon (thin crescent)'
    },
    {
      filename: 'moon_phase_2.png',
      prompt: `A pixelated waxing crescent moon, slightly larger crescent. ${style}. Moon phase progression, night mode decoration, retro game sky element. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 20, height: 40 },
      notes: 'Moon phase 2 - waxing crescent'
    },
    {
      filename: 'moon_phase_3.png',
      prompt: `A pixelated first quarter moon, half illuminated. ${style}. Moon phase progression, night mode decoration, retro game sky element. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 20, height: 40 },
      notes: 'Moon phase 3 - first quarter'
    },
    {
      filename: 'moon_phase_4.png',
      prompt: `A pixelated full moon, completely round and illuminated. ${style}. Bright full moon sprite, night mode decoration, retro game sky element. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 20, height: 40 },
      notes: 'Moon phase 4 - full moon'
    },
    {
      filename: 'moon_phase_5.png',
      prompt: `A pixelated waning gibbous moon, mostly illuminated. ${style}. Moon phase progression, night mode decoration, retro game sky element. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 20, height: 40 },
      notes: 'Moon phase 5 - waning gibbous'
    },
    {
      filename: 'moon_phase_6.png',
      prompt: `A pixelated last quarter moon, half illuminated opposite side. ${style}. Moon phase progression, night mode decoration, retro game sky element. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 20, height: 40 },
      notes: 'Moon phase 6 - last quarter'
    },
    {
      filename: 'moon_phase_7.png',
      prompt: `A pixelated waning crescent moon, thin crescent opposite direction. ${style}. Final moon phase, night mode decoration, retro game sky element. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 20, height: 40 },
      notes: 'Moon phase 7 - waning crescent'
    },

    // ========== BACKGROUND ELEMENTS ==========
    {
      filename: 'cloud.png',
      prompt: `A pixelated fluffy cloud, wide horizontal shape. ${style}. Simple decorative cloud sprite, background element, very wide and short proportions, retro game sky decoration. Shoot from a wide-angle perspective to capture the horizontal stretch. ${basePromptSuffix}`,
      aspectRatio: '3:2',
      expectedDimensions: { width: 46, height: 14 },
      notes: 'Very wide cloud sprite for background decoration'
    },
    {
      filename: 'star.png',
      prompt: `A pixelated tiny twinkling star, simple 4-pointed or 5-pointed star shape. ${style}. Minimal star sprite, night mode decoration, very small sprite, retro game sky element. Macro shot composition, centered. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 9, height: 9 },
      notes: 'Very small star sprite (9x9 pixels)'
    },
    {
      filename: 'horizon.png',
      prompt: `A pixelated ground texture pattern, desert sand or dirt surface, very wide horizontal repeating pattern. ${style}. Seamless tileable ground texture, extremely wide and short, textured ground line for infinite scrolling, retro game terrain. Ultra-wide panoramic shot. The texture should be able to repeat horizontally. ${basePromptSuffix}`,
      aspectRatio: '16:9',
      expectedDimensions: { width: 1200, height: 12 },
      notes: 'VERY wide ground texture (1200x12) - must be tileable'
    },

    // ========== UI ELEMENTS ==========
    {
      filename: 'restart.png',
      prompt: `A pixelated restart button icon, circular arrow or refresh symbol for game replay. ${style}. Simple UI button sprite, game restart indicator, retro game interface element. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 36, height: 32 },
      notes: 'Restart button UI element'
    },
    {
      filename: 'numbers.png',
      prompt: `Pixelated retro game font showing numbers 0-9 and letters H and I, all in a horizontal row, plus "GAME OVER" text. ${style}. Blocky monospace pixel font, all characters evenly spaced in single row, score display font, retro game UI typography. Very wide horizontal composition showing all characters: 0 1 2 3 4 5 6 7 8 9 H I GAMEOVER. ${basePromptSuffix}`,
      aspectRatio: '16:9',
      expectedDimensions: { width: 191, height: 13 },
      notes: 'Complex sprite: all numbers, HI letters, and GAME OVER text in one image'
    },
  ];
}

// ============================================================================
// GEMINI API INTERACTION
// ============================================================================

interface GenerationResult {
  filename: string;
  success: boolean;
  path?: string;
  error?: string;
  imageData?: Buffer;
}

class GeminiSpriteGenerator {
  private ai: GoogleGenAI;
  private model = 'gemini-2.5-flash-image';
  private outputDir: string;

  constructor(apiKey: string, outputDir: string = 'ai_generated') {
    this.ai = new GoogleGenAI({ apiKey });
    this.outputDir = outputDir;
  }

  /**
   * Generate a single sprite using Gemini 2.5 Flash Image
   */
  async generateSprite(spritePrompt: SpritePrompt): Promise<GenerationResult> {
    const { filename, prompt, aspectRatio } = spritePrompt;

    console.log(`\n🎨 Generating: ${filename}`);
    console.log(`   Prompt: ${prompt.substring(0, 80)}...`);

    try {
      // Configure generation with Gemini 2.5 Flash Image best practices
      const config = {
        responseModalities: ['IMAGE', 'TEXT'] as const,
        imageConfig: {
          imageSize: '1K' as const, // 1024x1024 for high quality
          // Note: aspectRatio not directly supported in config, handled via prompt
        },
      };

      const contents = [
        {
          role: 'user' as const,
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ];

      const response = await this.ai.models.generateContentStream({
        model: this.model,
        config,
        contents,
      });

      // Process stream to get image
      let imageData: Buffer | null = null;
      let textResponse = '';

      for await (const chunk of response) {
        if (!chunk.candidates?.[0]?.content?.parts) {
          continue;
        }

        // Check for image data
        if (chunk.candidates[0].content.parts[0].inlineData) {
          const inlineData = chunk.candidates[0].content.parts[0].inlineData;
          imageData = Buffer.from(inlineData.data || '', 'base64');
        } else if (chunk.text) {
          textResponse += chunk.text;
        }
      }

      if (!imageData) {
        throw new Error('No image data received from Gemini');
      }

      // Save image
      await mkdir(this.outputDir, { recursive: true });
      const filepath = join(this.outputDir, filename);
      await writeFile(filepath, imageData);

      console.log(`   ✅ Saved: ${filepath} (${(imageData.length / 1024).toFixed(1)} KB)`);

      return {
        filename,
        success: true,
        path: filepath,
        imageData,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`   ❌ Error: ${errorMsg}`);

      return {
        filename,
        success: false,
        error: errorMsg,
      };
    }
  }

  /**
   * Generate multiple sprites in parallel batches
   */
  async generateBatch(
    prompts: SpritePrompt[],
    batchSize: number = 3
  ): Promise<GenerationResult[]> {
    const results: GenerationResult[] = [];

    // Process in batches to avoid rate limits
    for (let i = 0; i < prompts.length; i += batchSize) {
      const batch = prompts.slice(i, i + batchSize);

      console.log(
        `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
      );
      console.log(
        `📦 Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(prompts.length / batchSize)}: Processing ${batch.length} sprites`
      );
      console.log(
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
      );

      // Generate all sprites in batch in parallel
      const batchResults = await Promise.all(
        batch.map((prompt) => this.generateSprite(prompt))
      );

      results.push(...batchResults);

      // Small delay between batches to be respectful of API
      if (i + batchSize < prompts.length) {
        console.log(`\n⏳ Waiting 2s before next batch...`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    return results;
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║  🦖 T-Rex Runner - Gemini 2.5 Flash Image Sprite Generator   ║
║                                                                ║
║  Generates all game sprites using Google's state-of-the-art   ║
║  Gemini 2.5 Flash Image model (aka "nano-banana")             ║
╚═══════════════════════════════════════════════════════════════╝
`);

  // Parse arguments
  const args = process.argv.slice(2);
  const themeArg = args.find((arg) => arg.startsWith('--theme='));
  const parallelArg = args.find((arg) => arg.startsWith('--parallel='));

  const theme = themeArg ? themeArg.split('=')[1] : 'retro';
  const batchSize = parallelArg ? parseInt(parallelArg.split('=')[1]) : 3;

  // Check for API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error(`
❌ ERROR: GEMINI_API_KEY environment variable not set

Please set your Gemini API key:
  export GEMINI_API_KEY="your-api-key-here"

Get your API key from: https://aistudio.google.com/apikey
`);
    process.exit(1);
  }

  console.log(`📋 Configuration:`);
  console.log(`   Theme: ${theme}`);
  console.log(`   Batch size: ${batchSize} (parallel generations)`);
  console.log(`   Output directory: ai_generated/`);
  console.log(`   Model: gemini-2.5-flash-image (nano-banana)`);

  // Get all sprite prompts
  const prompts = getSpritePrompts(theme);
  console.log(`   Total sprites: ${prompts.length}`);

  // Confirm before generating
  console.log(`\n⚠️  This will generate ${prompts.length} sprites using the Gemini API.`);
  console.log(`   Estimated cost: ~$${(prompts.length * 0.039).toFixed(2)} (at $0.039 per 1K image)\n`);

  // Initialize generator
  const generator = new GeminiSpriteGenerator(apiKey);

  // Generate all sprites
  const startTime = Date.now();
  const results = await generator.generateBatch(prompts, batchSize);
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  // Summary
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                      GENERATION SUMMARY                        ║
╚═══════════════════════════════════════════════════════════════╝
`);

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);
  console.log(`⏱️  Duration: ${duration}s`);

  if (failed.length > 0) {
    console.log(`\n❌ Failed sprites:`);
    failed.forEach((r) => {
      console.log(`   - ${r.filename}: ${r.error}`);
    });
  }

  if (successful.length === results.length) {
    console.log(`
✨ All sprites generated successfully!

Next steps:
  1. Process sprites:    python process_ai_sprites.py --input ai_generated/ --output processed_sprites/
  2. Pack sprite sheet:  python pack_sprites.py --input processed_sprites/ --output output/
  3. Copy to game:       cp output/default_*_percent/*.png assets/default_*_percent/
  4. Test:               open index.html
`);
  } else {
    console.log(`\n⚠️  Some sprites failed. You may need to retry failed sprites manually.`);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { getSpritePrompts, GeminiSpriteGenerator };
