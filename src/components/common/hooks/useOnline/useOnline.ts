import { useEffect, useRef, useState } from 'react'

import { noop, useMainContext } from '@devtron-labs/devtron-fe-common-lib'

import { getInternetConnectivity } from '@Services/service'

import { INTERNET_CONNECTIVITY_INTERVAL } from '../constants'

export const useOnline = ({ onOnline = noop }: { onOnline?: () => void }) => {
    const [online, setOnline] = useState(navigator.onLine)
    const abortControllerRef = useRef<AbortController>()
    const timeoutRef = useRef<NodeJS.Timeout>()
    const { isAirgapped } = useMainContext()

    const checkConnectivity = async () => {
        // Cancel any pending request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }
        const controller = new AbortController()
        abortControllerRef.current = controller

        try {
            await getInternetConnectivity(abortControllerRef.current)
            setOnline(true)
            // TODO: Del this and uncomment code below
            onOnline()
            // if (!online) {
            //     onOnline()
            // }
        } catch {
            setOnline(false)
        } finally {
            if (!isAirgapped) {
                timeoutRef.current = setTimeout(checkConnectivity, INTERNET_CONNECTIVITY_INTERVAL)
            }
        }
    }
    const handleOffline = () => setOnline(false)
    const handleOnline = async () => {
        // Verify connectivity when browser reports online
        await checkConnectivity()
    }

    useEffect(() => {
        if (isAirgapped) return null

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        checkConnectivity()

        return () => {
            clearTimeout(timeoutRef.current)
            window.removeEventListener('offline', handleOffline)
            window.removeEventListener('online', handleOnline)
            abortControllerRef.current?.abort()
        }
    }, [isAirgapped])

    return online
}
