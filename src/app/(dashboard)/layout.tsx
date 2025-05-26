import { cookies } from 'next/headers';

import { SidebarProvider } from '@/components/ui/sidebar';
import Sidebar from '@/components/AppSidebar';
import Navbar from '@/components/Navbar';
import UploadButton from '@/components/UploadButton';

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
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