import { createContext, useContext, useState } from 'react'

const HomeDataContext = createContext(null)

export const HomeDataProvider = ({ children }) => {
  const [homeAnime, setHomeAnime] = useState([])
  return (
    <HomeDataContext.Provider value={{ homeAnime, setHomeAnime }}>
      {children}
    </HomeDataContext.Provider>
  )
}

export const useHomeData = () => {
  const ctx = useContext(HomeDataContext)
  if (!ctx) throw new Error('useHomeData must be used within HomeDataProvider')
  return ctx
}
