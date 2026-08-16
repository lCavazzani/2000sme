import { applicationsForSurface } from '../config/applicationRegistry'
import styles from './MobileLauncher.module.css'

export function MobileLauncher() {
  return (
    <nav className={styles.mobileLauncher} aria-label="Quick application entry">
      {applicationsForSurface('mobile').map((application) => (
        <a className={styles.entry} href={application.path} key={application.id}>
          <img src={application.icon} alt="" width={24} height={24} />
          <span>{application.mobileLabel}</span>
        </a>
      ))}
    </nav>
  )
}
