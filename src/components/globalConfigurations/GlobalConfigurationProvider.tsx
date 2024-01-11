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
