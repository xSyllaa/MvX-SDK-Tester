import type React from "react"
import "@/styles/globals.css"
import { Inter } from "next/font/google"
import type { Metadata } from "next"
import { TopMenuBar } from "@/components/layout/top-menu-bar"
import { Footer } from "@/components/layout/footer"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "@/components/theme-provider"
import { ChatProvider } from "@/components/chat/chat-provider"
import { ChatToggle } from "@/components/chat/chat-toggle"
import { ChatInterface } from "@/components/chat/ChatInterface"

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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ChatProvider>
            <TooltipProvider>
              <div className="flex flex-col min-h-screen">
                <TopMenuBar />
                <div className="flex-1 flex flex-col lg:flex-row relative">
                  <div className="flex-1 flex justify-center transition-all duration-300">
                    <div className="w-full px-4 lg:px-8 max-w-full lg:max-w-6xl mx-auto">
                      {children}
                    </div>
                  </div>
                  <ChatInterface />
                </div>
                <Footer />
              </div>
              <ChatToggle />
            </TooltipProvider>
          </ChatProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'