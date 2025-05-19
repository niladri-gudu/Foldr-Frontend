import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

import { SidebarProvider } from '@/components/ui/sidebar';
import Sidebar from '@/components/AppSidebar';
import Navbar from '@/components/Navbar';
import UploadButton from '@/components/UploadButton';

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const { userId, getToken } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const token = await getToken();

  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
         'Content-Type': 'application/json',
        },
        credentials: 'include'
    })
    } catch (error) {
      console.error('Failed to sync user with backend:', error);
    }
  
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"
  
  return (
    <div className='flex'>
      <SidebarProvider defaultOpen={defaultOpen}>
        <Sidebar />
          <main className="w-full">
            <Navbar />
            <UploadButton />
            <div>{children}</div>
          </main>
      </SidebarProvider>
    </div>
  )
}
export default DashboardLayout