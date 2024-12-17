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

import { ConfigMapSecretContainer } from './ConfigMapSecretContainer'

export const ConfigMapSecretWrapper = (props: CMSecretWrapperProps) => {
    // PROPS
    const { componentType = CMSecretComponentType.ConfigMap, parentState, setParentState, onErrorRedirectURL } = props

    // HOOKS
    const { appId, envId, name } = useParams<{ appId: string; envId: string; name: string }>()

    // REFS
    const abortControllerRef = useRef<AbortController>(new AbortController())

    // ASYNC CALLS
    const [appChartRefLoading, appChartRefRes, appChartRefErr, reload] = useAsync(
        () => abortPreviousRequests(() => getAppChartRefForAppAndEnv(+appId, +envId), abortControllerRef),
        [componentType],
    )

    useEffect(() => {
        if (appChartRefRes) {
            setParentState?.(ComponentStates.loaded)
        }
        if (appChartRefErr && !getIsRequestAborted(appChartRefErr)) {
            setParentState?.(ComponentStates.failed)
            showError(appChartRefErr)
        }

        return () => {
            setParentState?.(ComponentStates.loading)
        }
    }, [appChartRefRes, appChartRefErr])

    if (parentState === ComponentStates.loading || appChartRefLoading || getIsRequestAborted(appChartRefErr)) {
        return <Progressing fullHeight pageLoader />
    }

    if (appChartRefErr) {
        return <ErrorScreenManager code={appChartRefErr.code} redirectURL={onErrorRedirectURL} reload={reload} />
    }

    return (
        <ConfigMapSecretContainer
            key={`${CM_SECRET_COMPONENT_NAME[componentType]}-${name}`}
            appChartRef={appChartRefRes?.result}
            {...props}
        />
    )
}
