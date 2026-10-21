import { NextResponse, type NextRequest } from "next/server"
import { defaultLocale, isValidLocale } from "@/lib/dictionaries/locales"

const COOKIE_NAME = "silicortex-lang"

function negotiateLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get(COOKIE_NAME)?.value
  if (cookieLocale && isValidLocale(cookieLocale)) return cookieLocale

  const header = request.headers.get("accept-language") ?? ""
  for (const tag of header.split(",")) {
    const primary = tag.split(";")[0].trim().split("-")[0].toLowerCase()
    if (isValidLocale(primary)) return primary
  }
  return defaultLocale
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const firstSegment = pathname.split("/")[1]
  if (isValidLocale(firstSegment)) return NextResponse.next()

  const locale = negotiateLocale(request)
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
}
