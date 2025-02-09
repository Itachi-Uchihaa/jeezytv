"use client"

import { useState } from "react"
import { sendSignInLinkToEmail } from "firebase/auth"
import { auth } from "../lib/firebase"

export default function Auth() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await sendSignInLinkToEmail(auth, email, {
        url: `${window.location.origin}/confirm`,
        handleCodeInApp: true,
      })
      window.localStorage.setItem("emailForSignIn", email)
      setMessage("Un lien de connexion a été envoyé à votre adresse e-mail.")
    } catch (error) {
      setMessage("Erreur lors de l'envoi du lien de connexion.")
      console.error(error)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSignIn} className="p-8 bg-white rounded-lg shadow-md">
        <h2 className="mb-4 text-2xl font-bold text-center">Connexion</h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Entrez votre email"
          required
          className="mb-4"
        />
        <button type="submit" className="w-full">
          Envoyer le lien de connexion
        </button>
        {message && <p className="mt-4 text-center text-sm">{message}</p>}
      </form>
    </div>
  )
}

