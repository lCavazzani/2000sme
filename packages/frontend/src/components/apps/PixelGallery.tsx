import { useMemo, useState } from 'react'
import { PIXEL_OS_GALLERY } from '../../config/pixelosAssets'
import styles from './PixelGallery.module.css'

type GalleryItem = (typeof PIXEL_OS_GALLERY)[number]

const ALT_TEXT: Record<GalleryItem['id'], string> = {
  harbour: 'Pixel-art harbour at dusk beneath a violet sky',
  cockpit: 'Pixel-art spacecraft cockpit looking into a nebula',
  moonrise: 'Pixel-art moonrise desktop landscape with a dark shoreline',
  catsill: 'Pixel-art orange cat resting on a windowsill',
}

export function PixelGallery() {
  const [activeId, setActiveId] = useState<GalleryItem['id']>(PIXEL_OS_GALLERY[0].id)
  const activeItem = useMemo(
    () => PIXEL_OS_GALLERY.find((item) => item.id === activeId) ?? PIXEL_OS_GALLERY[0],
    [activeId],
  )

  return (
    <section className={styles.root} aria-label="Pixel Gallery">
      <div className={styles.menuBar} aria-label="Pixel Gallery menu">
        <span>File</span>
        <span>View</span>
        <span>Help</span>
      </div>

      <div className={styles.content}>
        <figure className={styles.preview} aria-live="polite">
          <div className={styles.imageFrame}>
            <img src={activeItem.src} alt={ALT_TEXT[activeItem.id]} className={styles.image} />
          </div>
          <figcaption>
            <strong>{activeItem.title}</strong>
            <span>{activeItem.caption}</span>
          </figcaption>
        </figure>

        <div className={styles.thumbnailPanel} aria-label="Gallery images">
          <p className={styles.thumbnailHeading}>IMAGES</p>
          <div className={styles.thumbnailList} role="list">
            {PIXEL_OS_GALLERY.map((item) => {
              const isActive = item.id === activeItem.id
              return (
                <div key={item.id} role="listitem">
                  <button
                    type="button"
                    className={styles.thumbnailButton}
                    onClick={() => setActiveId(item.id)}
                    aria-pressed={isActive}
                    aria-label={`Show ${item.title}`}
                  >
                    <img src={item.src} alt="" className={styles.thumbnail} />
                    <span>{item.title.replace('.PNG', '')}</span>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="status-bar" aria-label="Pixel Gallery status">
        <p className="status-bar-field">{activeItem.title}</p>
        <p className="status-bar-field">{activeItem.caption}</p>
      </div>
    </section>
  )
}
