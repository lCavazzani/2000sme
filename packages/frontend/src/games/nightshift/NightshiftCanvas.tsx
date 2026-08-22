import { useEffect, useRef, type KeyboardEvent } from 'react'
import { PIXEL_OS_ASSETS } from '../../config/pixelosAssets'
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
}

const ROAD_LEFT = 64
const ROAD_RIGHT = 256
const VEHICLE_SIZE = 64

function laneX(lane: number) {
  return ROAD_LEFT + 32 + lane * 64
}

function drawPixelRoad(context: CanvasRenderingContext2D, distance: number) {
  context.fillStyle = '#120b22'
  context.fillRect(0, 0, NIGHTSHIFT_LOGICAL_WIDTH, NIGHTSHIFT_LOGICAL_HEIGHT)

  context.fillStyle = '#25194a'
  for (let index = 0; index < 16; index += 1) {
    const x = (index * 29 - Math.floor(distance * 0.16)) % (NIGHTSHIFT_LOGICAL_WIDTH + 40)
    context.fillRect(x < 0 ? x + NIGHTSHIFT_LOGICAL_WIDTH + 40 : x, 50 + (index % 4) * 9, 18, 14)
  }

  context.fillStyle = '#1b1534'
  context.fillRect(ROAD_LEFT, 0, ROAD_RIGHT - ROAD_LEFT, NIGHTSHIFT_LOGICAL_HEIGHT)
  context.fillStyle = '#4de3d0'
  context.fillRect(ROAD_LEFT, 0, 3, NIGHTSHIFT_LOGICAL_HEIGHT)
  context.fillRect(ROAD_RIGHT - 3, 0, 3, NIGHTSHIFT_LOGICAL_HEIGHT)

  const dashOffset = Math.floor(distance * 0.65) % 28
  context.fillStyle = '#6d5aa8'
  for (const x of [128, 192]) {
    for (let y = -28 + dashOffset; y < NIGHTSHIFT_LOGICAL_HEIGHT; y += 28) {
      context.fillRect(x, y, 2, 14)
    }
  }

  context.fillStyle = '#df4fbc'
  for (let y = 8; y < NIGHTSHIFT_LOGICAL_HEIGHT; y += 32) {
    context.fillRect(ROAD_LEFT - 7, (y + dashOffset) % NIGHTSHIFT_LOGICAL_HEIGHT, 3, 4)
    context.fillRect(ROAD_RIGHT + 4, (y + dashOffset) % NIGHTSHIFT_LOGICAL_HEIGHT, 3, 4)
  }
}

function drawVehicle(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement | undefined,
  lane: number,
  centerY: number,
) {
  const x = Math.round(laneX(lane) - VEHICLE_SIZE / 2)
  const y = Math.round(centerY - VEHICLE_SIZE / 2)
  if (image?.complete && image.naturalWidth > 0) {
    context.drawImage(image, x, y, VEHICLE_SIZE, VEHICLE_SIZE)
    return
  }

  context.fillStyle = '#4de3d0'
  context.fillRect(x + 16, y + 16, 32, 32)
  context.fillStyle = '#120b22'
  context.fillRect(x + 22, y + 22, 20, 20)
}

function keyPatch(key: string): Partial<NightshiftInput> | undefined {
  if (key === 'ArrowLeft' || key.toLowerCase() === 'a') return { steer: -1 }
  if (key === 'ArrowRight' || key.toLowerCase() === 'd') return { steer: 1 }
  if (key === 'ArrowUp' || key.toLowerCase() === 'w') return { accelerate: true }
  if (key === 'ArrowDown' || key.toLowerCase() === 's') return { brake: true }
  return undefined
}

export function NightshiftCanvas({ game, tapInput, clearInput, onToggleRun }: NightshiftCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imagesRef = useRef<Record<string, HTMLImageElement>>({})

  useEffect(() => {
    const sources = {
      player: PIXEL_OS_ASSETS.nightshiftPlayerCar,
      coupe: PIXEL_OS_ASSETS.nightshiftTrafficCoupe,
      van: PIXEL_OS_ASSETS.nightshiftTrafficVan,
    }
    const images = imagesRef.current
    for (const [name, source] of Object.entries(sources)) {
      if (images[name]) continue
      const image = new Image()
      image.src = source
      image.onload = () => {
        const canvas = canvasRef.current
        const context = canvas?.getContext('2d')
        if (!canvas || !context) return
        context.imageSmoothingEnabled = false
        drawPixelRoad(context, game.distance)
      }
      images[name] = image
    }
  }, [game.distance])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    context.imageSmoothingEnabled = false
    context.clearRect(0, 0, NIGHTSHIFT_LOGICAL_WIDTH, NIGHTSHIFT_LOGICAL_HEIGHT)
    drawPixelRoad(context, game.distance)
    for (const traffic of game.traffic) {
      drawVehicle(context, imagesRef.current[traffic.kind], traffic.lane, traffic.y)
    }
    drawVehicle(context, imagesRef.current.player, game.playerLane, NIGHTSHIFT_PLAYER_Y)
  }, [game])

  const handleKeyDown = (event: KeyboardEvent<HTMLCanvasElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onToggleRun()
      return
    }
    const patch = keyPatch(event.key)
    if (!patch) return
    event.preventDefault()
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
      aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown Enter Space"
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onBlur={clearInput}
    >
      NIGHTSHIFT highway playfield. Use the semantic controls below the canvas to drive.
    </canvas>
  )
}
