/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
