#!/usr/bin/env ts-node
/**
 * End-to-End AI Sprite Pipeline Automation
 *
 * Orchestrates the complete sprite generation and deployment pipeline:
 * 1. Generate sprites using Gemini 2.5 Flash Image
 * 2. Process sprites (background removal, crop, resize)
 * 3. Pack sprites into sprite sheets
 * 4. Validate pixel-perfect alignment
 * 5. Deploy to game assets
 *
 * Usage:
 *   ts-node run_pipeline.ts                          # Interactive mode
 *   ts-node run_pipeline.ts --full                   # Run complete pipeline
 *   ts-node run_pipeline.ts --theme cyberpunk --full # Generate cyberpunk theme
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';
import { mkdir, copyFile, readdir } from 'fs/promises';
import { join } from 'path';
import * as readline from 'readline';

const execAsync = promisify(exec);

// ============================================================================
// PIPELINE STAGES
// ============================================================================

interface PipelineOptions {
  theme: string;
  batchSize: number;
  skipGenerate: boolean;
  skipProcess: boolean;
  skipPack: boolean;
  skipValidate: boolean;
  skipDeploy: boolean;
  backupAssets: boolean;
}

class SpritePipeline {
  private options: PipelineOptions;

  constructor(options: PipelineOptions) {
    this.options = options;
  }

  /**
   * Print styled banner
   */
  private printBanner() {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║   🦖  T-REX RUNNER - AI SPRITE GENERATION PIPELINE                    ║
║                                                                        ║
║   Powered by Gemini 2.5 Flash Image (nano-banana)                     ║
║                                                                        ║
╚═══════════════════════════════════════════════════════════════════════╝
`);
  }

  /**
   * Print stage header
   */
  private printStage(stage: string, description: string) {
    console.log(`\n${'━'.repeat(75)}`);
    console.log(`📍 STAGE ${stage}: ${description}`);
    console.log(`${'━'.repeat(75)}\n`);
  }

  /**
   * Execute shell command with progress
   */
  private async runCommand(
    command: string,
    description: string
  ): Promise<boolean> {
    console.log(`🔧 ${description}...`);
    console.log(`   Command: ${command}\n`);

    try {
      const { stdout, stderr } = await execAsync(command, {
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large outputs
      });

      if (stdout) {
        console.log(stdout);
      }

      if (stderr && !stderr.includes('warning')) {
        console.error('stderr:', stderr);
      }

      console.log(`\n✅ ${description} completed successfully`);
      return true;
    } catch (error) {
      console.error(`\n❌ ${description} failed:`);
      if (error instanceof Error) {
        console.error(error.message);
        if ('stdout' in error && error.stdout) {
          console.error('stdout:', error.stdout);
        }
        if ('stderr' in error && error.stderr) {
          console.error('stderr:', error.stderr);
        }
      }
      return false;
    }
  }

  /**
   * Stage 1: Generate sprites using Gemini
   */
  private async generateSprites(): Promise<boolean> {
    this.printStage('1', 'AI Sprite Generation (Gemini 2.5 Flash Image)');

    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ ERROR: GEMINI_API_KEY environment variable not set');
      console.error('   Please set your API key: export GEMINI_API_KEY="your-key"');
      return false;
    }

    const command = `ts-node generate_sprites_gemini.ts --theme=${this.options.theme} --parallel=${this.options.batchSize}`;

    return await this.runCommand(
      command,
      'Generating sprites with Gemini 2.5 Flash Image'
    );
  }

  /**
   * Stage 2: Process raw AI images
   */
  private async processSprites(): Promise<boolean> {
    this.printStage('2', 'Process AI Images (background removal, crop, resize)');

    // Check if ai_generated directory has files
    if (!existsSync('ai_generated')) {
      console.error('❌ ERROR: ai_generated/ directory not found');
      return false;
    }

    const files = await readdir('ai_generated');
    const imageFiles = files.filter((f) =>
      /\.(png|jpg|jpeg)$/i.test(f)
    );

    if (imageFiles.length === 0) {
      console.error('❌ ERROR: No images found in ai_generated/');
      return false;
    }

    console.log(`📁 Found ${imageFiles.length} images in ai_generated/`);

    const command = 'python process_ai_sprites.py --input ai_generated/ --output processed_sprites/ --preview';

    return await this.runCommand(
      command,
      'Processing sprites (background removal, cropping, resizing)'
    );
  }

  /**
   * Stage 3: Pack sprites into sprite sheets
   */
  private async packSprites(): Promise<boolean> {
    this.printStage('3', 'Pack Sprite Sheets (LDPI & HDPI)');

    // Check if processed_sprites directory has files
    if (!existsSync('processed_sprites')) {
      console.error('❌ ERROR: processed_sprites/ directory not found');
      return false;
    }

    const command = 'python pack_sprites.py --input processed_sprites/ --output output/';

    return await this.runCommand(
      command,
      'Packing sprites into sprite sheets'
    );
  }

  /**
   * Stage 4: Validate sprites
   */
  private async validateSprites(): Promise<boolean> {
    this.printStage('4', 'Validate Sprites (pixel-perfect alignment)');

    const command = 'python validate_sprites.py --processed processed_sprites/ --output output/ --visualize';

    return await this.runCommand(
      command,
      'Validating sprite dimensions and collision boxes'
    );
  }

  /**
   * Stage 5: Deploy to game assets
   */
  private async deploySprites(): Promise<boolean> {
    this.printStage('5', 'Deploy to Game Assets');

    // Backup original assets if requested
    if (this.options.backupAssets) {
      console.log('💾 Backing up original assets...');

      const backupTasks = [
        this.backupDirectory(
          'assets/default_100_percent',
          'assets/default_100_percent.backup'
        ),
        this.backupDirectory(
          'assets/default_200_percent',
          'assets/default_200_percent.backup'
        ),
      ];

      try {
        await Promise.all(backupTasks);
        console.log('   ✅ Assets backed up successfully\n');
      } catch (error) {
        console.error('   ⚠️  Backup failed (continuing anyway):', error);
      }
    }

    // Copy new sprites
    console.log('📦 Deploying new sprite sheets...');

    const deployTasks = [
      this.copySprite(
        'output/default_100_percent/100-offline-sprite.png',
        'assets/default_100_percent/100-offline-sprite.png'
      ),
      this.copySprite(
        'output/default_200_percent/200-offline-sprite.png',
        'assets/default_200_percent/200-offline-sprite.png'
      ),
    ];

    try {
      await Promise.all(deployTasks);
      console.log('   ✅ Sprite sheets deployed successfully\n');
      return true;
    } catch (error) {
      console.error('   ❌ Deployment failed:', error);
      return false;
    }
  }

  /**
   * Helper: Backup directory
   */
  private async backupDirectory(src: string, dest: string): Promise<void> {
    if (!existsSync(src)) {
      console.log(`   ⚠️  Source not found: ${src}`);
      return;
    }

    if (existsSync(dest)) {
      console.log(`   ℹ️  Backup already exists: ${dest}`);
      return;
    }

    await mkdir(dest, { recursive: true });

    const files = await readdir(src);
    for (const file of files) {
      const srcFile = join(src, file);
      const destFile = join(dest, file);
      await copyFile(srcFile, destFile);
    }

    console.log(`   ✅ Backed up: ${src} → ${dest}`);
  }

  /**
   * Helper: Copy sprite file
   */
  private async copySprite(src: string, dest: string): Promise<void> {
    if (!existsSync(src)) {
      throw new Error(`Source sprite not found: ${src}`);
    }

    await copyFile(src, dest);
    console.log(`   ✅ Copied: ${src} → ${dest}`);
  }

  /**
   * Run the complete pipeline
   */
  async run(): Promise<boolean> {
    this.printBanner();

    console.log('📋 Pipeline Configuration:');
    console.log(`   Theme: ${this.options.theme}`);
    console.log(`   Batch size: ${this.options.batchSize}`);
    console.log(`   Backup assets: ${this.options.backupAssets ? 'Yes' : 'No'}`);

    const stages = [
      { name: 'generate', skip: this.options.skipGenerate, fn: () => this.generateSprites() },
      { name: 'process', skip: this.options.skipProcess, fn: () => this.processSprites() },
      { name: 'pack', skip: this.options.skipPack, fn: () => this.packSprites() },
      { name: 'validate', skip: this.options.skipValidate, fn: () => this.validateSprites() },
      { name: 'deploy', skip: this.options.skipDeploy, fn: () => this.deploySprites() },
    ];

    console.log('\n📍 Pipeline Stages:');
    stages.forEach((stage, i) => {
      const status = stage.skip ? '⏭️  SKIP' : '✅ RUN';
      console.log(`   ${i + 1}. ${stage.name.toUpperCase()}: ${status}`);
    });

    const startTime = Date.now();

    // Execute stages
    for (const stage of stages) {
      if (stage.skip) {
        console.log(`\n⏭️  Skipping ${stage.name}...`);
        continue;
      }

      const success = await stage.fn();

      if (!success) {
        console.error(`\n❌ Pipeline failed at stage: ${stage.name}`);
        return false;
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    // Success summary
    console.log(`
╔═══════════════════════════════════════════════════════════════════════╗
║                       🎉 PIPELINE COMPLETE! 🎉                         ║
╚═══════════════════════════════════════════════════════════════════════╝

✅ All stages completed successfully in ${duration}s

🎮 Your custom ${this.options.theme} theme is ready!

Next steps:
  1. Open the game:      open index.html
  2. Or start server:    python -m http.server 8000
  3. View in browser:    http://localhost:8000

📊 Generated files:
  • ai_generated/              - Raw AI images (${this.options.theme} theme)
  • processed_sprites/          - Processed individual sprites
  • output/                     - Final sprite sheets
  • assets/                     - Deployed to game (ready to play!)

💾 Backups:
  • assets/default_*_percent.backup/  - Original sprites (if backup enabled)

📈 Validation:
  • output/collision_boxes_*.png      - Collision box visualizations

Happy gaming! 🦖
`);

    return true;
  }
}

// ============================================================================
// CLI
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  const getArg = (name: string, defaultValue: string) => {
    const arg = args.find((a) => a.startsWith(`--${name}=`));
    return arg ? arg.split('=')[1] : defaultValue;
  };

  const hasFlag = (name: string) => {
    return args.includes(`--${name}`);
  };

  const options: PipelineOptions = {
    theme: getArg('theme', 'retro'),
    batchSize: parseInt(getArg('parallel', '3')),
    skipGenerate: !hasFlag('generate') && !hasFlag('full'),
    skipProcess: !hasFlag('process') && !hasFlag('full'),
    skipPack: !hasFlag('pack') && !hasFlag('full'),
    skipValidate: !hasFlag('validate') && !hasFlag('full'),
    skipDeploy: !hasFlag('deploy') && !hasFlag('full'),
    backupAssets: hasFlag('backup') || hasFlag('full'),
  };

  // If no flags, show help or run interactive mode
  if (args.length === 0 || hasFlag('help')) {
    console.log(`
T-Rex Runner AI Sprite Pipeline

Usage:
  ts-node run_pipeline.ts [options]

Options:
  --full                 Run complete pipeline (all stages)
  --theme=<name>         Theme name (default: retro)
                         Available: retro, cyberpunk, fantasy, underwater, space
  --parallel=<n>         Number of parallel API calls (default: 3)
  --backup               Backup original assets before deploying

  --generate             Run generation stage only
  --process              Run processing stage only
  --pack                 Run packing stage only
  --validate             Run validation stage only
  --deploy               Run deployment stage only

Examples:
  # Run complete pipeline with cyberpunk theme
  ts-node run_pipeline.ts --full --theme=cyberpunk

  # Process and pack existing sprites
  ts-node run_pipeline.ts --process --pack

  # Validate and deploy
  ts-node run_pipeline.ts --validate --deploy --backup

  # Generate sprites only (for testing)
  ts-node run_pipeline.ts --generate --theme=fantasy
`);
    return;
  }

  // Run pipeline
  const pipeline = new SpritePipeline(options);
  const success = await pipeline.run();

  process.exit(success ? 0 : 1);
}

// Run
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { SpritePipeline };
