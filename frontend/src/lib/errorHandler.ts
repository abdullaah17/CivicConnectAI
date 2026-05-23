/**
 * Error Handler Utility
 * Extracts meaningful error messages from API responses and provides user-friendly feedback
 */

import { AxiosError } from 'axios'

export interface ApiErrorResponse {
  success?: boolean
  error?: {
    message?: string
    code?: string
    // Backend PRD §2.3: details is an array of field-level errors on validation failures
    details?: Array<{ field?: string; message: string }> | Record<string, string> | string
  }
  message?: string
  statusCode?: number
}

/**
 * Extract meaningful error message from API error response
 * Falls back to generic message if specific error details not available
 */
export function getErrorMessage(error: unknown, defaultMessage: string = 'An error occurred. Please try again.'): string {
  // Handle Axios errors
  if (error instanceof AxiosError) {
    const status = error.response?.status
    const data = error.response?.data as ApiErrorResponse | undefined

    // Handle specific HTTP status codes
    if (status === 400) {
      return data?.error?.message || data?.message || 'Invalid request. Please check your input.'
    }
    if (status === 401) {
      return 'Your session has expired. Please log in again.'
    }
    if (status === 403) {
      return 'You do not have permission to perform this action.'
    }
    if (status === 404) {
      return 'The requested resource was not found.'
    }
    if (status === 409) {
      return data?.error?.message || 'This resource already exists or there is a conflict.'
    }
    if (status === 422) {
      // Validation error - extract field-specific errors if available
      const details = data?.error?.details
      if (Array.isArray(details) && details.length > 0) {
        // Backend PRD §2.3: array of { field, message } objects
        return details.map((d) => (d.field ? `${d.field}: ${d.message}` : d.message)).join('; ')
      }
      if (typeof details === 'object' && details !== null && !Array.isArray(details)) {
        const fieldErrors = Object.entries(details as Record<string, string>)
          .map(([field, message]) => `${field}: ${message}`)
          .join('; ')
        return fieldErrors || 'Validation failed. Please check your input.'
      }
      return data?.error?.message || 'Validation failed. Please check your input.'
    }
    if (status === 429) {
      return data?.error?.message || 'Too many requests. Please wait a moment and try again.'
    }
    if (status === 500) {
      return 'Server error. Please try again later.'
    }
    if (status === 503) {
      return 'Service temporarily unavailable. Please try again later.'
    }

    // Generic API error
    return data?.error?.message || data?.message || error.message || defaultMessage
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message || defaultMessage
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error
  }

  // Fallback to default message
  return defaultMessage
}

/**
 * Extract validation errors from API response
 * Returns object with field names as keys and error messages as values
 */
export function getValidationErrors(error: unknown): Record<string, string> {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined
    const details = data?.error?.details

    // Array format: [{ field, message }, ...]
    if (Array.isArray(details)) {
      return details.reduce<Record<string, string>>((acc, d) => {
        if (d.field) acc[d.field] = d.message
        return acc
      }, {})
    }

    // Object format: { field: message }
    if (typeof details === 'object' && details !== null) {
      return details as Record<string, string>
    }
  }

  return {}
}

/**
 * Check if error is a network error (no response from server)
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return !error.response
  }
  return false
}

/**
 * Check if error is a client error (4xx)
 */
export function isClientError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    const status = error.response?.status
    return status ? status >= 400 && status < 500 : false
  }
  return false
}

/**
 * Check if error is a server error (5xx)
 */
export function isServerError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    const status = error.response?.status
    return status ? status >= 500 : false
  }
  return false
}

/**
 * Check if error is a validation error (422)
 */
export function isValidationError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 422
  }
  return false
}

/**
 * Check if error is a rate limit error (429)
 */
export function isRateLimitError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 429
  }
  return false
}

/**
 * Get retry-after time from rate limit error (in seconds)
 */
export function getRetryAfter(error: unknown): number | null {
  if (error instanceof AxiosError) {
    const retryAfter = error.response?.headers['retry-after']
    if (retryAfter) {
      return parseInt(retryAfter, 10)
    }
  }
  return null
}
