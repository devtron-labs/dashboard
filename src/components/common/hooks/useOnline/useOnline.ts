import { useEffect, useRef, useState } from 'react'

import { getIsRequestAborted, noop, useMainContext } from '@devtron-labs/devtron-fe-common-lib'

import { getInternetConnectivity } from '@Services/service'

import { INTERNET_CONNECTIVITY_INTERVAL } from '../constants'
import { getFallbackInternetConnectivity } from './service'

export const useOnline = ({ onOnline = noop }: { onOnline?: () => void }) => {
    const [online, setOnline] = useState(structuredClone(navigator.onLine))
    const abortControllerRef = useRef<AbortController>(new AbortController())
    const timeoutRef = useRef<NodeJS.Timeout>(null)
    const { isAirgapped } = useMainContext()

    const handleClearTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        abortControllerRef.current.abort()
    }

    const checkConnectivity = async () => {
        if (isAirgapped) return

        handleClearTimeout()
        const controller = new AbortController()
        abortControllerRef.current = controller

        try {
            await getInternetConnectivity(abortControllerRef.current)
            setOnline((prev) => {
                if (!prev) {
                    onOnline()
                }
                return true
            })
            timeoutRef.current = setTimeout(checkConnectivity, INTERNET_CONNECTIVITY_INTERVAL)
        } catch (error) {
            try {
                await getFallbackInternetConnectivity(abortControllerRef.current)
                setOnline((prev) => {
                    if (!prev) onOnline()
                    return true
                })
            } catch {
                setOnline(false)
            } finally {
                if (!getIsRequestAborted(error)) {
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
        if (isAirgapped) return null
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
