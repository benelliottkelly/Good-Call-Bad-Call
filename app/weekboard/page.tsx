// app/weekboard/page.tsx
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function WeekBoardRoot() {
  // Find the latest week
  const latestWeek = await prisma.week.findFirst({
    orderBy: { order: "desc" },
  });

  if (!latestWeek) {
    // No weeks yet
    return (
      <div className="p-6 text-center text-gray-800 dark:text-gray-200">
        <h1 className="text-2xl font-bold mb-4">No weeks created yet</h1>
        <p>Please check back once an admin has created a week.</p>
      </div>
    );
  }

  // Redirect to latest week
  return redirect(`/weekboard/${latestWeek.id}`);
}
