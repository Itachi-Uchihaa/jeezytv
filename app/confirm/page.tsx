"use client"

import { useEffect, useState } from 'react'
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { useRouter } from 'next/navigation'

export default function ConfirmEmail() {
  const [message, setMessage] = useState('Vérification du lien...')
  const router = useRouter()

  useEffect(() => {
    const handleEmailSignIn = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn')
        
        if (!email) {
          email = window.prompt('Veuillez entrer votre email pour confirmation')
        }

        try {
          const result = await signInWithEmailLink(auth, email || '', window.location.href)
          window.localStorage.removeItem('emailForSignIn')
          setMessage('Connexion réussie!')
          router.push('/streams')
        } catch (error) {
          setMessage('Erreur lors de la connexion. Veuillez réessayer.')
          console.error(error)
        }
      }
    }

    handleEmailSignIn()
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Confirmation de connexion</h2>
        <p>{message}</p>
      </div>
    </div>
  )
}