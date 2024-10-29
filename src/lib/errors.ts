export type ActionResult<T> = {
    data?: T
    error?: {
        code: 'NOT_FOUND' | 'UNAUTHORIZED' | 'VALIDATION_ERROR'
        message: string
    }
}

export class ValidationError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'ValidationError'
    }
}

export function isKnownError(error: unknown): error is Error {
    return error instanceof ValidationError
} 