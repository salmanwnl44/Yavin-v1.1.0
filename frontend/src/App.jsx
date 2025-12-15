import EditorLayout from './components/editor/EditorLayout'
import { SettingsProvider } from './contexts/SettingsContext'
import './App.css'

function App() {
  return (
    <SettingsProvider>
      <EditorLayout />
    </SettingsProvider>
  )
}

export default App
