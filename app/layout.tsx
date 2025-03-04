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
import { MultiversXProvider } from "@/app/providers/dapp-provider"
import { Providers } from "@/app/providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MvXLib",
  description: "MultiversX SDK Testing Library",
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
        <Providers>
          <MultiversXProvider>
            <ChatProvider>
              <TooltipProvider>
                <div className="flex flex-col min-h-screen">
                  <TopMenuBar />
                  <div className="flex-1 flex flex-col lg:flex-row relative">
                    <div className="flex-1 min-w-0 transition-all duration-300 lg:pr-[var(--chat-width,0px)] overflow-x-hidden">
                      {children}
                    </div>
                    <ChatInterface />
                  </div>
                  <Footer />
                </div>
                <ChatToggle />
              </TooltipProvider>
            </ChatProvider>
          </MultiversXProvider>
        </Providers>
      </body>
    </html>
  )
}

import './globals.css'