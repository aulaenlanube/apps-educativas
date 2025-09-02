import React from 'react'
import BuscaElIntrusoBase from './BuscaElIntrusoBase'

// Componente wrapper para la versión general (no temática) del juego
// Usa el tema 'general' que tiene emojis variados
const BuscaElIntruso = () => {
  return <BuscaElIntrusoBase tema="general" />
}

export default BuscaElIntruso