import { useEffect, useRef, useState } from 'react'

import { getIsRequestAborted, showError, useMainContext } from '@devtron-labs/devtron-fe-common-lib'

import { getInternetConnectivity } from '@Services/service'

export const useOnline = () => {
    const [online, setOnline] = useState(navigator.onLine)
    const realTimeConnectivityAbortRef = useRef<AbortController>()
    const { isAirgapped } = useMainContext()

    const checkRealConnectivity = async () => {
        realTimeConnectivityAbortRef.current = new AbortController()

        const timeoutId = setTimeout(() => realTimeConnectivityAbortRef.current.abort(), 10000)

        try {
            await getInternetConnectivity(realTimeConnectivityAbortRef.current)
            setOnline(true)
        } catch (error) {
            if (getIsRequestAborted(error)) {
                showError(error)
            }
            setOnline(false)
        } finally {
            clearTimeout(timeoutId)
        }
    }

    useEffect(() => {
        if (isAirgapped) return null
        const handleOffline = () => setOnline(false)

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        checkRealConnectivity()

        const intervalId = setInterval(checkRealConnectivity, 3000)

        window.addEventListener('offline', handleOffline)

        return () => {
            clearInterval(intervalId)
            window.removeEventListener('offline', handleOffline)
            realTimeConnectivityAbortRef.current?.abort()
        }
    }, [isAirgapped])

    return online
}
