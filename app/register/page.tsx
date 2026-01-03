import { GalleryVerticalEnd } from "lucide-react"

import { SignupForm } from "./RegisterForm"

export default function SignupPage() {
  return (
    <div className="bg-gray-50 flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium text-gray-900">
          <div className="bg-blue-600 text-white flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          ParcelFlow
        </a>
        <SignupForm />
      </div>
    </div>
  )
}