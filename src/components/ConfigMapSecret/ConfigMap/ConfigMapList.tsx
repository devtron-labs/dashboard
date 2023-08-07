import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Progressing, showError } from '@devtron-labs/devtron-fe-common-lib'
import { getAppChartRefForAppAndEnv } from '../../../services/service'
import { URLS } from '../../../config'
import { ConfigMapSecretContainer } from '../ConfigMapSecret.components'
import InfoIconWithTippy from '../InfoIconWithTippy'
import { getConfigMapList } from '../service'
import { ConfigMapListProps, DraftDetailsForCommentDrawerType } from '../Types'
import { ComponentStates, SECTION_HEADING_INFO } from '../../EnvironmentOverride/EnvironmentOverrides.type'
import { importComponentFromFELibrary } from '../../common'
import { ReactComponent as Arrow } from '../../../assets/icons/ic-arrow-left.svg'
import '../ConfigMapSecret.scss'

const getAllDrafts = importComponentFromFELibrary('getAllDrafts', null, 'function')
const DraftComments = importComponentFromFELibrary('DraftComments')

export default function ConfigMapList({
    isJobView,
    isOverrideView,
    isProtected,
    parentName,
    parentState,
    setParentState,
    reloadEnvironments,
}: ConfigMapListProps) {
    const { appId, envId } = useParams<{ appId; envId }>()
    const [configMap, setConfigMap] = useState<{ id: number; configData: any[]; appId: number }>()
    const [configMapLoading, setConfigMapLoading] = useState(true)
    const [appChartRef, setAppChartRef] = useState<{ id: number; version: string; name: string }>()
    const [showComments, setShowComments] = useState(false)
    const [selectedDraft, setSelectedDraft] = useState<DraftDetailsForCommentDrawerType>(null)

    useEffect(() => {
        setConfigMapLoading(true)
        setConfigMap(null)
        init(true)
        reloadEnvironments()
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

    async function init(isInit?: boolean) {
        try {
            const [{ result: appChartRefRes }, { result: configMapRes }, { result: draftData }] = await Promise.all([
                isInit ? getAppChartRefForAppAndEnv(appId, envId) : { result: null },
                getConfigMapList(appId, envId),
                isProtected && getAllDrafts ? getAllDrafts(appId, envId ?? -1, 1) : { result: null },
            ])
            const draftDataMap = {},
                draftDataArr = []
            let configData = []
            if (draftData?.length) {
                for (const data of draftData) {
                    draftDataMap[data.resourceName] = data
                }
            }
            if (Array.isArray(configMapRes.configData)) {
                configData = configMapRes.configData.map((config) => {
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
            setConfigMap({
                appId: configMapRes.appId,
                id: configMapRes.id,
                configData: [...draftDataArr, ...configData] || [],
            })
            if (appChartRefRes) {
                setAppChartRef(appChartRefRes)
            }
            setParentState?.(ComponentStates.loaded)
        } catch (error) {
            setParentState?.(ComponentStates.failed)
            showError(error)
        } finally {
            setConfigMapLoading(false)
        }
    }

    function update() {
        init()
    }

    if (parentState === ComponentStates.loading || !configMap || configMapLoading)
        return <Progressing fullHeight size={48} styles={{ height: 'calc(100% - 80px)' }} />

    return (
        <div className={`cm-secret-main-container ${showComments ? 'with-comment-drawer' : 'form__app-compose'}`}>
            <div className="main-content">
                <h1 className="form__title flex left">
                    {parentName && (
                        <>
                            {parentName}
                            <Arrow className="icon-dim-20 fcn-6 dc__flip mr-4 ml-4" />
                        </>
                    )}
                    {SECTION_HEADING_INFO[URLS.APP_CM_CONFIG].title}
                    <InfoIconWithTippy
                        titleText={SECTION_HEADING_INFO[URLS.APP_CM_CONFIG].title}
                        infoText={SECTION_HEADING_INFO[URLS.APP_CM_CONFIG].subtitle}
                        documentationLink={SECTION_HEADING_INFO[URLS.APP_CM_CONFIG].learnMoreLink}
                    />
                </h1>
                <div className="mt-20">
                    <ConfigMapSecretContainer
                        key="Add ConfigMap"
                        title=""
                        appChartRef={appChartRef}
                        update={update}
                        componentType="configmap"
                        id={configMap?.id ?? 0}
                        isOverrideView={isOverrideView}
                        isJobView={isJobView}
                        isProtected={isProtected}
                        toggleDraftComments={toggleDraftComments}
                        reduceOpacity={!!selectedDraft}
                        reloadEnvironments={reloadEnvironments}
                    />
                    <div>
                        {configMap?.configData.map((cm, idx) => {
                            return (
                                <ConfigMapSecretContainer
                                    key={cm.name}
                                    title={cm.name}
                                    appChartRef={appChartRef}
                                    update={update}
                                    componentType="configmap"
                                    data={cm}
                                    index={idx}
                                    id={configMap?.id}
                                    isOverrideView={isOverrideView}
                                    isJobView={isJobView}
                                    isProtected={isProtected}
                                    toggleDraftComments={toggleDraftComments}
                                    reduceOpacity={selectedDraft && selectedDraft.index !== idx}
                                    parentName={parentName}
                                    reloadEnvironments={reloadEnvironments}
                                />
                            )
                        })}
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
