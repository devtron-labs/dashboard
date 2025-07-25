import { useEffect, useRef, useState } from 'react'

import { noop, useMainContext } from '@devtron-labs/devtron-fe-common-lib'

import { INTERNET_CONNECTIVITY_INTERVAL } from '../constants'
import { getFallbackInternetConnectivity, getInternetConnectivity } from './service'

export const useOnline = ({ onOnline = noop }: { onOnline?: () => void }) => {
    const [online, setOnline] = useState(structuredClone(navigator.onLine))
    const abortControllerRef = useRef<AbortController>(new AbortController())
    const timeoutRef = useRef<NodeJS.Timeout>(null)
    const { isAirgapped } = useMainContext()

    const hideInternetConnectivityBanner = isAirgapped || window._env_.FEATURE_INTERNET_CONNECTIVITY_ENABLE

    const handleClearTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        abortControllerRef.current.abort()
    }

    const onConnectivitySuccess = (checkConnectivity) => {
        setOnline((prev) => {
            if (!prev) onOnline()
            return true
        })
        timeoutRef.current = setTimeout(checkConnectivity, INTERNET_CONNECTIVITY_INTERVAL)
    }

    const checkConnectivity = async () => {
        if (hideInternetConnectivityBanner) return

        handleClearTimeout()
        const controller = new AbortController()
        abortControllerRef.current = controller

        try {
            await getFallbackInternetConnectivity({
                controller: abortControllerRef.current,
            })
            onConnectivitySuccess(checkConnectivity)
        } catch {
            if (abortControllerRef.current.signal.aborted) {
                if (timeoutRef.current) {
                    timeoutRef.current = setTimeout(checkConnectivity, INTERNET_CONNECTIVITY_INTERVAL)
                }
                return
            }
            const fallbackController = new AbortController()
            abortControllerRef.current = fallbackController
            try {
                await getInternetConnectivity({
                    controller: abortControllerRef.current,
                })
                onConnectivitySuccess(checkConnectivity)
            } catch {
                if (!abortControllerRef.current.signal.aborted) {
                    setOnline(false)
                } else if (timeoutRef.current) {
                    timeoutRef.current = setTimeout(checkConnectivity, INTERNET_CONNECTIVITY_INTERVAL)
                }
            }
        }
    }

    const handleOffline = () => {
        handleClearTimeout()
        setOnline(false)
    }

    const handleOnline = async () => {
        // Verify connectivity when browser reports online
        await checkConnectivity()
    }

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        handleOnline()
    }, [])

    useEffect(() => {
        if (hideInternetConnectivityBanner) return null
        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
            window.removeEventListener('offline', handleOffline)
            window.removeEventListener('online', handleOnline)
            abortControllerRef.current.abort()
        }
    }, [isAirgapped])

    return online
}
