import Footer from '@/components/navigation/Footer/Footer.jsx'
import Header from '@/components/navigation/Header/Header.jsx'
import styles from './AppLayout.module.css'

function AppLayout({ children }) {
  return (
    <div className={styles.shell}>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  )
}

export default AppLayout
