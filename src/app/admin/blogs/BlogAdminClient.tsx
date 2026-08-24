"use client";

import { useState, useTransition } from "react";
import { Save, PlusCircle, Trash2, Pencil, FileText } from "lucide-react";
import { saveBlog, deleteBlog } from "./actions";

type Blog = {
  id: string;
  title: string;
  slug: string;
  content: string;
  publishedAt: Date | string | null;
  updatedAt: Date | string | null;
};

export function BlogAdminClient({ initialBlogs }: { initialBlogs: Blog[] }) {
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setContent("");
  };

  const startEdit = (b: Blog) => {
    setEditingId(b.id);
    setTitle(b.title);
    setSlug(b.slug);
    setContent(b.content);
    setMessage(null);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = (publish: boolean) => {
    setMessage(null);
    startTransition(async () => {
      const res = await saveBlog({ id: editingId ?? undefined, title, slug, content, publish });
      if (res.success) {
        setMessage({ type: "ok", text: publish ? "Post published." : "Draft saved." });
        resetForm();
        const refreshed = await (await import("./actions")).getBlogs();
        if (refreshed.success) setBlogs(refreshed.blogs as Blog[]);
      } else {
        setMessage({ type: "err", text: res.error || "Failed to save post." });
      }
    });
  };

  const remove = (id: string) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    startTransition(async () => {
      const res = await deleteBlog(id);
      if (res.success) {
        setBlogs((prev) => prev.filter((b) => b.id !== id));
        if (editingId === id) resetForm();
      } else {
        setMessage({ type: "err", text: res.error || "Failed to delete." });
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {message && (
        <div className={`rounded-md px-4 py-3 text-sm ${message.type === "ok" ? "bg-green-900/30 text-green-300 border border-green-900/50" : "bg-red-900/30 text-red-300 border border-red-900/50"}`}>
          {message.text}
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-500" />
          {editingId ? "Edit Post" : "Create New Post"}
        </h2>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-gray-300">Post Title</label>
              <input
                id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter the title..."
                className="w-full bg-black border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="slug" className="text-sm font-medium text-gray-300">URL Slug (optional)</label>
              <input
                id="slug" type="text" value={slug} onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated from title"
                className="w-full bg-black border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium text-gray-300 flex justify-between">
              <span>Post Content (Markdown / plain text)</span>
              <span className="text-xs text-gray-500">Minimum 600 words recommended</span>
            </label>
            <textarea
              id="content" rows={15} value={content} onChange={(e) => setContent(e.target.value)}
              placeholder="Write your article here..."
              className="w-full bg-black border border-gray-700 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-y font-mono text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-800">
            {editingId && (
              <button type="button" onClick={resetForm} disabled={isPending}
                className="px-6 py-2 rounded-md border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors disabled:opacity-50">
                Cancel
              </button>
            )}
            <button type="button" onClick={() => submit(false)} disabled={isPending}
              className="px-6 py-2 rounded-md border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors disabled:opacity-50">
              Save Draft
            </button>
            <button type="button" onClick={() => submit(true)} disabled={isPending}
              className="flex items-center gap-2 px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50">
              {isPending ? <span className="animate-pulse">Working...</span> : <><Save className="h-4 w-4" /> Publish Post</>}
            </button>
          </div>
        </div>
      </div>

      {/* Existing posts */}
      <div className="bg-gray-950 border border-gray-800/50 rounded-xl p-6">
        <h4 className="font-semibold text-gray-300 flex items-center gap-2 mb-4">
          <PlusCircle className="h-4 w-4 text-blue-500" /> Existing Posts ({blogs.length})
        </h4>
        {blogs.length === 0 ? (
          <p className="text-sm text-gray-500">No posts yet. Create your first one above.</p>
        ) : (
          <ul className="divide-y divide-gray-800">
            {blogs.map((b) => (
              <li key={b.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-200 truncate">{b.title}</p>
                  <p className="text-xs text-gray-500 truncate">
                    /blog/{b.slug} · {b.publishedAt ? "Published" : "Draft"}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => startEdit(b)} disabled={isPending}
                    className="p-2 rounded-md border border-gray-700 text-gray-300 hover:bg-gray-800 disabled:opacity-50" aria-label="Edit post">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => remove(b.id)} disabled={isPending}
                    className="p-2 rounded-md border border-red-900/50 text-red-400 hover:bg-red-900/20 disabled:opacity-50" aria-label="Delete post">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
