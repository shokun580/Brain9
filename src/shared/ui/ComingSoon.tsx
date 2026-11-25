import { Card } from "./Card";

/** Placeholder for a route whose module has not been built yet. Replace the whole page. */
export function ComingSoon({ title, owner }: { title: string; owner: string }) {
  return (
    <Card className="mx-auto mt-10 max-w-xl text-center">
      <h1 className="text-2xl font-extrabold">{title}</h1>
      <p className="mt-2 text-text-2">หน้านี้ยังไม่ได้พัฒนา</p>
      <p className="mt-4 text-sm text-text-2">
        Owner: <code>{owner}</code> module
      </p>
    </Card>
  );
}
