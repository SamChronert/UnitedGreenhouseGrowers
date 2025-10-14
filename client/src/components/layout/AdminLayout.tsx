import AdminSidebar from "@/components/layout/AdminSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Skip to content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-white px-4 py-2 rounded-md shadow-lg z-50 text-sm font-medium text-gray-900 border-2 border-ugga-primary"
      >
        Skip to content
      </a>

      {/* Admin Sidebar Component */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Main Content Area */}
        <main 
          id="main-content" 
          className="flex-1 overflow-auto bg-gray-50" 
          role="main"
          aria-label="Main content"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
