import React, { useState, useEffect } from 'react'
import { showError, Progressing } from '@devtron-labs/devtron-fe-common-lib'
import { useParams } from 'react-router'
import { getAppChartRefForAppAndEnv } from '../../../services/service'
import { URLS } from '../../../config'
import { ConfigMapSecretContainer } from '../ConfigMapSecret.components'
import InfoIconWithTippy from '../InfoIconWithTippy'
import { ConfigMapListProps, DraftDetailsForCommentDrawerType } from '../Types'
import { getSecretList } from '../service'
import { importComponentFromFELibrary } from '../../common'
import { ReactComponent as Arrow } from '../../../assets/icons/ic-arrow-left.svg'
import { ComponentStates, SECTION_HEADING_INFO } from '../../EnvironmentOverride/EnvironmentOverrides.type'
import '../ConfigMapSecret.scss'

const getAllDrafts = importComponentFromFELibrary('getAllDrafts', null, 'function')
const DraftComments = importComponentFromFELibrary('DraftComments')

export default function SecretList({
    isJobView,
    isOverrideView,
    isProtected,
    parentName,
    parentState,
    setParentState,
}: ConfigMapListProps) {
    const { appId, envId } = useParams<{ appId; envId }>()
    const [appChartRef, setAppChartRef] = useState<{ id: number; version: string; name: string }>()
    const [list, setList] = useState(null)
    const [secretLoading, setSecretLoading] = useState(true)
    const [showComments, setShowComments] = useState(false)
    const [selectedDraft, setSelectedDraft] = useState<DraftDetailsForCommentDrawerType>(null)

    useEffect(() => {
        setSecretLoading(true)
        setList(null)
        init(true)
    }, [appId, envId])

    const toggleDraftComments = (selectedDraft: DraftDetailsForCommentDrawerType) => {
        if (showComments) {
            setSelectedDraft(null)
            setShowComments(false)
        } else if (selectedDraft) {
            setSelectedDraft(selectedDraft)
            setShowComments(true)
        }
    }

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
            setParentState?.(ComponentStates.loaded)
        } catch (err) {
            showError(err)
            setParentState?.(ComponentStates.failed)
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

    if (parentState === ComponentStates.loading || secretLoading)
        return <Progressing fullHeight size={48} styles={{ height: 'calc(100% - 80px)' }} />
    return (
        <div className={`cm-secret-main-container ${showComments ? 'with-comment-drawer' : 'form__app-compose'}`}>
            <div className="main-content">
                <h1 className="form__title flex left">
                    {parentName && (
                        <>
                            {parentName}
                            <Arrow className="icon-dim-20 fcn-6 rotateBy-180 mr-4 ml-4" />
                        </>
                    )}
                    {SECTION_HEADING_INFO[URLS.APP_CS_CONFIG].title}
                    <InfoIconWithTippy
                        titleText={SECTION_HEADING_INFO[URLS.APP_CS_CONFIG].title}
                        infoText={SECTION_HEADING_INFO[URLS.APP_CS_CONFIG].subtitle}
                        documentationLink={SECTION_HEADING_INFO[URLS.APP_CS_CONFIG].learnMoreLink}
                    />
                </h1>
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
                        toggleDraftComments={toggleDraftComments}
                    />
                    <div>
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
                                toggleDraftComments={toggleDraftComments}
                                reduceOpacity={selectedDraft && selectedDraft.index !== idx}
                                parentName={parentName}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {DraftComments && showComments && selectedDraft && (
                <DraftComments
                    draftId={selectedDraft.draftId}
                    draftVersionId={selectedDraft.draftVersionId}
                    toggleDraftComments={toggleDraftComments}
                />
            )}
        </div>
    )
}
