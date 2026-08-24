import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart3, LayoutDashboard, FileText } from "lucide-react";
import { getBlogs } from "./actions";
import { BlogAdminClient } from "./BlogAdminClient";

export default async function SuperAdminBlogs() {
  const result = await getBlogs();
  if (!result.success) {
    // requireSuperadmin failed (unauthenticated / not an admin).
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white">
      {/* Sidebar Admin Nav */}
      <aside className="w-64 border-r border-gray-800 bg-gray-950 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <BarChart3 className="h-6 w-6 text-blue-500" />
          <span className="ml-2 font-bold text-white tracking-tight text-lg">CRO-Admin</span>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-900 rounded-md transition-colors">
            <LayoutDashboard className="h-5 w-5" /> Dashboard
          </Link>
          <Link href="/admin/blogs" className="flex items-center gap-3 px-3 py-2 bg-blue-900/20 text-blue-400 rounded-md transition-colors border border-blue-900/50">
            <FileText className="h-5 w-5" /> Manage Blogs
          </Link>
          <Link href="/dashboard/aio" className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-900 rounded-md transition-colors">
            <BarChart3 className="h-5 w-5" /> AEO Intelligence
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
          Superadmin Portal
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-gray-800 bg-gray-950 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-xl font-bold">Manage Blog Posts</h1>
          <Link href="/blog" className="text-sm text-gray-400 hover:text-white">View Public Blog</Link>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <BlogAdminClient initialBlogs={result.blogs as any} />
        </div>
      </main>
    </div>
  );
}
