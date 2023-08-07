import React, { useEffect, useState } from 'react'
import { generatePath, Route, useHistory, useParams, useRouteMatch } from 'react-router-dom'
import { Progressing, showError, sortCallback } from '@devtron-labs/devtron-fe-common-lib'
import { URLS } from '../../../../config'
import { APP_GROUP_CI_DETAILS } from '../../../../config/constantMessaging'
import { EmptyView, LogResizeButton } from '../../../app/details/cicdHistory/History.components'
import Sidebar from '../../../app/details/cicdHistory/Sidebar'
import {
    HistoryComponentType,
    History,
    CICDSidebarFilterOptionType,
    FetchIdDataStatus,
} from '../../../app/details/cicdHistory/types'
import { Details } from '../../../app/details/cIDetails/CIDetails'
import { CiPipeline } from '../../../app/details/triggerView/types'
import { getTriggerHistory } from '../../../app/service'
import { asyncWrap, mapByKey, useAsync, useInterval } from '../../../common'
import { getCIConfigList } from '../../AppGroup.service'
import { AppGroupDetailDefaultType } from '../../AppGroup.types'

export default function EnvCIDetails({ filteredAppIds }: AppGroupDetailDefaultType) {
    const { envId, pipelineId, buildId } = useParams<{
        pipelineId: string
        buildId: string
        envId: string
    }>()
    const [pagination, setPagination] = useState<{ offset: number; size: number }>({ offset: 0, size: 20 })
    const [hasMore, setHasMore] = useState<boolean>(false)
    const [triggerHistory, setTriggerHistory] = useState<Map<number, History>>(new Map())
    const [fullScreenView, setFullScreenView] = useState<boolean>(false)
    const [hasMoreLoading, setHasMoreLoading] = useState<boolean>(false)
    const [pipelineList, setPipelineList] = useState<CiPipeline[]>([])
    const [ciGroupLoading, setCiGroupLoading] = useState(false)
    const [securityModuleInstalled, setSecurityModuleInstalled] = useState(false)
    const [blobStorageConfigured, setBlobStorageConfigured] = useState(false)
    const [appReleaseTags, setAppReleaseTags] = useState<[]>([])
    const [tagsEditable, setTagsEditable] = useState<boolean>(false)
    const [hideImageTaggingHardDelete, setHideImageTaggingHardDelete] = useState<boolean>(false)
    const [fetchBuildIdData, setFetchBuildIdData] = useState<FetchIdDataStatus>(null)

    useEffect(() => {
        try {
            setCiGroupLoading(true)
            getCIConfigList(envId, filteredAppIds).then((result) => {
                if (result?.pipelineList.length) {
                    const _filteredPipelines = []
                    let selectedPipelineExist = false
                    result.pipelineList.forEach((pipeline) => {
                        _filteredPipelines.push(pipeline)
                        selectedPipelineExist = selectedPipelineExist || pipeline.id === +pipelineId
                    })
                    _filteredPipelines.sort((a, b) => sortCallback('appName', a, b))
                    if (!selectedPipelineExist) {
                        replace(generatePath(path, { envId, pipelineId: _filteredPipelines[0].id }))
                    }
                    setPipelineList(_filteredPipelines)
                }
                setSecurityModuleInstalled(result?.securityModuleInstalled)
                setBlobStorageConfigured(result?.blobStorageConfigured)
                setCiGroupLoading(false)
            })
        } catch (error) {
            setPipelineList(null)
            showError(error)
            setHasMoreLoading(false)
            setFetchBuildIdData(null)
        }
        return () => {
            setPipelineList(null)
            setTriggerHistory(new Map())
            setHasMoreLoading(false)
            setFetchBuildIdData(null)
        }
    }, [filteredAppIds])

    const [loading, triggerHistoryResult, , , , dependencyState] = useAsync(
        () => getTriggerHistory(pipelineId, pagination),
        [pipelineId, pagination],
        !!pipelineId,
    )
    const { path } = useRouteMatch()
    const { replace } = useHistory()
    useInterval(pollHistory, 30000)

    useEffect(() => {
        if (!triggerHistoryResult) {
            return
        }
        if (triggerHistoryResult.result.ciWorkflows?.length !== pagination.size) {
            setHasMore(false)
        } else {
            setHasMore(true)
            setHasMoreLoading(true)
        }
        const appReleaseTags = triggerHistoryResult.result?.appReleaseTagNames
        const tagsEditable = triggerHistoryResult.result?.tagsEditable
        setHideImageTaggingHardDelete(triggerHistoryResult.result?.hideImageTaggingHardDelete)
        setTagsEditable(tagsEditable)
        setAppReleaseTags(appReleaseTags)
        const newTriggerHistory = (triggerHistoryResult.result.ciWorkflows || []).reduce((agg, curr) => {
            agg.set(curr.id, curr)
            return agg
        }, triggerHistory)

        if (buildId && !newTriggerHistory.has(+buildId) && fetchBuildIdData !== FetchIdDataStatus.SUSPEND) {
            setFetchBuildIdData(FetchIdDataStatus.FETCHING)
            newTriggerHistory.clear()
        } else {
            setFetchBuildIdData(FetchIdDataStatus.SUSPEND)
        }

        setTriggerHistory(new Map(newTriggerHistory))
    }, [triggerHistoryResult])

    useEffect(() => {
        return () => {
            setTriggerHistory(new Map())
            setHasMoreLoading(false)
            setAppReleaseTags([])
            setTagsEditable(false)
            setFetchBuildIdData(null)
        }
    }, [pipelineId])

    function synchroniseState(triggerId: number, triggerDetails: History, triggerDetailsError: any) {
        if (triggerDetailsError) {
            if (triggerHistoryResult?.result?.ciWorkflows) {
                setTriggerHistory(new Map(mapByKey(triggerHistoryResult.result.ciWorkflows, 'id')))
            }
            setFetchBuildIdData(FetchIdDataStatus.SUSPEND)
            return
        }

        if (triggerId === triggerDetails?.id) {
            setTriggerHistory((triggerHistory) => {
                triggerHistory.set(triggerId, triggerDetails)
                return new Map(triggerHistory)
            })
            if (fetchBuildIdData === FetchIdDataStatus.FETCHING) {
                setFetchBuildIdData(FetchIdDataStatus.SUCCESS)
            }
        }
    }

    async function pollHistory() {
        if (!pipelineId || !fetchBuildIdData || fetchBuildIdData !== FetchIdDataStatus.SUSPEND) return

        const [error, result] = await asyncWrap(
            getTriggerHistory(pipelineId, { offset: 0, size: pagination.offset + pagination.size }),
        )
        if (error) {
            showError(error)
            return
        }
        setAppReleaseTags(result?.result.appReleaseTagNames)
        setTagsEditable(result?.result.tagsEditable)
        setHideImageTaggingHardDelete(result?.result.hideImageTaggingHardDelete)
        setTriggerHistory(mapByKey(result?.result.ciWorkflows || [], 'id'))
    }

    const handleViewAllHistory = () => {
        if (triggerHistoryResult?.result?.ciWorkflows) {
            setTriggerHistory(new Map(mapByKey(triggerHistoryResult.result.ciWorkflows, 'id')))
        }
        setFetchBuildIdData(FetchIdDataStatus.SUSPEND)
        replace(generatePath(path, { envId, pipelineId }))
    }

    if ((!hasMoreLoading && loading) || ciGroupLoading || (pipelineId && dependencyState[0] !== pipelineId)) {
        return <Progressing pageLoader />
    } else if (!buildId && pipelineId && triggerHistory.size > 0) {
        replace(generatePath(path, { buildId: triggerHistory.entries().next().value[0], envId, pipelineId }))
    }
    const pipelineOptions: CICDSidebarFilterOptionType[] = (pipelineList || []).map((item) => {
        return { value: `${item.id}`, label: item.appName, pipelineId: item.id }
    })
    const pipelinesMap = mapByKey(pipelineList, 'id')
    const pipeline = pipelinesMap.get(+pipelineId)

    const renderPipelineDetails = (): JSX.Element | null => {
        if (triggerHistory.size > 0 || fetchBuildIdData) {
            return (
                <Route
                    path={`${path
                        .replace(':pipelineId(\\d+)?', ':pipelineId(\\d+)')
                        .replace(':buildId(\\d+)?', ':buildId(\\d+)')}`}
                >
                    <Details
                        fullScreenView={fullScreenView}
                        synchroniseState={synchroniseState}
                        triggerHistory={triggerHistory}
                        isSecurityModuleInstalled={securityModuleInstalled}
                        isBlobStorageConfigured={blobStorageConfigured}
                        appIdFromParent={pipeline.appId}
                        appReleaseTags={appReleaseTags}
                        tagsEditable={tagsEditable}
                        hideImageTaggingHardDelete={hideImageTaggingHardDelete}
                        fetchIdData={fetchBuildIdData}
                    />
                </Route>
            )
        } else if (pipeline.parentCiPipeline || pipeline.pipelineType === 'LINKED') {
            return (
                <EmptyView
                    title={APP_GROUP_CI_DETAILS.linkedCI.title}
                    subTitle={APP_GROUP_CI_DETAILS.linkedCI.title}
                    link={`${URLS.APP}/${pipeline.parentAppId}/${URLS.APP_CI_DETAILS}/${pipeline.parentCiPipeline}/logs`}
                    linkText={APP_GROUP_CI_DETAILS.linkedCI.linkText}
                />
            )
        } else {
            if (!loading) {
                return (
                    <EmptyView
                        title={APP_GROUP_CI_DETAILS.noBuild.title}
                        subTitle={APP_GROUP_CI_DETAILS.noBuild.subTitle}
                    />
                )
            }
        }
        return null
    }

    return (
        <>
            <div className={`ci-details ${fullScreenView ? 'ci-details--full-screen' : ''}`}>
                {!fullScreenView && (
                    <div className="ci-details__history">
                        <Sidebar
                            filterOptions={pipelineOptions}
                            type={HistoryComponentType.GROUP_CI}
                            hasMore={hasMore}
                            triggerHistory={triggerHistory}
                            setPagination={setPagination}
                            fetchIdData={fetchBuildIdData}
                            handleViewAllHistory={handleViewAllHistory}
                        />
                    </div>
                )}
                <div className="ci-details__body">
                    {!pipelineId ? (
                        <EmptyView
                            title="No application selected"
                            subTitle="Please select an application to see build history."
                        />
                    ) : (
                        pipeline && renderPipelineDetails()
                    )}
                    <LogResizeButton fullScreenView={fullScreenView} setFullScreenView={setFullScreenView} />
                </div>
            </div>
        </>
    )
}
