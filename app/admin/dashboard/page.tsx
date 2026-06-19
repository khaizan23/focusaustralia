import SidebarNav from "@/components/ui/sidebar-nav";

export default function AdminDashboard() {
    return (

      <main className="min-h-screen bg-neutral-50">
            <div className="flex flex-row flex-nowrap justify-start items-stretch gap-3">
            <SidebarNav role="admin" />
              <div className="grow shrink-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5">          
                <div className="border rounded-lg p-6 shadow-md">
                  <h2 className="text-lg font-semibold">Total users</h2>
                  <p className="text-gray-500">0 users</p>
                </div>
        
                <div className="border rounded-lg p-6 shadow-md">
                  <h2 className="text-lg font-semibold">Total Videos</h2>
                  <p className="text-gray-500">0 videos</p>
                </div>
        
                <div className="border rounded-lg p-6 shadow-md">
                  <h2 className="text-lg font-semibold">Storage used</h2>
                  <p className="text-gray-500">0 MB used</p>
                </div>  
              </div>
              </div>
            </div>
            </main>
    )
  }