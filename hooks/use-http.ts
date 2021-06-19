import { useState, useCallback } from 'react'

const POST = 'POST'
const GET = 'GET'
type RequestConfig = {
  url: string,
  method?: typeof POST | typeof GET,
  headers?: HeadersInit,
  body?: BodyInit | null
}
const useHttp = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  const sendRequest = async <T = any>(requestConfig: RequestConfig, applyData: (data: T) => void) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(requestConfig.url, {
        method: requestConfig.method ? requestConfig.method : GET,
        headers: requestConfig.headers ? requestConfig.headers : {},
        body: requestConfig.body ? requestConfig.body : null
      })
      if (!response.ok) {
        throw new Error('Request failed!')
      }
      const data: T = await response.json()
      applyData(data)
    } catch (err) {
      setError(err.message || 'Something went wrong!');
    }
    setIsLoading(false)
  }

  return {
    isLoading,
    error,
    sendRequest
  }
}

export default useHttp