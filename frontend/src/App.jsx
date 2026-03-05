import React from 'react'
import { Toaster } from "react-hot-toast";
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import Register from './features/auth/pages/Register'
import Login from './features/auth/pages/Login'
import Landing from './features/Landing'
import Interview from './features/AI/Interview'

function App() {

  const router = createBrowserRouter([
    { path: '/', element: <Landing/> },
    { path: '/register', element: <Register/> },
    { path: '/login', element: <Login/> },
    { path: "/interview/:id", element:<Interview /> }
  ])

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#0f172a",
            color: "#fff",
            border: "1px solid #1e293b",
            borderRadius: "10px"
          }
        }}
      />

      <RouterProvider router={router} />
    </>
  )
}

export default App