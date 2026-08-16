import styles from './Contact.module.css'

export function Contact() {
  return (
    <section className={styles.contact} aria-labelledby="contact-heading">
      <h2 id="contact-heading">Contact Leonardo</h2>
      <p>Open to discussing frontend architecture, React, and software engineering opportunities.</p>
      <address>
        <a href="mailto:cavazzanileonardo@gmail.com">cavazzanileonardo@gmail.com</a>
        <a href="tel:+12044038256">(204) 403-8256</a>
        <span>Calgary, AB, Canada</span>
      </address>
    </section>
  )
}
