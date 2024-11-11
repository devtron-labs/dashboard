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

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { deepEquals } from '@rjsf/utils'
import { UseRegisterShortcutContext } from './UseRegisterShortcutContext'
import { UseRegisterShortcutProviderType, ShortcutType, UseRegisterShortcutContextType } from './types'
import { preprocessKeys, verifyCallbackStack } from './utils'

const IGNORE_TAGS_FALLBACK = ['input', 'textarea', 'select']
const DEFAULT_TIMEOUT = 300

const UseRegisterShortcutProvider = ({
    ignoreTags,
    preventDefault = false,
    shortcutTimeout,
    children,
}: UseRegisterShortcutProviderType) => {
    const disableShortcutsRef = useRef<boolean>(false)
    const shortcutsRef = useRef<Record<string, ShortcutType>>({})
    const keysDownRef = useRef<Set<Uppercase<string>>>(new Set())
    const keyDownTimeoutRef = useRef<ReturnType<typeof setTimeout>>(-1)
    const ignoredTags = ignoreTags ?? IGNORE_TAGS_FALLBACK

    const registerShortcut: UseRegisterShortcutContextType['registerShortcut'] = useCallback(
        ({ keys, callback, description = '' }) => {
            const { keys: processedKeys, id } = preprocessKeys(keys)
            if (typeof callback !== 'function') {
                throw new Error('callback provided is not a function')
            }

            const match =
                shortcutsRef.current[id] && deepEquals(shortcutsRef.current[id].keys, keys)
                    ? shortcutsRef.current[id]
                    : null

            if (match) {
                verifyCallbackStack(match.callbackStack)
                match.callbackStack.push(callback)
                return
            }

            shortcutsRef.current[id] = { keys: processedKeys, callbackStack: [callback], description }
        },
        [],
    )

    const unregisterShortcut: UseRegisterShortcutContextType['unregisterShortcut'] = useCallback((keys) => {
        const { id } = preprocessKeys(keys)

        if (!shortcutsRef.current[id]) {
            return
        }

        const { callbackStack } = shortcutsRef.current[id]
        verifyCallbackStack(callbackStack)
        callbackStack.pop()

        if (!callbackStack.length) {
            // NOTE: delete the shortcut only if all registered callbacks are unregistered
            // if 2 shortcuts are registered with the same keys then there needs to be 2 unregister calls
            delete shortcutsRef.current[id]
        }
    }, [])

    const setDisableShortcuts: UseRegisterShortcutContextType['setDisableShortcuts'] = useCallback((shouldDisable) => {
        disableShortcutsRef.current = shouldDisable
    }, [])

    const triggerShortcut: UseRegisterShortcutContextType['triggerShortcut'] = useCallback((keys) => {
        const { id } = preprocessKeys(keys)

        if (!shortcutsRef.current[id]) {
            return
        }

        const { callbackStack } = shortcutsRef.current[id]
        verifyCallbackStack(callbackStack)

        // NOTE: call the last callback in the callback stack
        callbackStack[callbackStack.length - 1]()
    }, [])

    const handleKeyupEvent = useCallback(() => {
        if (!keysDownRef.current.size) {
            return
        }

        const { id } = preprocessKeys(Array.from(keysDownRef.current.values()) as ShortcutType['keys'])

        if (shortcutsRef.current[id]) {
            const { callbackStack } = shortcutsRef.current[id]
            verifyCallbackStack(callbackStack)
            callbackStack[callbackStack.length - 1]()
        }

        keysDownRef.current.clear()

        if (keyDownTimeoutRef.current > -1) {
            clearTimeout(keyDownTimeoutRef.current)
            keyDownTimeoutRef.current = -1
        }
    }, [])

    const handleKeydownEvent = useCallback((event: KeyboardEvent) => {
        if (preventDefault) {
            event.preventDefault()
        }

        if (
            ignoredTags.map((tag) => tag.toUpperCase()).indexOf((event.target as HTMLElement).tagName.toUpperCase()) >
                -1 ||
            disableShortcutsRef.current
        ) {
            return
        }

        keysDownRef.current.add(event.key.toUpperCase() as Uppercase<string>)

        if (event.ctrlKey) {
            keysDownRef.current.add('CONTROL')
        }
        if (event.metaKey) {
            keysDownRef.current.add('META')
        }
        if (event.altKey) {
            keysDownRef.current.add('ALT')
        }
        if (event.shiftKey) {
            keysDownRef.current.add('SHIFT')
        }

        if (keyDownTimeoutRef.current === -1) {
            keyDownTimeoutRef.current = setTimeout(() => {
                handleKeyupEvent()
            }, shortcutTimeout ?? DEFAULT_TIMEOUT)
        }
    }, [])

    const handleBlur = useCallback(() => {
        keysDownRef.current.clear()
    }, [])

    useEffect(() => {
        window.addEventListener('keydown', handleKeydownEvent)
        window.addEventListener('keyup', handleKeyupEvent)
        window.addEventListener('blur', handleBlur)

        return () => {
            window.removeEventListener('keydown', handleKeydownEvent)
            window.removeEventListener('keyup', handleKeyupEvent)
            window.removeEventListener('blur', handleBlur)

            if (keyDownTimeoutRef.current > -1) {
                clearTimeout(keyDownTimeoutRef.current)
            }
        }
    }, [handleKeyupEvent, handleKeydownEvent, handleBlur])

    const providerValue: UseRegisterShortcutContextType = useMemo(
        () => ({
            registerShortcut,
            unregisterShortcut,
            setDisableShortcuts,
            triggerShortcut,
        }),
        [registerShortcut, unregisterShortcut, setDisableShortcuts, triggerShortcut],
    )

    return <UseRegisterShortcutContext.Provider value={providerValue}>{children}</UseRegisterShortcutContext.Provider>
}

export default UseRegisterShortcutProvider
