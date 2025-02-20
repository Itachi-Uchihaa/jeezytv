"use client"

import { useState, useEffect } from "react"
import { sendSignInLinkToEmail, signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { auth } from "../lib/firebase"
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function Auth() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';

      await sendSignInLinkToEmail(auth, email, {
        url: `${window.location.origin}/confirm`,
        handleCodeInApp: true,
      })
      if (typeof window !== 'undefined') {
        window.localStorage.setItem("emailForSignIn", email)
      }
      setMessage("Un lien de connexion a été envoyé à votre adresse e-mail.")
    } catch (error) {
      setMessage("Erreur lors de l'envoi du lien de connexion.")
      console.error(error)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      
      // Obtenir le token ID
      const idToken = await result.user.getIdToken()
      
      // Envoyer le token à notre API pour créer la session
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session')
      }

      // Vérifier si l'utilisateur a des claims admin
      const tokenResult = await result.user.getIdTokenResult()
      
      setMessage("Connexion réussie!")
      
      // Rediriger en fonction des droits
      if (tokenResult.claims.admin) {
        router.push('/admin')
      } else {
        router.push('/streams')
      }
      
    } catch (error) {
      setMessage("Erreur lors de la connexion avec Google.")
      console.error(error)
    }
  }

  // Déconnexion
  const handleSignOut = async () => {
    try {
      await auth.signOut()
      // Supprimer le cookie de session
      await fetch('/api/auth/session', {
        method: 'DELETE',
      })
      router.push('/login')
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  // Vérifier la session au chargement
  useEffect(() => {
    const checkSession = async () => {
      const user = auth.currentUser
      if (user) {
        const tokenResult = await user.getIdTokenResult()
        if (tokenResult.claims.admin) {
          router.push('/admin')
        } else {
          router.push('/stream')
        }
      }
    }
    
    checkSession()
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        <h2 className="mb-6 text-2xl font-bold text-center">Connexion</h2>
        
        <form onSubmit={handleSignIn} className="space-y-4">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Entrez votre email"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button 
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Envoyer le lien de connexion
          </Button>
        </form>

        <div className="mt-4 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-gray-500">ou</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <Button
          onClick={handleGoogleSignIn}
          className="mt-4 w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Continuer avec Google</span>
        </Button>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-600">{message}</p>
        )}
      </div>
    </div>
  )
}