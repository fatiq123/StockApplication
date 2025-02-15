import { Layout } from 'antd'
import MainMenu from './components/MainMenu'
import { StorageProvider } from './context/StorageContext'
import ErrorBoundary from './components/ErrorBoundary'

function App(): JSX.Element {
  return (
    <ErrorBoundary>
      <StorageProvider>
        <MainMenu />
      </StorageProvider>
    </ErrorBoundary>
  )
}

export default App
