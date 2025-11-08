# Processed Sprites

This directory contains sprites that have been processed by `process_ai_sprites.py`.

These sprites are ready to be packed into the final sprite sheet.

## Contents

After running the processing script, you'll find:

- `restart.png` - 36×32px
- `cloud.png` - 46×14px
- `pterodactyl.png` - 92×40px (2 frames combined horizontally)
- `cactus_small.png` - 51×35px (3 variations combined horizontally)
- `cactus_large.png` - 75×50px (3 variations combined horizontally)
- `moon.png` - 160×40px (7 phases combined horizontally)
- `star.png` - 9×9px
- `numbers.png` - 191×13px (digits + letters + "GAME OVER")
- `trex.png` - 262×47px (6 frames combined horizontally)
- `horizon.png` - 1200×12px

## Next Step

Pack these sprites into the final sprite sheet:

```bash
python pack_sprites.py --input processed_sprites/ --output output/
```

This will create:
- `output/default_100_percent/100-offline-sprite.png` (LDPI)
- `output/default_200_percent/200-offline-sprite.png` (HDPI - 2x upscaled)

## Preview

You can create a preview of all processed sprites:

```bash
python process_ai_sprites.py --input ai_generated/ --output processed_sprites/ --preview
```

This creates `processed_sprites/preview.png` showing all sprites with labels.
