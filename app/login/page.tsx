import { PostCentreTitleLogo } from "@/components/postcentre-title-logo"
import { LoginForm } from "./LoginForm"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Brand Logo */}
        <div className="flex flex-col items-center mb-8">
          <PostCentreTitleLogo className="mb-3 h-16 w-48" />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">POSTCENTRE BATU PAHAT</h1>
          </div>
        </div>

        {/* Login Form */}
        <LoginForm />

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-700 transition-colors">Support</a>
            <span className="text-gray-300">•</span>
            <a href="#" className="hover:text-gray-700 transition-colors">Contact</a>
            <span className="text-gray-300">•</span>
            <a href="#" className="hover:text-gray-700 transition-colors">About</a>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            © 2024 POSTCENTRE BATU PAHAT. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
