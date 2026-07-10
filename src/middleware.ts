import { auth } from "@/auth";

export default auth((req) => {
  const isConsole = req.nextUrl.pathname.startsWith("/console");
  const isLoginPage = req.nextUrl.pathname === "/console/login";
  const isAuthed = !!req.auth;

  if (isConsole && !isLoginPage && !isAuthed) {
    const url = new URL("/console/login", req.nextUrl.origin);
    url.searchParams.set("next", req.nextUrl.pathname);
    return Response.redirect(url);
  }

  if (isLoginPage && isAuthed) {
    return Response.redirect(new URL("/console/api-keys", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/console/:path*"],
};
