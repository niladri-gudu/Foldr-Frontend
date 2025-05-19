import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to MyDrive</h1>
      <p className="mb-6 text-lg text-gray-600">
        Securely upload and manage your files in the cloud.
      </p>

      <SignedOut>
        <div className="space-x-4">
          <Link href="/sign-in">
            <Button variant="secondary" className="cursor-pointer">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button className="cursor-pointer">Sign Up</Button>
          </Link>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="space-x-4">
          <Link href="/home">
            <Button className="cursor-pointer">Go to Dashboard</Button>
          </Link>
        </div>
      </SignedIn>
    </div>
  );
}
