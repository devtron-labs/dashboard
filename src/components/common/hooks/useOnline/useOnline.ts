import { useEffect, useRef, useState } from 'react'

import { noop, useMainContext } from '@devtron-labs/devtron-fe-common-lib'

import { getInternetConnectivity } from '@Services/service'

import { INTERNET_CONNECTIVITY_INTERVAL } from '../constants'

export const useOnline = ({ onOnline = noop }: { onOnline?: () => void }) => {
    const [online, setOnline] = useState(structuredClone(navigator.onLine))
    const abortControllerRef = useRef<AbortController>(new AbortController())
    const timeoutRef = useRef<NodeJS.Timeout>(null)
    const { isAirgapped } = useMainContext()

    const checkConnectivity = async () => {
        if (isAirgapped) return
        // Cancel any pending request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }

        const controller = new AbortController()
        abortControllerRef.current = controller

        try {
            await getInternetConnectivity(abortControllerRef.current)
            setOnline(true)
            if (online) {
                onOnline()
            }
        } catch {
            setOnline(false)
        } finally {
            timeoutRef.current = setTimeout(checkConnectivity, INTERNET_CONNECTIVITY_INTERVAL)
        }
    }
    const handleOffline = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        abortControllerRef.current.abort()
        setOnline(false)
    }

    const handleOnline = async () => {
        // Verify connectivity when browser reports online
        await checkConnectivity()
    }

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
    }, [isAirgapped, onOnline])

    return online
}
