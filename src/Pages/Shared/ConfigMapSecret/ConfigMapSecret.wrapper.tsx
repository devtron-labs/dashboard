import { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'

import {
    abortPreviousRequests,
    ErrorScreenManager,
    getIsRequestAborted,
    Progressing,
    showError,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'

import { getAppChartRefForAppAndEnv } from '@Services/service'
import { ComponentStates } from '@Pages/Shared/EnvironmentOverride/EnvironmentOverrides.types'

import { CM_SECRET_COMPONENT_NAME } from './constants'
import { CMSecretComponentType, CMSecretWrapperProps } from './types'

import { ConfigMapSecretContainer } from './ConfigMapSecret.container'
import { ConfigMapSecretFormProvider } from './ConfigMapSecretFormContext'

export const ConfigMapSecretWrapper = (props: CMSecretWrapperProps) => {
    // PROPS
    const { componentType = CMSecretComponentType.ConfigMap, parentState, setParentState, onErrorRedirectURL } = props

    // HOOKS
    const { appId, envId, name } = useParams<{ appId: string; envId: string; name: string }>()

    // REFS
    const abortControllerRef = useRef<AbortController>(new AbortController())

    // ASYNC CALLS
    const [initLoading, initResult, initError] = useAsync(
        () => abortPreviousRequests(() => getAppChartRefForAppAndEnv(+appId, +envId), abortControllerRef),
        [componentType],
    )

    useEffect(() => {
        if (initResult) {
            setParentState?.(ComponentStates.loaded)
        }
        if (initError && !getIsRequestAborted(initError)) {
            setParentState?.(ComponentStates.failed)
            showError(initError)
        }

        return () => {
            setParentState?.(ComponentStates.loading)
        }
    }, [initResult, initError])

    if (parentState === ComponentStates.loading || initLoading || !!getIsRequestAborted(initError)) {
        return <Progressing fullHeight size={48} />
    }

    if (initError) {
        return <ErrorScreenManager code={initError.code} redirectURL={onErrorRedirectURL} />
    }

    return (
        <ConfigMapSecretFormProvider>
            <ConfigMapSecretContainer
                key={`${CM_SECRET_COMPONENT_NAME[componentType]}-${name}`}
                appChartRef={initResult[0]?.result}
                {...props}
            />
        </ConfigMapSecretFormProvider>
    )
}
