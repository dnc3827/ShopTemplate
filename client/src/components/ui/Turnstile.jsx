import { useEffect, useRef } from 'react'

const TURNSTILE_SITE_KEY = import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY

/**
 * Reusable Cloudflare Turnstile component.
 * Fixes rendering issues in SPAs by explicitly calling window.turnstile.render on mount.
 * 
 * @param {Object} props
 * @param {Function} props.onSuccess - Callback when token is received
 * @param {Function} [props.onExpired] - Callback when token expires
 * @param {Function} [props.onError] - Callback on error
 * @param {string} [props.theme] - 'light' | 'dark'
 */
export default function Turnstile({ onSuccess, onExpired, onError, theme = 'dark' }) {
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)
  const callbacks = useRef({ onSuccess, onExpired, onError })

  useEffect(() => {
    callbacks.current = { onSuccess, onExpired, onError }
  })

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return

    let isMounted = true

    const renderWidget = () => {
      if (!isMounted || !containerRef.current || !window.turnstile) return

      // If already rendered, don't re-render (handled by unmount cleanup usually)
      if (widgetIdRef.current !== null) return

      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: theme,
          callback: (token) => {
            if (callbacks.current.onSuccess) callbacks.current.onSuccess(token)
          },
          'expired-callback': () => {
            if (callbacks.current.onExpired) callbacks.current.onExpired()
          },
          'error-callback': () => {
            if (callbacks.current.onError) callbacks.current.onError()
          },
        })
      } catch (err) {
        console.error('Turnstile render error:', err)
      }
    }

    const loadScript = () => {
      if (document.getElementById('cf-turnstile-script')) {
        // Script already exists, wait for it to be ready if not already
        if (window.turnstile) {
          renderWidget()
        } else {
          // Poll until ready
          const interval = setInterval(() => {
            if (window.turnstile) {
              clearInterval(interval)
              renderWidget()
            }
          }, 100)
        }
        return
      }

      const script = document.createElement('script')
      script.id = 'cf-turnstile-script'
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      script.defer = true
      script.onload = renderWidget
      document.head.appendChild(script)
    }

    loadScript()

    return () => {
      isMounted = false
      if (widgetIdRef.current !== null && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [theme, onSuccess, onExpired, onError])

  if (!TURNSTILE_SITE_KEY) return null

  return (
    <div 
      ref={containerRef} 
      className="flex justify-center w-full overflow-hidden min-h-[65px]"
    ></div>
  )
}
