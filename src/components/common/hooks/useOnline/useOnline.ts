import { useEffect, useState } from 'react'

import { noop, useMainContext } from '@devtron-labs/devtron-fe-common-lib'

export const useOnline = ({ onOnline = noop, onOffline = noop }: { onOnline?: () => void; onOffline?: () => void }) => {
    const [online, setOnline] = useState(structuredClone(navigator.onLine))
    const { isAirgapped } = useMainContext()

    const handleOffline = () => {
        setOnline(false)
        if (onOffline) {
            onOffline()
        }
    }

    const handleOnline = () => {
        setOnline(navigator.onLine)
        onOnline()
    }

    useEffect(() => {
        if (isAirgapped) return null
        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('offline', handleOffline)
            window.removeEventListener('online', handleOnline)
        }
    }, [isAirgapped])

    return online
}
