import { useEffect, useRef, useState } from 'react'

import { noop, useMainContext } from '@devtron-labs/devtron-fe-common-lib'

export const useOnline = ({ onOnline = noop, onOffline = noop }: { onOnline?: () => void; onOffline?: () => void }) => {
    const [online, setOnline] = useState(structuredClone(navigator.onLine))
    const timeoutRef = useRef<NodeJS.Timeout>(null)
    const { isAirgapped } = useMainContext()

    const handleOffline = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        setOnline(false)
        if (onOffline) {
            onOffline()
        }
    }

    const handleOnline = () => {
        if (!navigator.onLine) return
        setOnline(navigator.onLine)
        onOnline()
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
        }
    }, [isAirgapped])

    return online
}
