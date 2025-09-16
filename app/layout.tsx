import { Noto_Sans_KR } from "next/font/google"
import PlausibleProvider from "next-plausible"

import { getSEOTags } from "@/libs/seo/seo"
import config from "@/config"
import Sidebar from "@/components/layout/sidebar/Sidebar"
import ClientLayout from "@/components/layout/LayoutClient"
import QueryProvider from "@/components/providers/QueryProvider"
import Footer from "@/components/layout/Footer"

import Header from "./dashboard/_components/Header"
import "./globals.css"

// import { JalnanGothic } from "./globals.css";

// 기본 폰트
// const font = Inter({ subsets: ["latin"] });

// google에서 제공하는 폰트는 다음과 같이 사용할 수 있습니다.
// 한글 제공하는 폰트 : Noto_Sans_KR, Nanum_Gothic, Nanum_Myeongjo, Do_Hyeon, Hahmlet, Orbit
const font = Noto_Sans_KR({
  // weight: ["400"], // 특정 weight만 추가하고 싶은 경우 주석 해제.
  subsets: ["latin"],
})

// 커스텀 폰트(다운로드 받은 경우)는 public/fonts 경로에서 사용해주세요.

export const viewport = {
  // Will use the primary color of your theme to show a nice theme color in the URL bar of supported browsers
  themeColor: config.colors.main,
  width: "device-width",
  initialScale: 1,
}

// This adds default SEO tags to all pages in our app.
// You can override them in each page passing params to getSOTags() function.
export const metadata = getSEOTags()

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="font-pretendard bg-base-200 overflow-x-hidden">
      {config.domainName && (
        <head>
          <PlausibleProvider domain={config.domainName} />
        </head>
      )}
      <body>
        {/* ClientLayout contains all the client wrappers (Crisp chat support, toast messages, tooltips, etc.) */}
        <QueryProvider>
          <ClientLayout>
            <Header />
            <div className="flex w-full min-w-0 overflow-x-hidden">
              <Sidebar />
              <main className="min-w-0 flex-1 overflow-x-hidden md:ml-64 mt-14">
                {children}
                <Footer />
              </main>
            </div>
          </ClientLayout>
        </QueryProvider>
      </body>
    </html>
  )
}
