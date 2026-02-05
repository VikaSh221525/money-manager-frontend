import React, { useEffect } from 'react'
import Mainroutes from './routes/Mainroutes'
import { useAuthStore } from './store/authStore'

function App() {
  const { getMe, token } = useAuthStore();

  useEffect(() => {
    // If there's a token in localStorage, fetch the user data
    if (token) {
      getMe();
    }
  }, [getMe, token]);

  return (
    <div>
      <Mainroutes />
    </div>
  )
}

export default App