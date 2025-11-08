# Output Sprite Sheets

This directory contains the final packed sprite sheets ready for use in the game.

## Contents

After running `pack_sprites.py`, you'll find:

```
output/
├── default_100_percent/
│   └── 100-offline-sprite.png  (1233×68px - LDPI)
└── default_200_percent/
    └── 200-offline-sprite.png  (2466×136px - HDPI, 2x upscaled)
```

## Using in the Game

To use your custom sprites in the game, copy them to the assets directory:

```bash
# Backup original sprites (optional)
cp -r assets/default_100_percent assets/default_100_percent.backup
cp -r assets/default_200_percent assets/default_200_percent.backup

# Copy new sprites
cp output/default_100_percent/100-offline-sprite.png assets/default_100_percent/
cp output/default_200_percent/200-offline-sprite.png assets/default_200_percent/
```

Then open `index.html` in your browser to play with your custom theme!

## Sprite Sheet Layout

The sprite sheet contains all game sprites laid out horizontally:

| Sprite | Position (LDPI) | Size |
|--------|----------------|------|
| RESTART | (2, 2) | 36×32 |
| CLOUD | (86, 2) | 46×14 |
| PTERODACTYL | (134, 2) | 92×40 |
| CACTUS_SMALL | (228, 2) | 51×35 |
| CACTUS_LARGE | (332, 2) | 75×50 |
| MOON | (484, 2) | 160×40 |
| STAR | (645, 2) | 9×9 |
| TEXT_SPRITE | (655, 2) | 191×13 |
| TREX | (848, 2) | 262×47 |
| HORIZON | (2, 54) | 1200×12 |

The HDPI version uses exactly 2× these coordinates and dimensions.
