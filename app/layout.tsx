import type React from "react"
import "@/styles/globals.css"
import { Inter } from "next/font/google"
import type { Metadata } from "next"
import { TopMenuBar } from "@/components/layout/top-menu-bar"
import { Footer } from "@/components/layout/footer"
import { TooltipProvider } from "@/components/ui/tooltip"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MvX SDK Analyzer",
  description: "Analyze SDKs & ABIs with precision",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TooltipProvider>
          <TopMenuBar />
          {children}
          <Footer />
        </TooltipProvider>
      </body>
    </html>
  )
}



import './globals.css'