import styles from './WelcomeCard.module.css'

function WelcomeCard({ eyebrow, title, children }) {
  return (
    <section className={styles.card}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{children}</p>
    </section>
  )
}

export default WelcomeCard
