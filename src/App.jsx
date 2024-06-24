import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Menu } from './components/Menu'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { TetrisPage } from './pages/TetrisPage'
import { SnakePage } from './pages/SnakePage'
import { TicTacToePage } from './pages/TicTacToePage'


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Menu />} >
          <Route path="game/tetris" element={<TetrisPage />} />
          <Route path="game/snake" element={<SnakePage />} />
          <Route path="game/tictacktoe" element={<TicTacToePage/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
