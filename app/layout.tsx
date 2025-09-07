import PlausibleProvider from "next-plausible"

import config from "@/config"
import { getSEOTags } from "@/libs/seo/seo"
import QueryProvider from "@/components/providers/QueryProvider"
import ClientLayout from "@/components/layout/LayoutClient"
import Sidebar from "@/components/layout/sidebar/Sidebar"
import Footer from "@/components/layout/Footer"

import "./globals.css"
import Header from "./dashboard/_components/Header"
// import { JalnanGothic } from "./globals.css";

// 기본 폰트
// const font = Inter({ subsets: ["latin"] });

// google 폰트는 필요 시 next/font로 적용하세요. (미사용 코드 제거)

// 커스텀 폰트(다운로드 받은 경우)는 public/fonts 경로에서 사용해주세요.

export const viewport = {
  themeColor: config.colors.main,
  width: "device-width",
  initialScale: 1,
}

// You can override them in each page passing params to getSOTags() function.
export const metadata = getSEOTags()

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="font-pretendard">
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
            <div className="flex">
              <Sidebar />
              <main className="flex-1 overflow-x-hidden md:ml-64">
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
