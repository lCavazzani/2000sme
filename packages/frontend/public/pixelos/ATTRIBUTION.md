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

## PXOS-X Static Application Icons

These four transparent 32 × 32px RGBA PNG source frames were supplied by the project owner in `pixelos-application-icon-package.zip` (archive SHA-256 `a87468700ce3fd64dd812dc47d557ea59b91cbb08a9b33f2466f6b39979e4e29`). PXOS-X imports only the approved `*-static-00.png` source frames, byte-for-byte, from the package `assets/` directory. Preview images, sprite sheets, metadata, and generated artwork are not shipped as launcher assets.

| Imported file | SHA-256 | Registry identity | Approved launcher role |
|---|---|---|---|
| `icons/pixelos-my-machine-static-00.png` | `f899ba8a97706e5b2f9cc7be22e232bf2cadcb288a0e96b130be7b8d17ba7614` | `my-computer` | MY MACHINE |
| `icons/pixelos-gallery-static-00.png` | `812f9dea61cab7ecbbd46a85bfe35bf7f9c4575d187a763e62233c0f7ec21442` | `gallery` | PIXEL GALLERY |
| `icons/pixelos-desktop-pet-static-00.png` | `d8102739d18cc31716648839967c896993d43df1cbd188704c14ec1ac7a49598` | `pet` | DESKTOP PET |
| `icons/pixelos-readme-static-00.png` | `248413ee1663c13990b82925f7f4b99780b1a18610852881c667c85e62d30f64` | `notepad` | README.TXT |

The imported icons remain decorative wherever the launcher or taskbar also exposes the matching application label. They are rendered only at approved integer scales with pixelated/crisp-edge image rendering.
