import { EmptyState } from "./EmptyState";

/** Placeholder for a route whose module has not been built yet. Replace the whole page. */
export function ComingSoon({ title, owner }: { title: string; owner: string }) {
  return (
    <div className="mx-auto mt-10 max-w-xl">
      <h1 className="sr-only">{title}</h1>
      <EmptyState
        title={title}
        description="หน้านี้ยังไม่ได้พัฒนา"
        action={
          <p className="text-small text-fg-muted">
            Owner: <code>{owner}</code> module
          </p>
        }
      />
    </div>
  );
}
