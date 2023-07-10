import React, { useState, useEffect } from 'react'
import { Progressing, showError } from '@devtron-labs/devtron-fe-common-lib'
import { useParams } from 'react-router'
import { getAppChartRef, getConfigMapList } from '../../services/service'
import { DOCUMENTATION } from '../../config'
import './ConfigMap.scss'
import { ConfigMapSecretContainer } from './ConfigMapSecret.components'
import InfoIconWithTippy from './InfoIconWithTippy'

export default function ConfigMapList() {
    const { appId } = useParams<{ appId }>()
    const [configMap, setConfigMap] = useState<{ id: number; configData: any[]; appId: number }>()
    const [configMapLoading, setConfigMapLoading] = useState(true)
    const [appChartRef, setAppChartRef] = useState<{ id: number; version: string; name: string }>()

    useEffect(() => {
        init(true)
    }, [appId])

    async function init(isInit?: boolean) {
        try {
            const [{ result: appChartRefRes }, { result: configMapRes }] = await Promise.all([
                isInit ? getAppChartRef(appId) : { result: null },
                getConfigMapList(appId),
            ])
            setConfigMap({
                appId: configMapRes.appId,
                id: configMapRes.id,
                configData: configMapRes.configData || [],
            })
            if (appChartRefRes) {
                setAppChartRef(appChartRefRes)
            }
        } catch (error) {
            showError(error)
        } finally {
            setConfigMapLoading(false)
        }
    }

    function reload() {
        init()
    }

    if (configMapLoading) {
        return <Progressing pageLoader />
    }

    return (
        <div className="form__app-compose">
            <h1 data-testid="configmaps-heading" className="form__title form__title--artifacts flex left">
                ConfigMaps
                <InfoIconWithTippy
                    infoText="ConfigMap is used to store common configuration variables, allowing users to unify environment variables for different modules in a distributed system into one object."
                    documentationLink={DOCUMENTATION.APP_CREATE_CONFIG_MAP}
                />
            </h1>
            {/* <p className="form__subtitle form__subtitle--artifacts">
                ConfigMap is used to store common configuration variables, allowing users to unify environment variables
                for different modules in a distributed system into one object.&nbsp;
                <a
                    rel="noreferrer noopener"
                    className="dc__link"
                    href={DOCUMENTATION.APP_CREATE_CONFIG_MAP}
                    target="blank"
                >
                    Learn more about ConfigMaps
                </a>
            </p> */}
            <ConfigMapSecretContainer
                key="Add ConfigMap"
                title="Add ConfigMap"
                appChartRef={appChartRef}
                appId={appId}
                update={reload}
                componentType="configmap"
                id={configMap?.id??0}
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
                    />
                )
            })}
        </div>
    )
}
