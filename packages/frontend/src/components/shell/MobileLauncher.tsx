import { applicationsForSurface } from '../../config/applicationRegistry'
import styles from './MobileLauncher.module.css'

export function MobileLauncher() {
  return (
    <nav className={styles.mobileLauncher} aria-label="Portfolio applications">
      <div className={styles.introduction}>
        <h1>Explore the portfolio</h1>
        <p>Choose an application to open its touch-friendly page.</p>
      </div>
      <div className={styles.entries}>
        {applicationsForSurface('mobile').map((application) => (
          <a className={styles.entry} href={application.path} key={application.id}>
            <img src={application.icon} alt="" width={32} height={32} />
            <span>{application.mobileLabel}</span>
          </a>
        ))}
      </div>
    </nav>
  )
}
