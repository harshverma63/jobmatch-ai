import styles from './Loader.module.css'

export default function Loader({ message = 'Analyzing with Groq AI...' }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.spinner} />
      <p className={styles.message}>{message}</p>
      <p className={styles.sub}>This may take 15–30 seconds for large lists</p>
    </div>
  )
}
