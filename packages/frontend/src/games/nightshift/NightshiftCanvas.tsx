import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { PIXEL_OS_ASSETS } from '../../config/pixelosAssets'
import { nightshiftPalette } from '../../theme/palette'
import {
  NIGHTSHIFT_LOGICAL_HEIGHT,
  NIGHTSHIFT_LOGICAL_WIDTH,
  NIGHTSHIFT_PLAYER_Y,
  type NightshiftInput,
  type NightshiftState,
} from './types'
import styles from './NightshiftWindow.module.css'

type NightshiftCanvasProps = {
  game: NightshiftState
  tapInput: (patch: Partial<NightshiftInput>) => void
  clearInput: () => void
  onToggleRun: () => void
  onPauseResume: () => void
  onRestart: () => void
}

const ROAD_LEFT = 64
const ROAD_RIGHT = 256
const VEHICLE_SIZE = 64
const ROAD_WIDTH = ROAD_RIGHT - ROAD_LEFT

type NightshiftImages = Record<string, HTMLImageElement>

function laneX(lane: number) {
  return ROAD_LEFT + 32 + lane * 64
}

function effectsReduced() {
  return document.documentElement.dataset.themeEffects === 'reduced'
    || window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function drawRepeatedStrip(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement | undefined,
  y: number,
  offset: number,
) {
  if (!image?.complete || image.naturalWidth === 0) return
  const width = image.naturalWidth
  const start = -((offset % width) + width)
  for (let x = start; x < NIGHTSHIFT_LOGICAL_WIDTH + width; x += width) {
    context.drawImage(image, x, y, width, image.naturalHeight)
  }
}

function drawPixelRoad(context: CanvasRenderingContext2D, images: NightshiftImages, distance: number) {
  const reduced = effectsReduced()
  const offset = reduced ? 0 : Math.floor(distance * 0.2)

  context.fillStyle = nightshiftPalette.sky
  context.fillRect(0, 0, NIGHTSHIFT_LOGICAL_WIDTH, NIGHTSHIFT_LOGICAL_HEIGHT)

  drawRepeatedStrip(context, images.city, 6, Math.floor(offset * 0.25))

  context.fillStyle = nightshiftPalette.ground
  context.fillRect(0, 38, NIGHTSHIFT_LOGICAL_WIDTH, NIGHTSHIFT_LOGICAL_HEIGHT - 38)
  drawRepeatedStrip(context, images.roadside, 42, Math.floor(offset * 0.55))

  context.fillStyle = nightshiftPalette.roadShoulder
  context.fillRect(ROAD_LEFT - 5, 0, ROAD_WIDTH + 10, NIGHTSHIFT_LOGICAL_HEIGHT)
  context.fillStyle = nightshiftPalette.roadSurface
  context.fillRect(ROAD_LEFT, 0, ROAD_WIDTH, NIGHTSHIFT_LOGICAL_HEIGHT)

  context.fillStyle = nightshiftPalette.laneEdge
  context.fillRect(ROAD_LEFT, 0, 3, NIGHTSHIFT_LOGICAL_HEIGHT)
  context.fillRect(ROAD_RIGHT - 3, 0, 3, NIGHTSHIFT_LOGICAL_HEIGHT)

  const dashOffset = reduced ? 0 : Math.floor(distance * 0.65) % 28
  context.fillStyle = nightshiftPalette.laneDash
  for (const x of [128, 192]) {
    for (let y = -28 + dashOffset; y < NIGHTSHIFT_LOGICAL_HEIGHT; y += 28) {
      context.fillRect(x, y, 2, 14)
    }
  }

  if (images.reflector?.complete && images.reflector.naturalWidth > 0) {
    const reflectorOffset = reduced ? 0 : Math.floor(distance * 0.45) % 32
    for (let y = -32 + reflectorOffset; y < NIGHTSHIFT_LOGICAL_HEIGHT; y += 32) {
      context.drawImage(images.reflector, ROAD_LEFT - 14, y, 16, 16)
      context.drawImage(images.reflector, ROAD_RIGHT - 2, y, 16, 16)
    }
  }
}

function drawVehicle(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement | undefined,
  lane: number,
  centerY: number,
  fallback: string,
) {
  const x = Math.round(laneX(lane) - VEHICLE_SIZE / 2)
  const y = Math.round(centerY - VEHICLE_SIZE / 2)
  if (image?.complete && image.naturalWidth > 0) {
    context.drawImage(image, x, y, VEHICLE_SIZE, VEHICLE_SIZE)
    return
  }

  context.fillStyle = fallback
  context.fillRect(x + 16, y + 8, 32, 48)
  context.fillStyle = nightshiftPalette.windshield
  context.fillRect(x + 22, y + 16, 20, 24)
}

function keyPatch(key: string): Partial<NightshiftInput> | undefined {
  if (key === 'ArrowLeft' || key.toLowerCase() === 'a') return { steer: -1 }
  if (key === 'ArrowRight' || key.toLowerCase() === 'd') return { steer: 1 }
  if (key === 'ArrowUp' || key.toLowerCase() === 'w') return { accelerate: true }
  if (key === 'ArrowDown' || key.toLowerCase() === 's') return { brake: true }
  return undefined
}

export function NightshiftCanvas({ game, tapInput, clearInput, onToggleRun, onPauseResume, onRestart }: NightshiftCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imagesRef = useRef<NightshiftImages>({})
  const [assetVersion, setAssetVersion] = useState(0)

  useEffect(() => {
    const sources = {
      player: PIXEL_OS_ASSETS.nightshiftPlayerCarVertical,
      playerDamage: PIXEL_OS_ASSETS.nightshiftPlayerCarVerticalDamage,
      coupe: PIXEL_OS_ASSETS.nightshiftTrafficCoupeVertical,
      van: PIXEL_OS_ASSETS.nightshiftTrafficVanVertical,
      city: PIXEL_OS_ASSETS.nightshiftTwilightCity,
      roadside: PIXEL_OS_ASSETS.nightshiftTwilightRoadside,
      reflector: PIXEL_OS_ASSETS.nightshiftTwilightReflector,
    }
    const images = imagesRef.current
    for (const [name, source] of Object.entries(sources)) {
      if (images[name]) continue
      const image = new Image()
      image.onload = () => setAssetVersion((version) => version + 1)
      image.src = source
      images[name] = image
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    context.imageSmoothingEnabled = false
    context.clearRect(0, 0, NIGHTSHIFT_LOGICAL_WIDTH, NIGHTSHIFT_LOGICAL_HEIGHT)
    drawPixelRoad(context, imagesRef.current, game.distance)
    for (const traffic of game.traffic) {
      drawVehicle(
        context,
        imagesRef.current[traffic.kind],
        traffic.lane,
        traffic.y,
        traffic.kind === 'coupe' ? nightshiftPalette.trafficCoupe : nightshiftPalette.trafficVan,
      )
    }
    drawVehicle(
      context,
      game.hits > 0 ? imagesRef.current.playerDamage : imagesRef.current.player,
      game.playerLane,
      NIGHTSHIFT_PLAYER_Y,
      game.hits > 0 ? nightshiftPalette.playerDamaged : nightshiftPalette.player,
    )
  }, [assetVersion, game])

  const handleKeyDown = (event: KeyboardEvent<HTMLCanvasElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      event.stopPropagation()
      onToggleRun()
      return
    }
    if (event.key.toLowerCase() === 'p' || event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      onPauseResume()
      return
    }
    if (event.key.toLowerCase() === 'r') {
      event.preventDefault()
      event.stopPropagation()
      onRestart()
      return
    }
    const patch = keyPatch(event.key)
    if (!patch) return
    event.preventDefault()
    event.stopPropagation()
    tapInput(patch)
  }

  const handleKeyUp = (event: KeyboardEvent<HTMLCanvasElement>) => {
    if (!keyPatch(event.key)) return
    event.preventDefault()
  }

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      width={NIGHTSHIFT_LOGICAL_WIDTH}
      height={NIGHTSHIFT_LOGICAL_HEIGHT}
      tabIndex={0}
      role="img"
      aria-label="NIGHTSHIFT highway playfield. Use the adjacent controls or arrow keys to steer and change speed."
      aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown Enter Space P Escape R"
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onBlur={clearInput}
    >
      NIGHTSHIFT highway playfield. Use the semantic controls below the canvas to drive.
    </canvas>
  )
}
