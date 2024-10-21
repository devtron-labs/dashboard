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

import React, { createContext, useState } from 'react'
import { BreadcrumbTextProps } from './Types'

const initialState = {
    alias: {},
}

export const BreadcrumbText = ({ heading, isActive }: BreadcrumbTextProps) => (
    <h2 className={`m-0 fs-16 fw-6 lh-32 ${isActive ? 'cn-9' : 'cb-5'}`}>{heading}</h2>
)

const Store = ({ children }) => {
    const [state, setState] = useState(initialState)
    return <BreadcrumbContext.Provider value={{ state, setState }}>{children}</BreadcrumbContext.Provider>
}

export const BreadcrumbContext = createContext({
    state: { alias: {} },
    setState: null,
})

export function useBreadcrumbContext() {
    const context = React.useContext(BreadcrumbContext)
    if (!context) {
        throw new Error(`breadcrumb components cannot be used outside Breadcrumb context`)
    }
    return context
}

export default Store
