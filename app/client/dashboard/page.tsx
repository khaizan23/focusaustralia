import SidebarNav from "@/components/ui/sidebar-nav"

export default function ClientDashboard() {
    return (
      <main className="min-h-screen">
      <div className="flex flex-row flex-nowrap justify-start items-stretch gap-3">
      <SidebarNav role="client" />
        <div className="grow shrink-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5">          
          <div className="border rounded-lg p-6 shadow-md">
            <h2 className="text-lg font-semibold">My Videos</h2>
            <p className="text-gray-500">0 videos uploaded</p>
          </div>
  
          <div className="border rounded-lg p-6 shadow-md">
            <h2 className="text-lg font-semibold">Storage Used</h2>
            <p className="text-gray-500">0 MB used</p>
          </div>
  
          <div className="border rounded-lg p-6 shadow-md">
            <h2 className="text-lg font-semibold">Last Upload</h2>
            <p className="text-gray-500">No uploads yet</p>
          </div>  
        </div>
        </div>
      </div>
      </main>
    )
  }