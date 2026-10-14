import { Suspense, use } from "react";
import RClient from "./RClient";

// Clean path-style short links (/r/<code>) as an alternative to the
// hash-style links (#/r/<code>) the studio copies. Resolution is
// client-side (links live in localStorage). params is only unwrapped inside
// the Suspense boundary so this route stays instant-navigable.
function CodeReader({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  return <RClient code={code} />;
}

export default function RPage({ params }: { params: Promise<{ code: string }> }) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-5 py-24 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-dora-deep">
            Opening the Anywhere Door…
          </p>
        </main>
      }
    >
      <CodeReader params={params} />
    </Suspense>
  );
}
