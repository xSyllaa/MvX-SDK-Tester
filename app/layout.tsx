import type React from "react"
import "@/styles/globals.css"
import { Inter } from "next/font/google"
import type { Metadata } from "next"
import { Footer } from "@/components/layout/footer"

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
        {/* Your navbar component here */}
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}



import './globals.css'