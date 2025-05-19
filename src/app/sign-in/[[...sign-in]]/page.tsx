import { SignIn } from "@clerk/nextjs";

const SignInPage = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <SignIn afterSignOutUrl="/home" redirectUrl="/home" />
    </div>
  );
}

export default SignInPage;