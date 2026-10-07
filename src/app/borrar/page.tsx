import type { Metadata } from "next";
import { Suspense } from "react";
import DeleteConfirm from "./DeleteConfirm";

export const metadata: Metadata = { title: "Borrar mis datos · Vente", robots: { index: false } };

// Landing page for the link in the deletion email. Deleting needs a button
// press (a POST), so email scanners that open links can't delete anything.
export default function DeletePage() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-5 pb-10 pt-10">
      <Suspense>
        <DeleteConfirm />
      </Suspense>
    </main>
  );
}
