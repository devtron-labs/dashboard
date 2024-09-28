import { useEffect, useMemo, useRef } from 'react'
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
import { importComponentFromFELibrary } from '@Components/common'
import { ComponentStates } from '@Pages/Shared/EnvironmentOverride/EnvironmentOverrides.types'
import { CMSecretComponentType, CMSecretWrapperProps } from '@Pages/Shared/ConfigMapSecretOld/ConfigMapSecret.types'

import { ConfigMapSecretContainer } from './ConfigMapSecret.container'
import { CM_SECRET_COMPONENT_NAME } from './ConfigMapSecret.constants'

import './ConfigMapSecret.scss'

const getAllDrafts = importComponentFromFELibrary('getAllDrafts', null, 'function')

export const ConfigMapSecretWrapper = (props: CMSecretWrapperProps) => {
    // PROPS
    const {
        componentType = CMSecretComponentType.ConfigMap,
        parentState,
        setParentState,
        isProtected,
        onErrorRedirectURL,
    } = props

    // HOOKS
    const { appId, envId, name } = useParams<{ appId: string; envId: string; name: string }>()

    // REFS
    const abortControllerRef = useRef<AbortController>(new AbortController())

    // ASYNC CALLS
    const [initLoading, initResult, initError] = useAsync(
        () =>
            abortPreviousRequests(
                () =>
                    Promise.all([
                        getAppChartRefForAppAndEnv(+appId, +envId),
                        isProtected && getAllDrafts
                            ? getAllDrafts(appId, envId ?? -1, componentType, abortControllerRef.current.signal)
                            : null,
                    ]),
                abortControllerRef,
            ),
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

    const draftDataMap = useMemo(() => {
        if (initResult?.[1]?.result?.length) {
            const _draftDataMap = initResult[1].result.reduce(
                (acc, curr) => ({ ...acc, [curr.resourceName]: curr }),
                {},
            )

            return _draftDataMap
        }

        return null
    }, [initResult])

    if (parentState === ComponentStates.loading || initLoading || !!getIsRequestAborted(initError)) {
        return <Progressing fullHeight size={48} styles={{ height: 'calc(100% - 80px)' }} />
    }

    if (initError) {
        return <ErrorScreenManager code={initError.code} redirectURL={onErrorRedirectURL} />
    }

    return (
        <ConfigMapSecretContainer
            key={`${CM_SECRET_COMPONENT_NAME[componentType]}-${name}`}
            draftDataMap={draftDataMap}
            appChartRef={initResult[0]?.result}
            {...props}
        />
    )
}
