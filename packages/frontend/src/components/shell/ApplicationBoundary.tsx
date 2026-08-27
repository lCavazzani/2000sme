import { Component, type ErrorInfo, type ReactNode } from 'react'
import styles from './ApplicationBoundary.module.css'

type ApplicationBoundaryProps = {
  /** Named in the fallback so a failure is attributable to one application. */
  application: string
  onRetry?: () => void
  children: ReactNode
}

type ApplicationBoundaryState = { error: Error | null }

/**
 * Contains a failure to the application window that caused it, so a dead
 * backend cannot take down the desktop shell around it.
 */
export class ApplicationBoundary extends Component<ApplicationBoundaryProps, ApplicationBoundaryState> {
  state: ApplicationBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ApplicationBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`${this.props.application} failed to render`, error, info.componentStack)
  }

  private readonly retry = () => {
    this.setState({ error: null })
    this.props.onRetry?.()
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <section className={styles.root} role="alert" aria-label={`${this.props.application} error`}>
        <p className={styles.heading}>{this.props.application} could not load.</p>
        {/* The boundary can catch arbitrary component faults, whose messages may
            leak internals. Details go to the console; visitors get a stable line. */}
        <p className={styles.detail}>Something went wrong inside this window. Try opening it again.</p>
        <button type="button" className={styles.retry} onClick={this.retry}>
          Retry
        </button>
      </section>
    )
  }
}
