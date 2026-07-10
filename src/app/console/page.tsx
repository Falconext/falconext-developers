import { redirect } from "next/navigation";

export default function ConsoleRoot() {
  redirect("/console/api-keys");
}
