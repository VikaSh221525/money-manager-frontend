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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="min-h-screen bg-base-200">
      <Mainroutes />
    </div>
  )
}

export default App