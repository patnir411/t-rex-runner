#!/usr/bin/env ts-node
/**
 * Gemini 2.5 Flash Image Sprite Generator for T-Rex Runner
 *
 * Automatically generates all game sprites using Google's Gemini 2.5 Flash Image (nano-banana)
 * with optimized prompts, parallel batch processing, and IMAGE-TO-IMAGE consistency.
 *
 * KEY FEATURE: Uses reference images to maintain perfect character consistency across
 * animation frames by leveraging Gemini's multimodal input capabilities.
 *
 * Usage:
 *   ts-node generate_sprites_gemini.ts
 *   ts-node generate_sprites_gemini.ts --theme "cyberpunk"
 *   ts-node generate_sprites_gemini.ts --parallel 5
 *   ts-node generate_sprites_gemini.ts --no-reference  # Disable image references
 *
 * Requirements:
 *   npm install @google/genai mime
 *   npm install -D @types/node ts-node typescript
 *   export GEMINI_API_KEY="your-api-key"
 */

import { GoogleGenAI } from '@google/genai';
import mime from 'mime';
import { writeFile, mkdir, readFile } from 'fs/promises';
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

  // NEW: Reference image for consistency
  referenceImage?: string;  // Filename of reference sprite
  referencePrompt?: string; // Additional context about the reference
}

/**
 * Get optimized prompts for all sprites based on theme
 *
 * NOW WITH IMAGE-TO-IMAGE CONSISTENCY:
 * - Base sprites generated from text prompts only
 * - Animation frames use previous frame as reference image
 * - Ensures perfect character consistency across frames
 */
function getSpritePrompts(theme: string = 'retro', useReferences: boolean = true): SpritePrompt[] {
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

  const prompts: SpritePrompt[] = [
    // ========== T-REX CHARACTER (7 frames with IMAGE-TO-IMAGE consistency) ==========

    // BASE SPRITE: Generate first without reference
    {
      filename: 'trex_standing.png',
      prompt: `A cute pixelated T-Rex dinosaur character standing upright on two legs, side view facing right. ${style}. The dinosaur has small arms, thick powerful legs, and a friendly expression. Retro browser game character sprite. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 44, height: 47 },
      notes: 'BASE sprite - all other T-Rex frames use this as reference'
    },

    // REFERENCE-BASED: Use standing sprite as reference for consistency
    {
      filename: 'trex_blinking.png',
      prompt: `Keep this exact character completely identical. Only close the eyes for a blink. Everything else must remain exactly the same - same pose, same body position, same colors, same style. Just the eyes are closed. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 44, height: 47 },
      notes: 'Uses trex_standing as reference - ONLY eyes change',
      ...(useReferences && {
        referenceImage: 'trex_standing.png',
        referencePrompt: 'This is the base character. Keep EVERYTHING identical except close the eyes.'
      })
    },

    // REFERENCE-BASED: Running frame 1
    {
      filename: 'trex_running_1.png',
      prompt: `Keep this exact character with identical appearance. Change ONLY the leg positions: left leg forward, right leg back, in an active running pose. Body may lean slightly forward for motion. Same character, same style, same colors. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 44, height: 47 },
      notes: 'Uses trex_standing as reference - legs change for running',
      ...(useReferences && {
        referenceImage: 'trex_standing.png',
        referencePrompt: 'This is the base character. Keep identical but change to running pose: left leg forward, right leg back.'
      })
    },

    // REFERENCE-BASED: Running frame 2 (uses running_1 for consistency)
    {
      filename: 'trex_running_2.png',
      prompt: `Keep this exact running character completely identical. Only alternate the leg positions: right leg forward, left leg back. Everything else stays the same - same character, same style, same body angle, same colors. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 44, height: 47 },
      notes: 'Uses trex_running_1 as reference - opposite leg forward',
      ...(useReferences && {
        referenceImage: 'trex_running_1.png',
        referencePrompt: 'This is the running character. Keep EVERYTHING identical but switch leg positions: right leg forward instead of left.'
      })
    },

    // REFERENCE-BASED: Crashed
    {
      filename: 'trex_crashed.png',
      prompt: `This exact character has crashed and fallen over. Show the same character lying on the ground, fallen over after collision, game over pose. Keep the same character design, colors, and style, but in a defeated/crashed position. Stars or dizziness indicators optional. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 44, height: 47 },
      notes: 'Uses trex_standing as reference - crashed pose',
      ...(useReferences && {
        referenceImage: 'trex_standing.png',
        referencePrompt: 'This is the character. Keep the same design but show it fallen over dead after collision.'
      })
    },

    // REFERENCE-BASED: Ducking frame 1
    {
      filename: 'trex_ducking_1.png',
      prompt: `This exact character is now crouching very low to the ground to avoid obstacles. Keep the same character design, colors, and style. Body stretched horizontally, head lowered, legs bent in ducking position. Wide horizontal sprite. ${basePromptSuffix}`,
      aspectRatio: '4:3',
      expectedDimensions: { width: 59, height: 47 },
      notes: 'Uses trex_standing as reference - ducking pose (wider sprite)',
      ...(useReferences && {
        referenceImage: 'trex_standing.png',
        referencePrompt: 'This is the character. Keep identical design but show crouching low to ground, body stretched horizontally.'
      })
    },

    // REFERENCE-BASED: Ducking frame 2 (uses ducking_1 for consistency)
    {
      filename: 'trex_ducking_2.png',
      prompt: `Keep this exact ducking character completely identical. Only change the leg position slightly for animation variety. Same character, same ducking pose, same horizontal stretch. ${basePromptSuffix}`,
      aspectRatio: '4:3',
      expectedDimensions: { width: 59, height: 47 },
      notes: 'Uses trex_ducking_1 as reference - slight leg variation',
      ...(useReferences && {
        referenceImage: 'trex_ducking_1.png',
        referencePrompt: 'This is the ducking character. Keep EVERYTHING identical but vary leg position slightly for animation.'
      })
    },

    // ========== PTERODACTYL (2 frames with IMAGE-TO-IMAGE consistency) ==========

    // BASE SPRITE: Pterodactyl wings up
    {
      filename: 'pterodactyl_1.png',
      prompt: `A pixelated pterodactyl flying dinosaur, wings spread upward in flight. ${style}. Side view, prehistoric flying reptile, simple sprite design, retro game enemy character. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 46, height: 40 },
      notes: 'BASE sprite - pterodactyl with wings up'
    },

    // REFERENCE-BASED: Wings down (uses pterodactyl_1)
    {
      filename: 'pterodactyl_2.png',
      prompt: `Keep this exact pterodactyl completely identical. Only move the wings down in flapping motion. Same body, same head, same colors, same style. Wings down instead of up. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 46, height: 40 },
      notes: 'Uses pterodactyl_1 as reference - wings down',
      ...(useReferences && {
        referenceImage: 'pterodactyl_1.png',
        referencePrompt: 'This is the pterodactyl. Keep EVERYTHING identical but move wings down for flapping animation.'
      })
    },

    // ========== CACTI (6 total: 3 small + 3 large with IMAGE-TO-IMAGE consistency) ==========

    // BASE SPRITE: Small cactus 1
    {
      filename: 'cactus_small_1.png',
      prompt: `A pixelated small desert cactus obstacle, variation 1 with 1-2 arms. ${style}. Simple saguaro cactus sprite, compact size, retro game obstacle. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 17, height: 35 },
      notes: 'BASE sprite - small cactus variation 1'
    },

    // REFERENCE-BASED: Small cactus variations
    {
      filename: 'cactus_small_2.png',
      prompt: `Keep this exact cactus style and size. Create a variation with slightly different arm positions or number of arms. Same height, same general shape, same style, just a variation. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 17, height: 35 },
      notes: 'Uses cactus_small_1 as reference - arm variation',
      ...(useReferences && {
        referenceImage: 'cactus_small_1.png',
        referencePrompt: 'This is the small cactus. Keep same size and style but vary the arm configuration.'
      })
    },
    {
      filename: 'cactus_small_3.png',
      prompt: `Keep this exact cactus style and size. Create another unique variation with different arm arrangement. Same height, same general shape, same style, different arm pattern. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 17, height: 35 },
      notes: 'Uses cactus_small_1 as reference - another arm variation',
      ...(useReferences && {
        referenceImage: 'cactus_small_1.png',
        referencePrompt: 'This is the small cactus. Keep same size and style but create a third unique arm configuration.'
      })
    },

    // BASE SPRITE: Large cactus 1
    {
      filename: 'cactus_large_1.png',
      prompt: `A pixelated tall large desert cactus obstacle, variation 1 with multiple arms. ${style}. Tall saguaro cactus sprite, imposing size, retro game obstacle. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 25, height: 50 },
      notes: 'BASE sprite - large cactus variation 1'
    },

    // REFERENCE-BASED: Large cactus variations
    {
      filename: 'cactus_large_2.png',
      prompt: `Keep this exact tall cactus style and size. Create a variation with different arm positions. Same height, same proportions, same style, just vary the arms. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 25, height: 50 },
      notes: 'Uses cactus_large_1 as reference - arm variation',
      ...(useReferences && {
        referenceImage: 'cactus_large_1.png',
        referencePrompt: 'This is the large cactus. Keep same height and style but vary the arm positions.'
      })
    },
    {
      filename: 'cactus_large_3.png',
      prompt: `Keep this exact tall cactus style and size. Create another unique variation with different arm design. Same height, same proportions, same style, unique arm arrangement. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 25, height: 50 },
      notes: 'Uses cactus_large_1 as reference - another arm variation',
      ...(useReferences && {
        referenceImage: 'cactus_large_1.png',
        referencePrompt: 'This is the large cactus. Keep same height and style but create a third unique arm design.'
      })
    },

    // ========== MOON PHASES (7 phases with IMAGE-TO-IMAGE consistency) ==========

    // BASE SPRITE: New moon (phase 1)
    {
      filename: 'moon_phase_1.png',
      prompt: `A pixelated new moon (very thin crescent), celestial sprite. ${style}. Minimal crescent moon shape, night mode decoration, retro game sky element. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 20, height: 40 },
      notes: 'BASE sprite - new moon (thin crescent)'
    },

    // REFERENCE-BASED: Gradual moon phase progression
    {
      filename: 'moon_phase_2.png',
      prompt: `Keep this exact moon style. Show the next phase with slightly more illumination, waxing crescent getting larger. Same moon, same style, just more visible surface. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 20, height: 40 },
      notes: 'Uses moon_phase_1 as reference - slightly larger crescent',
      ...(useReferences && {
        referenceImage: 'moon_phase_1.png',
        referencePrompt: 'This is the moon. Keep identical style but show next phase with more illuminated surface (waxing).'
      })
    },
    {
      filename: 'moon_phase_3.png',
      prompt: `Keep this exact moon style. Show the next phase, first quarter moon (half illuminated). Same moon design, same style, more surface visible. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 20, height: 40 },
      notes: 'Uses moon_phase_2 as reference - first quarter',
      ...(useReferences && {
        referenceImage: 'moon_phase_2.png',
        referencePrompt: 'This is the moon. Keep identical style but show next phase: first quarter (half illuminated).'
      })
    },
    {
      filename: 'moon_phase_4.png',
      prompt: `Keep this exact moon style. Show the full moon, completely round and fully illuminated. Same moon design, same style, complete circle. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 20, height: 40 },
      notes: 'Uses moon_phase_3 as reference - full moon',
      ...(useReferences && {
        referenceImage: 'moon_phase_3.png',
        referencePrompt: 'This is the moon. Keep identical style but show full moon: completely round and fully illuminated.'
      })
    },
    {
      filename: 'moon_phase_5.png',
      prompt: `Keep this exact moon style. Show waning gibbous, starting to decrease from full moon. Same moon design, same style, slightly less surface visible. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 20, height: 40 },
      notes: 'Uses moon_phase_4 as reference - waning gibbous',
      ...(useReferences && {
        referenceImage: 'moon_phase_4.png',
        referencePrompt: 'This is the moon. Keep identical style but show next phase: waning gibbous (slightly less than full).'
      })
    },
    {
      filename: 'moon_phase_6.png',
      prompt: `Keep this exact moon style. Show last quarter, half illuminated on opposite side. Same moon design, same style, continuing to wane. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 20, height: 40 },
      notes: 'Uses moon_phase_5 as reference - last quarter',
      ...(useReferences && {
        referenceImage: 'moon_phase_5.png',
        referencePrompt: 'This is the moon. Keep identical style but show last quarter: half illuminated, opposite side.'
      })
    },
    {
      filename: 'moon_phase_7.png',
      prompt: `Keep this exact moon style. Show waning crescent, thin crescent on opposite direction from phase 1. Same moon design, same style, final phase. ${basePromptSuffix}`,
      aspectRatio: '1:1',
      expectedDimensions: { width: 20, height: 40 },
      notes: 'Uses moon_phase_6 as reference - waning crescent',
      ...(useReferences && {
        referenceImage: 'moon_phase_6.png',
        referencePrompt: 'This is the moon. Keep identical style but show final phase: thin waning crescent.'
      })
    },

    // ========== BACKGROUND ELEMENTS (no references needed - single sprites) ==========

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

    // ========== UI ELEMENTS (no references needed - single sprites) ==========

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

  return prompts;
}

// ============================================================================
// GEMINI API INTERACTION WITH IMAGE-TO-IMAGE SUPPORT
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
   * NOW SUPPORTS IMAGE INPUT for consistency!
   */
  async generateSprite(spritePrompt: SpritePrompt): Promise<GenerationResult> {
    const { filename, prompt, aspectRatio, referenceImage, referencePrompt } = spritePrompt;

    console.log(`\n🎨 Generating: ${filename}`);
    if (referenceImage) {
      console.log(`   📸 Using reference: ${referenceImage}`);
    }
    console.log(`   Prompt: ${prompt.substring(0, 80)}...`);

    try {
      // Configure generation with Gemini 2.5 Flash Image best practices
      const config = {
        responseModalities: ['IMAGE', 'TEXT'] as const,
        imageConfig: {
          imageSize: '1K' as const, // 1024x1024 for high quality
        },
      };

      // Build content parts array
      const parts: any[] = [];

      // If we have a reference image, add it first
      if (referenceImage) {
        const referencePath = join(this.outputDir, referenceImage);

        if (existsSync(referencePath)) {
          // Read the reference image
          const imageData = await readFile(referencePath);
          const mimeType = mime.getType(referencePath) || 'image/png';

          // Add reference image to prompt
          parts.push({
            inlineData: {
              mimeType,
              data: imageData.toString('base64'),
            },
          });

          // Add reference context
          if (referencePrompt) {
            parts.push({ text: referencePrompt + '\n\n' });
          }

          console.log(`   ✅ Loaded reference image (${(imageData.length / 1024).toFixed(1)} KB)`);
        } else {
          console.log(`   ⚠️  Reference image not found: ${referencePath}`);
          console.log(`   ℹ️  Generating without reference (may affect consistency)`);
        }
      }

      // Add the main prompt
      parts.push({ text: prompt });

      const contents = [
        {
          role: 'user' as const,
          parts,
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
   * Generate sprites in dependency order for image-to-image consistency
   *
   * Sprites are organized into batches where:
   * - Batch 1: Base sprites (no references)
   * - Batch 2: Sprites that reference Batch 1
   * - Batch 3: Sprites that reference Batch 2
   * - etc.
   */
  async generateBatch(
    prompts: SpritePrompt[],
    batchSize: number = 3
  ): Promise<GenerationResult[]> {
    const results: GenerationResult[] = [];

    // Organize sprites by dependency level
    const dependencyLevels = this.organizeDependencies(prompts);

    console.log(`\n📊 Sprite generation plan:`);
    console.log(`   Total sprites: ${prompts.length}`);
    console.log(`   Dependency levels: ${dependencyLevels.length}`);
    console.log(`   Parallel batch size: ${batchSize}`);

    // Process each dependency level sequentially
    for (let levelIndex = 0; levelIndex < dependencyLevels.length; levelIndex++) {
      const level = dependencyLevels[levelIndex];

      console.log(`\n${'━'.repeat(75)}`);
      console.log(`📍 DEPENDENCY LEVEL ${levelIndex + 1}/${dependencyLevels.length}`);
      console.log(`   Sprites: ${level.length} (${level.map(s => s.filename).join(', ')})`);
      console.log(`${'━'.repeat(75)}`);

      // Within each level, process in batches for parallelization
      for (let i = 0; i < level.length; i += batchSize) {
        const batch = level.slice(i, i + batchSize);

        console.log(`\n📦 Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(level.length / batchSize)}: Processing ${batch.length} sprites`);

        // Generate all sprites in batch in parallel
        const batchResults = await Promise.all(
          batch.map((prompt) => this.generateSprite(prompt))
        );

        results.push(...batchResults);

        // Small delay between batches to be respectful of API
        if (i + batchSize < level.length) {
          console.log(`\n⏳ Waiting 2s before next batch...`);
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      // Delay between dependency levels (only if not last level)
      if (levelIndex < dependencyLevels.length - 1) {
        console.log(`\n⏳ Waiting 3s before next dependency level...`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    return results;
  }

  /**
   * Organize sprites into dependency levels for proper generation order
   *
   * Returns array of arrays, where each inner array is a "level" of sprites
   * that can be generated in parallel
   */
  private organizeDependencies(prompts: SpritePrompt[]): SpritePrompt[][] {
    const levels: SpritePrompt[][] = [];
    const processed = new Set<string>();

    // Keep finding sprites that can be generated until all are processed
    while (processed.size < prompts.length) {
      const currentLevel: SpritePrompt[] = [];

      for (const prompt of prompts) {
        // Skip if already processed
        if (processed.has(prompt.filename)) {
          continue;
        }

        // Can generate if has no reference OR reference already processed
        const canGenerate =
          !prompt.referenceImage || processed.has(prompt.referenceImage);

        if (canGenerate) {
          currentLevel.push(prompt);
          processed.add(prompt.filename);
        }
      }

      if (currentLevel.length > 0) {
        levels.push(currentLevel);
      } else {
        // Shouldn't happen if dependencies are valid
        console.error('⚠️  Circular dependency detected or invalid reference!');
        break;
      }
    }

    return levels;
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
║  ✨ NOW WITH IMAGE-TO-IMAGE CONSISTENCY!                      ║
║  Uses reference images to maintain perfect character design   ║
║  across animation frames via Gemini's multimodal input.       ║
╚═══════════════════════════════════════════════════════════════╝
`);

  // Parse arguments
  const args = process.argv.slice(2);
  const themeArg = args.find((arg) => arg.startsWith('--theme='));
  const parallelArg = args.find((arg) => arg.startsWith('--parallel='));
  const noReference = args.includes('--no-reference');

  const theme = themeArg ? themeArg.split('=')[1] : 'retro';
  const batchSize = parallelArg ? parseInt(parallelArg.split('=')[1]) : 3;
  const useReferences = !noReference;

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
  console.log(`   Batch size: ${batchSize} (parallel generations per level)`);
  console.log(`   Image-to-image consistency: ${useReferences ? '✅ ENABLED' : '❌ DISABLED'}`);
  console.log(`   Output directory: ai_generated/`);
  console.log(`   Model: gemini-2.5-flash-image (nano-banana)`);

  // Get all sprite prompts
  const prompts = getSpritePrompts(theme, useReferences);
  console.log(`   Total sprites: ${prompts.length}`);

  const withReferences = prompts.filter(p => p.referenceImage).length;
  const withoutReferences = prompts.length - withReferences;
  console.log(`   Base sprites: ${withoutReferences}`);
  console.log(`   Reference-based sprites: ${withReferences}`);

  // Confirm before generating
  console.log(`\n⚠️  This will generate ${prompts.length} sprites using the Gemini API.`);
  console.log(`   Estimated cost: ~$${(prompts.length * 0.039).toFixed(2)} (at $0.039 per 1K image)`);
  if (useReferences) {
    console.log(`   ✨ Image-to-image consistency will ensure perfect character matching!`);
  }
  console.log();

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
  console.log(`🎨 Image-to-image consistency: ${useReferences ? 'ENABLED' : 'DISABLED'}`);

  if (failed.length > 0) {
    console.log(`\n❌ Failed sprites:`);
    failed.forEach((r) => {
      console.log(`   - ${r.filename}: ${r.error}`);
    });
  }

  if (successful.length === results.length) {
    console.log(`
✨ All sprites generated successfully${useReferences ? ' with IMAGE-TO-IMAGE consistency' : ''}!

${useReferences ? '🎯 Character consistency is maintained across all animation frames!' : ''}

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
