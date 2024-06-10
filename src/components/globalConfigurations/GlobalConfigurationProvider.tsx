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

import React, { createContext, useContext, useState } from 'react'
import { GlobalConfiguration, TippyConfig } from './types'

const globalConfigurationContext = createContext<GlobalConfiguration>({} as GlobalConfiguration)

export const GlobalConfigurationProvider = ({ children }) => {
    const [tippyConfig, setTippyConfig] = useState<TippyConfig>({} as TippyConfig)

    return (
        <globalConfigurationContext.Provider
            value={{
                tippyConfig,
                setTippyConfig,
            }}
        >
            {children}
        </globalConfigurationContext.Provider>
    )
}

export const useGlobalConfiguration = () => useContext(globalConfigurationContext)

// For using the provider in class based components
export const withGlobalConfiguration = (Component) => (props) => {
    const globalConfiguration = useGlobalConfiguration()
    return <Component {...props} globalConfiguration={globalConfiguration} />
}
