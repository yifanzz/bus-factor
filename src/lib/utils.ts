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
