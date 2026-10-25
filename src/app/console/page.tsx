import { redirect } from "next/navigation";
import { CONSOLA } from "@/config/consola";

export default function ConsoleRoot() {
  redirect(CONSOLA.inicio);
}
