import { redirect } from "next/navigation";

// The elderly home screen is the entry point. TODO(identity): send signed-out visitors to
// /login and centre-device visitors to their own entry flow once sessions exist.
export default function RootPage() {
  redirect("/home");
}
