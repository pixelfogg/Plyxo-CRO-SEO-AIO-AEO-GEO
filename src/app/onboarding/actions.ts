"use server"

import { db } from "@/db";
import { organizations, organizationMembers, subscriptions } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createOrganization(formData: FormData) {
  const name = formData.get("name") as string;
  
  if (!name || name.trim().length === 0) {
    throw new Error("Organization name is required");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Create a unique slug from the name
  let baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  if (!baseSlug) baseSlug = "org";
  
  const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  const slug = `${baseSlug}-${randomSuffix}`;

  try {
    // 1. Create Organization
    const [org] = await db.insert(organizations).values({
      name,
      slug,
    }).returning();

    // 2. Add user as admin to the organization
    await db.insert(organizationMembers).values({
      organizationId: org.id,
      userId: user.id,
      role: "admin",
    });

    // 3. Create default 'free' subscription
    await db.insert(subscriptions).values({
      organizationId: org.id,
      plan: "free",
      status: "active",
    });

    revalidatePath("/", "layout");
  } catch (error) {
    console.error("Failed to create organization:", error);
    throw new Error("Failed to create organization. Please try again.");
  }

  redirect("/dashboard");
}
