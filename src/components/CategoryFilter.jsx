import styles from './CategoryFilter.module.css'

const CATEGORIES = [
  'SaaS', 'Fintech', 'EdTech', 'HealthTech', 'MarTech',
  'AI / ML', 'DevTools', 'E-commerce', 'FAANG / Big Tech', 'Startup', 'Any',
]

export default function CategoryFilter({ selected, onChange }) {
  const toggle = (cat) => {
    if (cat === 'Any') {
      onChange(selected.includes('Any') ? [] : ['Any'])
      return
    }
    const withoutAny = selected.filter(c => c !== 'Any')
    if (withoutAny.includes(cat)) {
      onChange(withoutAny.filter(c => c !== cat))
    } else {
      onChange([...withoutAny, cat])
    }
  }

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>Filter by category <span className={styles.optional}>(optional)</span></span>
      <div className={styles.chips}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            type="button"
            className={`${styles.chip} ${selected.includes(cat) ? styles.chipActive : ''}`}
            onClick={() => toggle(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  )
}
