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

import { createContext, useContext, useMemo } from 'react'
import { ImageSelectionUtilityContextType, ImageSelectionUtilityProviderProps } from './types'

export const ImageSelectionUtilityContext = createContext<ImageSelectionUtilityContextType>(null)
export const useImageSelectionUtilityContext = () => {
    const context = useContext<ImageSelectionUtilityContextType>(ImageSelectionUtilityContext)
    if (!context) {
        throw new Error('useImageSelectionUtilityContext must be used within ImageSelectionUtilityProvider')
    }

    return context
}

export const ImageSelectionUtilityProvider = ({ children, value }: ImageSelectionUtilityProviderProps) => {
    const memoizedValue = useMemo(() => value, [value])

    return (
        <ImageSelectionUtilityContext.Provider value={memoizedValue}>{children}</ImageSelectionUtilityContext.Provider>
    )
}
