import React, { useState, useEffect } from 'react'
import { showError, Progressing } from '@devtron-labs/devtron-fe-common-lib'
import { useParams } from 'react-router'
import { getAppChartRefForAppAndEnv } from '../../../services/service'
import { DOCUMENTATION } from '../../../config'
import '../ConfigMap.scss'
import { decode } from '../../../util/Util'
import { ConfigMapSecretContainer } from '../ConfigMapSecret.components'
import InfoIconWithTippy from '../InfoIconWithTippy'
import { getLabel } from '../ConfigMapSecret.utils'
import { ConfigMapListProps } from '../Types'
import { getSecretList } from '../service'

export default function SecretList({ isOverrideView, parentState, setParentState }: ConfigMapListProps) {
    const [appChartRef, setAppChartRef] = useState<{ id: number; version: string; name: string }>()
    const [list, setList] = useState(null)
    const [secretLoading, setSecretLoading] = useState(true)

    useEffect(() => {
        init()
    }, [])
    const { appId, envId } = useParams<{ appId; envId }>()

    async function init() {
        try {
            const [{ result: appChartRefRes }, { result: secretData }] = await Promise.all([
                getAppChartRefForAppAndEnv(appId, envId),
                getSecretList(appId, envId),
            ])
            //const appChartRefRes = await getAppChartRef(appId)
            //const { result } = await getEnvironmentSecrets(appId, envId)
            if (Array.isArray(secretData.configData)) {
                secretData.configData = secretData.configData.map((config) => {
                    if (config.data) {
                        config.data = decode(config.data) //doesnt do anything because data.value will be empty
                    }
                    return config
                })
            }
            setAppChartRef(appChartRefRes.result)
            setList(secretData)
        } catch (err) {
            showError(err)
        } finally {
            setSecretLoading(false)
        }
    }

    function update(index, result) {
        try {
            setList((list) => {
                let configData = list.configData
                if (result === null) {
                    //delete
                    configData.splice(index, 1)
                    list.configData = [...configData]
                    return { ...list }
                } else if (typeof index !== 'number' && Array.isArray(result.configData)) {
                    //insert after create success
                    configData.unshift({
                        ...result.configData[0],
                        data:
                            result.configData[0].externalType === ''
                                ? decode(result.configData[0].data)
                                : result.configData[0].data,
                    })
                    list.configData = [...configData]
                    return { ...list }
                } else {
                    //unlock
                    configData[index] =
                        result && Array.isArray(result.configData) && result.configData.length > 0
                            ? result.configData[0]
                            : null
                    list.configData[index] = {
                        ...list.configData[index],
                        data:
                            result.configData[0].externalType === ''
                                ? decode(result.configData[0].data)
                                : result.configData[0].data,
                    }
                    return { ...list }
                }
            })
        } catch (err) {}
    }

    if (secretLoading) return <Progressing pageLoader />
    return (
        <div className={!isOverrideView ? 'form__app-compose' : ''}>
            {!isOverrideView && (
                <h1 className="form__title form__title--artifacts flex left">
                    Secrets
                    <InfoIconWithTippy
                        infoText="A Secret is an object that contains sensitive data such as passwords, OAuth tokens, and SSH keys."
                        documentationLink={DOCUMENTATION.APP_CREATE_SECRET}
                    />
                </h1>
            )}
            <div className="mt-20">
                <ConfigMapSecretContainer
                    key="Add Secret"
                    componentType="secret"
                    title=""
                    appChartRef={appChartRef}
                    appId={appId}
                    id={list?.id ?? 0}
                    update={update}
                    isOverrideView={isOverrideView}
                />
                {list?.configData?.map((cs, idx) => (
                    <ConfigMapSecretContainer
                        key={cs.name}
                        componentType="secret"
                        title={cs.name}
                        data={cs}
                        appChartRef={appChartRef}
                        appId={appId}
                        id={list.id}
                        update={update}
                        index={idx}
                        isOverrideView={isOverrideView}
                    />
                ))}
            </div>
        </div>
    )
}
