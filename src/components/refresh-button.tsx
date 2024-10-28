'use client'

import { Button } from "@/components/ui/button"
import { ReloadIcon } from "@radix-ui/react-icons"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface RefreshButtonProps {
    handleRefresh: () => Promise<void>
}

export function RefreshButton({ handleRefresh }: RefreshButtonProps) {
    const [isRefreshing, setIsRefreshing] = useState(false)
    const router = useRouter()

    async function handleClick() {
        try {
            setIsRefreshing(true)
            // Fix: Actually call the handleRefresh function instead of handleClick
            await handleRefresh()
            router.refresh()
        } catch (error) {
            console.error('Failed to refresh:', error)
        } finally {
            setIsRefreshing(false)
        }
    }

    return (
        <Button
            variant="outline"
            onClick={handleClick}
            disabled={isRefreshing}
        >
            <ReloadIcon className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
    )
}
