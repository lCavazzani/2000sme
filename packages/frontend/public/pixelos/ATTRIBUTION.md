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

## PXOS-X Supplemental Application Icons

Two additional transparent 32 × 32px RGBA PNG source frames were supplied by the project owner in `2-pixelos-application-icon-package.zip` (archive SHA-256 `c1132fa33ea3c656258f3da6358c5957fb8ae0f559c6f8d9a12cf0bee153ccc7`). The archive’s four previously imported source frames exactly match the existing PXOS-X files by SHA-256; this supplemental delivery adds only the two rows below. PXOS-X imports only the approved `*-static-00.png` source frames, byte-for-byte. Preview images, sprite sheets, metadata, and generated artwork are not shipped as launcher assets.

| Imported file | SHA-256 | Registry identity | Approved launcher role |
|---|---|---|---|
| `icons/pixelos-about-me-static-00.png` | `597cb4399a06930b314141e881f014dd2adac00313c0b577cc3e63bec47bfe13` | `about` | ABOUT PIXELOS |
| `icons/pixelos-resume-static-00.png` | `6a38cc6cf5a167de85c08fdb5e3908f7c7427fea6c120211215c8f6092795cc4` | `resume` | RESUME.PDF |

## PXOS-11 Entrance Sequence Assets

Two transparent static pixel-art source frames were supplied by the project owner in `pixelos-entrance-sequence-package.zip` (archive SHA-256 `4e80ed105a1ab6232a03880ebe33c309df0ec07c580c12c209ad8c6ab057a77f`). PXOS-11 imports only the approved `*-static-00.png` frames byte-for-byte. Visual references, sprite sheets, metadata, and handoff documents are not shipped as runtime assets.

| Imported file | SHA-256 | Native dimensions | Approved role |
|---|---|---:|---|
| `intro/pixelos-boot-beacon-static-00.png` | `cfc186ef40e394ca494c6a76f445568ff2c7b75169ebde51d665bce6c5125c7f` | 32 × 32 px | Decorative Boot Card beacon; empty alt text and hidden from assistive technology. |
| `intro/pixelos-owner-emblem-static-00.png` | `7b4496ed3f4aeb994d0943674ca9cf705de2eb6cbab5ab3b7d2d65a42ccfd325` | 64 × 64 px | Decorative Enter PixelOS emblem; adjacent semantic identity text remains authoritative. |

Both frames must retain integer pixel scaling and `image-rendering: pixelated`; they must not be smoothed, recolored, rotated, or animated.

## GAME-9 NIGHTSHIFT.EXE Vehicle Kit

Three transparent 64 × 64px original vehicle source frames and their metadata were supplied by the project owner in `nightshift-exe-vehicle-kit.zip` (archive SHA-256 `26e7e18f69c6c3a477aee9128303e49997299660127582c0b23f4893f1025633`). GAME-9 imports only the approved `*-static-00.png` frames and `nightshift-vehicle-kit.json` metadata into the future-game asset path. The contiguous source sheet and the source-package handoff document are not shipped at runtime.

| Imported file | SHA-256 | Future Canvas 2D role | Rendering boundary |
|---|---|---|---|
| `games/nightshift/nightshift-player-car-static-00.png` | `e464505f84edfddf12d22a4249d45ca0157a3d653c8c569c01bd7056286df7bb` | Original player vehicle | Integer-only `drawImage()` scale with smoothing disabled; decorative sprite only. |
| `games/nightshift/nightshift-traffic-violet-coupe-static-00.png` | `423aa193c9688c0feb2d975981cd000cf15cdda5471ec5d447950ede201ca856` | Low violet traffic silhouette | Integer-only Canvas scale; future deterministic traffic role. |
| `games/nightshift/nightshift-traffic-amber-van-static-00.png` | `c79e6199525b63b1362945ee371f11203366eb5ca894a69a786a3ff00a9baba3` | Tall amber traffic silhouette | Integer-only Canvas scale; future readable traffic variation. |
| `games/nightshift/nightshift-vehicle-kit.json` | `a704a5e4f7926325f225883fd8e55cdfe4196720c849caf7759eb0c2ecf53254` | Canonical source-frame order and descriptive metadata | Supports a future asset loader; does not replace semantic DOM control/status text. |

No GAME-9 asset may be smoothed, recolored, rotated, branded, or used as the sole functional text/control surface.

## GAME-13 Minesweeper Victory Assets
Two transparent static pixel-art source frames were supplied by the project owner in `pixelos-minesweeper-victory-package.zip` (archive SHA-256 `72b46151a26289476a0d0dd542fec28e3255e2eee3bf4585b0b831ed159ab6e5`). GAME-13 imports only the approved native `*-static-00.png` frames, byte-for-byte. Preview images, sheets, metadata, visual reference, and handoff documents are not shipped at runtime.

| Imported file | SHA-256 | Native dimensions | Approved role |
|---|---|---:|---|
| `icons/pixelos-minesweeper-static-00.png` | `7f65e6bb9cc38f7d5ab3d2d4510c33270db5bf9ccd22b7ae5df211185f5d10ac` | 32 × 32 px | Minesweeper registry, desktop, Start-menu, taskbar, and mobile launcher icon. |
| `icons/pixelos-minesweeper-victory-burst-static-00.png` | `1fb03e0a95b3e692e3a4a3f4210df0bdd39677d0c62ebb75640f2c023d0dc9c5` | 16 × 16 px | Decorative, aria-hidden, pointer-transparent spark within the local ALL CLEAR victory overlay. |

Both frames must retain pixelated/crisp-edge integer scaling. The victory burst is not a semantic control, a status announcement, or a repeating/flickering effect.

## PXOS-12 Portrait Family

Three transparent static pixel-art owner portraits were supplied by the project owner in `pixelos-portrait-asset-package.zip` (archive SHA-256 `36f9c8d4ac808943be6e44ef081a6b29cff6c753203a083d8db05d7cf9ed844f`). PXOS-12 imports only the approved native `*-00.png` frames, byte-for-byte. Preview images, sheets, metadata, and handoff documents are not shipped at runtime.

| Imported file | SHA-256 | Native dimensions | Approved role |
|---|---|---:|---|
| `portraits/pixelos-leonardo-entry-hero-00.png` | `8491a1773fefbd35b159f8f92fafd49a38fd7094c6d609cc25443cbaa98c33a8` | 128 × 128 px | Decorative Stage 2 Enter PixelOS portrait; adjacent owner name and role remain authoritative. |
| `portraits/pixelos-leonardo-profile-64-00.png` | `ef85f8093bd63aaa518851e1d9783e09c421660e03f522724eba1ee2c1c5000e` | 64 × 64 px | Decorative portrait within the explicitly labelled static Resume owner context. |
| `portraits/pixelos-leonardo-profile-32-00.png` | `621e1d1e54e56dae0660a777b31d13cb27c0aeaf1b020346e9de5a4e1daf2e19` | 32 × 32 px | Registered compact portrait variant; not used as a desktop application icon or presence indicator. |

All portraits must retain integer pixel scaling and pixelated/crisp-edge rendering. They are static identity imagery only: no live presence, typing state, automated chat claim, authentication, or audio behavior may be attached.

## GAME-14 NIGHTSHIFT Visual Reset Assets

Seven approved original pixel-art source frames were supplied by the project owner in `nightshift-visual-reset.zip` (archive SHA-256 `071611bd48dfa4d08a8419d2a8decee2bcbf55d0ca187d29010d2b1db33cf90a`). GAME-14 imports only the native source frames listed below. Preview mockups, combined sheets, JSON metadata, and handoff documents are not shipped at runtime.

| Imported file | SHA-256 | Native dimensions | Approved role |
|---|---:|---:|---|
| `games/nightshift/nightshift-player-car-vertical-static-00.png` | `0e58fedee1167063cb5e61feec10de3604202e1f1afb1966dc488aa09da578cd` | 64 × 64 px | Top-facing NIGHTSHIFT player vehicle for integer Canvas rendering. |
| `games/nightshift/nightshift-player-car-vertical-damage-static-00.png` | `de8f02f159e5699bcec596d7836251fea5c17265ecce8b1d4cb47b8578d7b078` | 64 × 64 px | Static local-damage player rendering after engine collision state. |
| `games/nightshift/nightshift-traffic-violet-coupe-vertical-static-00.png` | `6744d26baf4ec26f59d993d96aceb9ad58c343979bfa88b0c4aff4636dab00ab` | 64 × 64 px | Top-facing violet coupe traffic sprite. |
| `games/nightshift/nightshift-traffic-amber-van-vertical-static-00.png` | `e893293d13d9e04c8c30909754107497574f899b7ff67a00f22561db2d193da7` | 64 × 64 px | Top-facing amber van traffic sprite. |
| `games/nightshift/nightshift-twilight-city-parallax-strip-static-00.png` | `56ff6293916661da9aa6603d9fb268db3d215575a310a60a6af9cc745b222aee` | 128 × 32 px | Optional integral city backdrop pass. |
| `games/nightshift/nightshift-twilight-roadside-strip-static-00.png` | `09ebcd0ffc08f73a820485e7443553b98a2aa53d41f59fa8b5ab10c7a4342469` | 128 × 32 px | Optional integral roadside pass. |
| `games/nightshift/nightshift-twilight-road-reflector-tile-static-00.png` | `d75c23389a3342e77d7642fbdac26dd2d7d4a1a7e1502f3d083905cc9c4b59ac` | 32 × 32 px | Optional cyan road-edge reflector after canonical Canvas road/lane geometry. |

All GAME-14 sources retain integer `drawImage()` destinations, unrotated top-facing orientation, and `imageSmoothingEnabled = false`. The scenery remains decorative and may fail or become static without changing NIGHTSHIFT rules, semantic status, controls, or collision authority.
