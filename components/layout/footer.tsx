import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full border-t py-6">
      <div className="container flex flex-col items-center gap-4">
        

        {/* Signature avec lien vers Twitter */}
        <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            Made with <span className="text-red-500">❤</span> by{" "}
            <a
              href="https://x.com/xSylla_"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              Sylla
            </a>
          </div>
          <div>
            for {" "}
            <a
              href="https://multiversx.com/blog/ai-megawave-hackathon"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
               MultiversX AI Hackathon
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
} 