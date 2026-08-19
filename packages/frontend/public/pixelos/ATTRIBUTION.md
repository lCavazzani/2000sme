# PixelOS Reference Assets

## Provenance

These five raster files were supplied by the project owner in `leo-windows.zip` for the approved PixelOS pivot. They were copied byte-for-byte from the reference project without semantic edits.

| Imported file | SHA-256 | Reference role | PixelOS ownership |
|---|---|---|---|
| `assets/dda42e57-923b-4342-b2b1-8ad755273c99.jpg` | `75b0eac2ade594730831f455d79f7ce5a0716bea9e9a6ac5412ab7b3f8ae92d6` | Moonlit desktop wallpaper and Moonrise gallery piece | Desktop wallpaper now; future Pixel Gallery asset. |
| `assets/7dbdf7f0-0086-4ef8-8cbf-e345ae75e5de.jpg` | `c13d8a03d1d82bbb4875c53bfd13c9d9ab527107b408e8c05536c9c2de9202f6` | Mittens pet and Catsill gallery piece | Future Desktop Pet and Pixel Gallery asset. |
| `assets/109f5dfc-b775-4bf5-9a64-962651f649f6.jpg` | `7a8e1de4bb2f95144b5545e4df33263fea05c8c54127c640d30ee1a60d61ef16` | Floppy mascot | Future About PixelOS dialog asset. |
| `assets/57619517-ec8e-4409-b5e4-9b6c19235f98.jpg` | `1be898d83de2622b726da7376baba099aa2780fd44f3556953b7cf0e3f0b06e8` | Harbour gallery piece | Future Pixel Gallery asset. |
| `assets/b8f2dc8c-d0e5-4b1f-87bb-43b221e8b3a5.jpg` | `89b43336eb278b26de4dd0d00e728f98983251851872f5d29fa5e11ee8d2c445` | Cockpit gallery piece | Future Pixel Gallery asset. |

## Usage rules

1. Render all imported rasters with nearest-neighbor/pixelated image rendering.
2. Preserve the original filenames and source mapping in `src/config/pixelosAssets.ts`.
3. Do not repurpose an asset for unrelated app identity or edit its content without a new explicit product decision.
4. The reference archive contains no explicit license file. The owner-supplied archive and approved PixelOS pivot scope are the authorization record for this project-specific use.
5. The imported rasters are visual assets only. The reference source code and its separate window manager are not copied into 2000sme; PixelOS uses the existing tested OS behavior foundation.
