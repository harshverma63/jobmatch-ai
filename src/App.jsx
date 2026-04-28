import { useState } from 'react'
import CsvMatcher from './pages/CsvMatcher'
import JobScorer from './pages/JobScorer'
import styles from './App.module.css'

const TABS = [
  {
    id: 'csv',
    label: 'CSV + CV Matcher',
    desc: 'Upload any company list and your CV to find the best-fit roles',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
  {
    id: 'scorer',
    label: 'Job URL Scorer',
    desc: 'Paste any job post link and your CV to get a detailed match score',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('csv')

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <div>
              <div className={styles.brandName}>JobMatch AI</div>
              <div className={styles.brandSub}>Powered by Gemini</div>
            </div>
          </div>
          <div className={styles.headerBadge}>Free to use</div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>Find your next job with AI</h1>
          <p className={styles.heroDesc}>
            Upload any company list — startups, big tech, FAANG — along with your CV and let Gemini AI find the most relevant open positions scored against your profile.
          </p>
        </div>

        <div className={styles.tabBar}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              <span className={styles.tabLabel}>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className={styles.tabDesc}>
          {TABS.find(t => t.id === activeTab)?.desc}
        </div>

        <div className={styles.content}>
          {activeTab === 'csv' && <CsvMatcher />}
          {activeTab === 'scorer' && <JobScorer />}
        </div>
      </main>

      <footer className={styles.footer}>
        <p>Built with React v19 + Vite · Powered by Gemini AI · Deploy on Vercel</p>
      </footer>
    </div>
  )
}
