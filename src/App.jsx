import { useState } from 'react'
import './App.css'
import Landing from './Landing'
import SaveTheDateCard from './SaveTheDateCard'

function App() {
  const [showSaveTheDate, setShowSaveTheDate] = useState(false)

  if (showSaveTheDate) {
    return <SaveTheDateCard onBack={() => setShowSaveTheDate(false)} />
  }

  return (
    <div className="app">
      <nav className="main-nav">
        <button 
          className="nav-button"
          onClick={() => setShowSaveTheDate(true)}
        >
          Save the Date Card
        </button>
      </nav>
      <Landing onBack={() => {}} />
    </div>
  )
}

export default App

