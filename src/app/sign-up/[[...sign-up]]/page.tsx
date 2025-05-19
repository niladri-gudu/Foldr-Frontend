import { SignUp } from "@clerk/nextjs"

const signUp = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <SignUp afterSignOutUrl="/home" redirectUrl="/home" />
    </div>
  )
}

export default signUp
