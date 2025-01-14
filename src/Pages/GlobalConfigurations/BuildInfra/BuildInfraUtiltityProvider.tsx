import { useMemo } from 'react'
import { BuildInfraUtilityContext, BuildInfraUtilityContextType } from '@devtron-labs/devtron-fe-common-lib'
import BuildInfraCMCSForm from './BuildInfraCMCSForm'
import { BuildInfraUtilityProviderProps } from './types'

const BuildInfraUtilityProvider = ({ children }: BuildInfraUtilityProviderProps) => {
    const value: BuildInfraUtilityContextType = useMemo(
        () => ({
            BuildInfraCMCSForm,
        }),
        [],
    )

    return <BuildInfraUtilityContext.Provider value={value}>{children}</BuildInfraUtilityContext.Provider>
}

export default BuildInfraUtilityProvider
