import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// Add new date utility function
export function toISOStringWithoutMs(date: Date): string {
    // Format: YYYY-MM-DDTHH:mm:ssZ
    return date.toISOString().split('.')[0] + 'Z'
}

export function isValidRepoFormat(repoName: string): boolean {
    // Check if the repo name matches the owner/repo format
    // Allow alphanumeric characters, hyphens, and underscores
    const pattern = /^[A-Za-z0-9][-A-Za-z0-9_]*\/[A-Za-z0-9][-A-Za-z0-9_]*$/
    return pattern.test(repoName)
}
