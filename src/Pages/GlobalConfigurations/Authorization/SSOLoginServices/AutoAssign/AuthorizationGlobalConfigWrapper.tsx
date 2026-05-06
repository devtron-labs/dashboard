import { useEffect } from 'react'

import {
    ERROR_EMPTY_SCREEN,
    ErrorScreenNotAuthorized,
    Progressing,
    Reload,
    TOAST_ACCESS_DENIED,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'

import { CONFIG_TYPES } from './constants'
import { getAuthorizationGlobalConfig } from './service'
import { AuthorizationGlobalConfigWrapperProps } from './types'

/**
 * Common component for handling the error and loading state for authorization config.
 */
const AuthorizationGlobalConfigWrapper = ({
    children,
    setIsAutoAssignFlowEnabled,
}: AuthorizationGlobalConfigWrapperProps) => {
    const [isLoading, authConfig, error, reload] = useAsync(getAuthorizationGlobalConfig)

    useEffect(() => {
        if (authConfig) {
            setIsAutoAssignFlowEnabled(authConfig[CONFIG_TYPES.GROUP_CLAIMS])
        }
    }, [authConfig])

    if (isLoading) {
        return <Progressing pageLoader />
    }
    if (error || !authConfig) {
        if (error && (error.code === 403 || error.code === 401)) {
            return (
                <ErrorScreenNotAuthorized
                    subtitle={ERROR_EMPTY_SCREEN.REQUIRED_MANAGER_ACCESS}
                    title={TOAST_ACCESS_DENIED.TITLE}
                />
            )
        }
        return <Reload reload={reload} />
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>
}

export default AuthorizationGlobalConfigWrapper
