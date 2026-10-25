import { auth } from "@/auth";
import { CONSOLA } from "@/config/consola";

/** Sin sesión solo se ven el ingreso y el registro. */
const PUBLICAS = new Set(["/console/login", "/console/registro"]);

export default auth((req) => {
  const ruta = req.nextUrl.pathname;
  const isConsole = ruta.startsWith("/console");
  const esPublica = PUBLICAS.has(ruta);
  const isAuthed = !!req.auth;

  if (isConsole && !esPublica && !isAuthed) {
    const url = new URL("/console/login", req.nextUrl.origin);
    url.searchParams.set("next", ruta);
    return Response.redirect(url);
  }

  if (esPublica && isAuthed) {
    return Response.redirect(new URL(CONSOLA.inicio, req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/console/:path*"],
};
