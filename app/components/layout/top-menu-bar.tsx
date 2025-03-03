"use client"

import { useState, KeyboardEvent } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Search, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { motion, AnimatePresence } from "framer-motion"
import { ConnectWallet } from "../../components/wallet/connect-wallet"

// ... rest of the file stays the same 