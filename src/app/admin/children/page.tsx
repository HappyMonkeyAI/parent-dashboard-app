import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getChildrenForFamily } from "@/lib/queries";
import { AddChildForm } from "./add-child-form";
import { ChildList } from "./child-list";

export default async function ChildrenPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "parent") {
    redirect("/login");
  }

  const familyChildren = await getChildrenForFamily(session.user.familyId);

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <header className="mb-6">
        <Link
          href="/admin"
          className="text-sm font-bold text-accent hover:text-accent-hover"
        >
          ← Back to admin
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-ink">Children</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Manage child profiles. Each child gets their own login and schedule.
        </p>
      </header>

      <ChildList items={familyChildren} />

      <div className="rounded-md border border-border bg-surface p-6">
        <h2 className="text-lg font-bold text-ink">Add a child</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Create a profile and login for your child. They will use these
          details to log in to their dashboard.
        </p>
        <AddChildForm />
      </div>
    </main>
  );
}
