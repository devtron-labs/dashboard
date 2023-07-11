import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Progressing, showError } from '@devtron-labs/devtron-fe-common-lib'
import { getAppChartRefForAppAndEnv } from '../../../services/service'
import { DOCUMENTATION } from '../../../config'
import { ConfigMapSecretContainer } from '../ConfigMapSecret.components'
import InfoIconWithTippy from '../InfoIconWithTippy'
import { getConfigMapList } from '../service'
import './ConfigMap.scss'
import { ConfigMapListProps } from '../Types'
import { ComponentStates } from '../../EnvironmentOverride/EnvironmentOverrides.type'
import { getLabel } from '../ConfigMapSecret.utils'

export default function ConfigMapList({ isOverrideView, parentState, setParentState }: ConfigMapListProps) {
    const { appId, envId } = useParams<{ appId; envId }>()
    const [configMap, setConfigMap] = useState<{ id: number; configData: any[]; appId: number }>()
    const [configMapLoading, setConfigMapLoading] = useState(true)
    const [appChartRef, setAppChartRef] = useState<{ id: number; version: string; name: string }>()

    useEffect(() => {
        init(true)
    }, [appId])

    async function init(isInit?: boolean) {
        try {
            const [{ result: appChartRefRes }, { result: configMapRes }] = await Promise.all([
                isInit ? getAppChartRefForAppAndEnv(appId, envId) : { result: null },
                getConfigMapList(appId, envId),
            ])
            setConfigMap({
                appId: configMapRes.appId,
                id: configMapRes.id,
                configData: configMapRes.configData || [],
            })
            if (appChartRefRes) {
                setAppChartRef(appChartRefRes)
            }
            setParentState && setParentState(ComponentStates.loaded)
        } catch (error) {
            setParentState && setParentState(ComponentStates.failed)
            showError(error)
        } finally {
            setConfigMapLoading(false)
        }
    }

    function reload() {
        init()
    }
    if (parentState === ComponentStates.loading || !configMap || configMapLoading)
        return <Progressing fullHeight size={48} styles={{ height: 'calc(100% - 80px)' }} />
    // if (configMapLoading) {
    //     return <Progressing pageLoader />
    // }

    return (
        <div className={!isOverrideView ? 'form__app-compose' : ''}>
            {!isOverrideView && (
                <h1 data-testid="configmaps-heading" className="form__title form__title--artifacts flex left">
                    ConfigMaps
                    <InfoIconWithTippy
                        infoText="ConfigMap is used to store common configuration variables, allowing users to unify environment variables for different modules in a distributed system into one object."
                        documentationLink={DOCUMENTATION.APP_CREATE_CONFIG_MAP}
                    />
                </h1>
            )}
            <ConfigMapSecretContainer
                key="Add ConfigMap"
                title=""
                appChartRef={appChartRef}
                appId={appId}
                update={reload}
                componentType="configmap"
                id={configMap?.id ?? 0}
                label={isOverrideView ? 'env' : ''}
            />
            {configMap?.configData.map((cm, idx) => {
                return (
                    <ConfigMapSecretContainer
                        key={cm.name}
                        title={cm.name}
                        appChartRef={appChartRef}
                        appId={appId}
                        update={reload}
                        componentType="configmap"
                        data={cm}
                        index={idx}
                        id={configMap?.id}
                        label={getLabel(isOverrideView,cm.defaultData, cm.data)}
                    />
                )
            })}
        </div>
    )
}
