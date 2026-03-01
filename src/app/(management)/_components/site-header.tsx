"use client"

import { ShieldAlert, SidebarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"
import AutoBreadcrumb from "./breadcrumb"

export function SiteHeader() {
    const { toggleSidebar } = useSidebar()

    return (
        <header className="bg-background sticky top-0 z-50 flex w-full items-center outline">
            <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
                <Button
                    className="h-8 w-8"
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                >
                    <SidebarIcon />
                </Button>
                <Separator orientation="vertical" className="mr-2 h-4" />
                <AutoBreadcrumb />
                <div
                    className="ml-auto flex items-center gap-3 h-12 px-7 py-2 rounded-full shadow font-extrabold text-white text-lg tracking-wide border-2 border-red-800"
                    style={{
                        background: "linear-gradient(270deg, #b91c1c, #dc2626, #f472b6, #b91c1c)",
                        backgroundSize: "800% 800%",
                        animation: "gradientBGmove 5s ease-in-out infinite"
                    }}
                >
                    <ShieldAlert className="w-7 h-7 mr-2" strokeWidth={2.8} />
                    <span className="text-xl font-extrabold">管理画面</span>
                </div>
                <style>
                    {`
                        @keyframes gradientBGmove {
                            0% {background-position:0% 50%}
                            50% {background-position:100% 50%}
                            100% {background-position:0% 50%}
                        }
                    `}
                </style>
            </div>
        </header>
    )
}
