// app/admin/page.tsx
"use client"

import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "../lib/firebase"
import Link from "next/link"

export default function AdminDashboard() {
  const [user] = useAuthState(auth)

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Accès non autorisé</h1>
          <p>Vous devez être connecté pour accéder au panneau d'administration.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Panneau d'administration</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Carte Gestion des Streams */}
        <Link href="/admin/streams" 
          className="block bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Gestion des Streams</h2>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 10v4"></path>
              <path d="M12 13v-3"></path>
              <path d="M9 11v2"></path>
              <rect width="20" height="14" x="2" y="3" rx="2"></rect>
              <path d="M22 17H2"></path>
            </svg>
          </div>
          <p className="text-gray-600">Créez et gérez vos streams en direct</p>
          <div className="mt-4 text-blue-500 group-hover:text-blue-600">
            Gérer les streams →
          </div>
        </Link>

        {/* Carte Statistiques */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Statistiques</h2>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          </div>
          <p className="text-gray-600">Consultez les statistiques de vos streams</p>
          <div className="mt-4 text-gray-400">
            Bientôt disponible
          </div>
        </div>

        {/* Carte Utilisateurs */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Utilisateurs</h2>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <p className="text-gray-600">Gérez les utilisateurs et les permissions</p>
          <div className="mt-4 text-gray-400">
            Bientôt disponible
          </div>
        </div>
      </div>

      {/* Section des statistiques rapides */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-gray-500 text-sm mb-2">Streams actifs</h3>
          <p className="text-2xl font-bold">0</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-gray-500 text-sm mb-2">Total des spectateurs</h3>
          <p className="text-2xl font-bold">0</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-gray-500 text-sm mb-2">Streams créés</h3>
          <p className="text-2xl font-bold">0</p>
        </div>
      </div>
    </div>
  )
}