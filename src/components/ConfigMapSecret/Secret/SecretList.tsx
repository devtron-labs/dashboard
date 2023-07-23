import React, { useState, useEffect } from 'react'
import { showError, Progressing } from '@devtron-labs/devtron-fe-common-lib'
import { useParams } from 'react-router'
import { getAppChartRefForAppAndEnv } from '../../../services/service'
import { DOCUMENTATION } from '../../../config'
import { ConfigMapSecretContainer } from '../ConfigMapSecret.components'
import InfoIconWithTippy from '../InfoIconWithTippy'
import { ConfigMapListProps } from '../Types'
import { getSecretList } from '../service'
import { importComponentFromFELibrary } from '../../common'
const getAllDrafts = importComponentFromFELibrary('getAllDrafts', null, 'function')

export default function SecretList({
    isJobView,
    isOverrideView,
    isProtected,
    parentState,
    setParentState,
}: ConfigMapListProps) {
    const [appChartRef, setAppChartRef] = useState<{ id: number; version: string; name: string }>()
    const [list, setList] = useState(null)
    const [secretLoading, setSecretLoading] = useState(true)

    useEffect(() => {
        init(true)
    }, [])
    const { appId, envId } = useParams<{ appId; envId }>()

    async function init(isFromInit?: boolean) {
        try {
            const [{ result: appChartRefRes }, { result: secretData }, { result: draftData }] = await Promise.all([
                isFromInit ? getAppChartRefForAppAndEnv(appId, envId) : { result: null },
                getSecretList(appId, envId),
                isProtected && getAllDrafts ? getAllDrafts(appId, envId ?? -1, 2) : { result: null },
            ])
            const draftDataMap = {},
                draftDataArr = []
            let configData = []
            if (draftData?.length) {
                for (const data of draftData) {
                    draftDataMap[data.resourceName] = data
                }
            }
            if (Array.isArray(secretData.configData)) {
                configData = secretData.configData.map((config) => {
                    config.secretMode = config.externalType === ''
                    config.unAuthorized = true
                    if (draftDataMap[config.name]) {
                        config.draftId = draftDataMap[config.name].draftId
                        config.draftState = draftDataMap[config.name].draftState
                    }
                    delete draftDataMap[config.name]
                    return config
                })
            }
            const remainingDrafts = Object.keys(draftDataMap)
            if (remainingDrafts.length > 0) {
                for (const name of remainingDrafts) {
                    draftDataArr.push({ ...draftDataMap[name], name, isNew: true })
                }
            }
            setList({ ...secretData, configData: [...draftDataArr, ...configData] })
            if (appChartRefRes) {
                setAppChartRef(appChartRefRes.result)
            }
        } catch (err) {
            showError(err)
        } finally {
            setSecretLoading(false)
        }
    }

    function update(index, result) {
        if (!index && !result) {
            init()
            return
        }
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
                        data: result.configData[0].data,
                    })
                    list.configData = [...configData]
                    return { ...list }
                } else {
                    const updatedData = result.configData[0].data
                    const selectedConfigData = list.configData[index]
                    if (selectedConfigData.global) {
                        if (selectedConfigData.data) {
                            configData.data = updatedData
                        } else {
                            selectedConfigData.defaultData = updatedData
                        }
                    } else {
                        selectedConfigData.data = updatedData
                    }
                    selectedConfigData.secretMode = false
                    selectedConfigData.unAuthorized = false
                    list.configData[index] = selectedConfigData
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
                        titleText="Secrets"
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
                    id={list?.id ?? 0}
                    update={update}
                    isOverrideView={isOverrideView}
                    isJobView={isJobView}
                    isProtected={isProtected}
                />
                {list?.configData?.map((cs, idx) => (
                    <ConfigMapSecretContainer
                        key={cs.name}
                        componentType="secret"
                        title={cs.name}
                        data={cs}
                        appChartRef={appChartRef}
                        id={list.id}
                        update={update}
                        index={idx}
                        isOverrideView={isOverrideView}
                        isJobView={isJobView}
                        isProtected={isProtected}
                    />
                ))}
            </div>
        </div>
    )
}
