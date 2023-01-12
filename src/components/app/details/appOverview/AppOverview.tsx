import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { Link, useParams } from 'react-router-dom'
import { Moment12HourFormat, URLS } from '../../../../config'
import { getAppOtherEnvironment, getTeamList } from '../../../../services/service'
import { handleUTCTime, Progressing, showError, sortOptionsByValue, useAsync } from '../../../common'
import { AppDetails, AppOverviewProps, LabelTagsType } from '../../types'
import { ReactComponent as EditIcon } from '../../../../assets/icons/ic-pencil.svg'
import { ReactComponent as TagIcon } from '../../../../assets/icons/ic-tag.svg'
import { ReactComponent as LinkedIcon } from '../../../../assets/icons/ic-linked.svg'
import { ReactComponent as RocketIcon } from '../../../../assets/icons/ic-nav-rocket.svg'
import AboutAppInfoModal from '../AboutAppInfoModal'
import {
    ExternalLinkIdentifierType,
    ExternalLinksAndToolsType,
    ExternalLinkScopeType,
} from '../../../externalLinks/ExternalLinks.type'
import { getExternalLinks, getMonitoringTools } from '../../../externalLinks/ExternalLinks.service'
import { sortByUpdatedOn } from '../../../externalLinks/ExternalLinks.utils'
import { AppLevelExternalLinks } from '../../../externalLinks/ExternalLinks.component'
import './AppOverview.scss'
import AppStatus from '../../AppStatus'

export default function AppOverview({ appMetaInfo, getAppMetaInfoRes }: AppOverviewProps) {
    const { appId } = useParams<{ appId: string }>()
    const [isLoading, setIsLoading] = useState(true)
    const [currentLabelTags, setCurrentLabelTags] = useState<LabelTagsType>({
        tags: [],
        inputTagValue: '',
        tagError: '',
    })
    const [fetchingProjects, projectsListRes] = useAsync(() => getTeamList(), [appId])
    const [isChangeProjectView, setChangeProjectView] = useState(false)
    const [showUpdateAppModal, setShowUpdateAppModal] = useState(false)
    const [externalLinksAndTools, setExternalLinksAndTools] = useState<ExternalLinksAndToolsType>({
        fetchingExternalLinks: true,
        externalLinks: [],
        monitoringTools: [],
    })
    const [otherEnvsLoading, otherEnvsResult] = useAsync(() => getAppOtherEnvironment(appId), [appId])

    useEffect(() => {
        if (appMetaInfo?.appName) {
            const labelOptionRes = appMetaInfo.labels?.map((_label) => {
                return {
                    label: `${_label.key.toString()}:${_label.value.toString()}`,
                    value: `${_label.key.toString()}:${_label.value.toString()}`,
                }
            })
            setCurrentLabelTags({ tags: labelOptionRes || [], inputTagValue: '', tagError: '' })
            setIsLoading(false)
        }
    }, [appMetaInfo])

    useEffect(() => {
        getExternalLinksDetails()
    }, [appId])

    const getExternalLinksDetails = (): void => {
        Promise.all([getMonitoringTools(), getExternalLinks(0, appId, ExternalLinkIdentifierType.DevtronApp)])
            .then(([monitoringToolsRes, externalLinksRes]) => {
                setExternalLinksAndTools({
                    fetchingExternalLinks: false,
                    externalLinks:
                        externalLinksRes.result
                            ?.filter((_link) => _link.type === ExternalLinkScopeType.AppLevel)
                            ?.sort(sortByUpdatedOn) || [],
                    monitoringTools:
                        monitoringToolsRes.result
                            ?.map((tool) => ({
                                label: tool.name,
                                value: tool.id,
                                icon: tool.icon,
                            }))
                            .sort(sortOptionsByValue) || [],
                })
            })
            .catch((e) => {
                showError(e)
                setExternalLinksAndTools({
                    fetchingExternalLinks: false,
                    externalLinks: [],
                    monitoringTools: [],
                })
            })
    }

    const toggleChangeProjectModal = () => {
        setChangeProjectView(!isChangeProjectView)
        setShowUpdateAppModal(!showUpdateAppModal)
    }

    const toggleTagsUpdateModal = () => {
        if (isChangeProjectView) {
            setChangeProjectView(false)
        }
        setShowUpdateAppModal(!showUpdateAppModal)
    }

    const renderInfoModal = () => {
        return (
            <AboutAppInfoModal
                isLoading={isLoading}
                appId={appId}
                isChangeProjectView={isChangeProjectView}
                appMetaInfo={appMetaInfo}
                onClose={isChangeProjectView ? toggleChangeProjectModal : toggleTagsUpdateModal}
                currentLabelTags={currentLabelTags}
                getAppMetaInfoRes={getAppMetaInfoRes}
                fetchingProjects={fetchingProjects}
                projectsList={projectsListRes?.result}
            />
        )
    }

    const renderSideInfoColumn = () => {
        return (
            <div className="pt-16 pb-16 pl-20 pr-20 dc__border-right">
                <div className="mb-16">
                    <div className="fs-12 fw-4 lh-20 cn-7">App name</div>
                    <div className="fs-13 fw-4 lh-20 cn-9">{appMetaInfo?.appName}</div>
                </div>
                <div className="mb-16">
                    <div className="fs-12 fw-4 lh-20 cn-7">Created on</div>
                    <div className="fs-13 fw-4 lh-20 cn-9">
                        {appMetaInfo?.createdOn ? moment(appMetaInfo.createdOn).format(Moment12HourFormat) : '-'}
                    </div>
                </div>
                <div className="mb-16">
                    <div className="fs-12 fw-4 lh-20 cn-7">Created by</div>
                    <div className="fs-13 fw-4 lh-20 cn-9">{appMetaInfo?.createdBy}</div>
                </div>
                <div className="mb-16">
                    <div className="fs-12 fw-4 lh-20 cn-7">Project</div>
                    <div className="flex left dc__content-space fs-13 fw-4 lh-20 cn-9">
                        {appMetaInfo?.projectName}
                        <EditIcon className="icon-dim-20 cursor" onClick={toggleChangeProjectModal} />
                    </div>
                </div>
            </div>
        )
    }

    const renderLabelTags = () => {
        return (
            <div className="flex column left pt-16 pb-16 pl-20 pr-20 dc__border-bottom-n1">
                <div className="flex left dc__content-space mb-12 w-100">
                    <div className="flex left fs-14 fw-6 lh-20 cn-9">
                        <TagIcon className="tags-icon icon-dim-20 mr-8" />
                        Tags
                    </div>
                    <div className="flex fs-12 fw-4 lh-16 cn-7 cursor" onClick={toggleTagsUpdateModal}>
                        <EditIcon className="icon-dim-16 scn-7 mr-4" />
                        Edit tags
                    </div>
                </div>
                <div className="flex left flex-wrap dc__gap-8">
                    {currentLabelTags.tags.length > 0 ? (
                        currentLabelTags.tags.map((tag) => (
                            <span className="fs-12 fw-4 lh-16 cn-9 pt-4 pb-4 pl-6 pr-6 bc-n50 dc__border br-4">
                                {tag.label}
                            </span>
                        ))
                    ) : (
                        <span className="fs-13 fw-4 cn-7">No tags added.</span>
                    )}
                </div>
            </div>
        )
    }

    // Update once new API changes are introduced
    const renderAppLevelExternalLinks = () => {
        return (
            <div className="flex column left pt-16 pb-16 pl-20 pr-20 dc__border-bottom-n1">
                <div className="flex left fs-14 fw-6 lh-20 cn-9 mb-12">
                    <LinkedIcon className="icon-dim-20 mr-8" />
                    External Links
                </div>
                {externalLinksAndTools.fetchingExternalLinks ? (
                    <div className="dc__loading-dots" />
                ) : (
                    <AppLevelExternalLinks
                        isOverviewPage={true}
                        appDetails={
                            {
                                appId: +appId,
                                appName: appMetaInfo?.appName,
                            } as AppDetails
                        }
                        externalLinks={externalLinksAndTools.externalLinks}
                        monitoringTools={externalLinksAndTools.monitoringTools}
                    />
                )}
            </div>
        )
    }

    const renderEnvironmentDeploymentsStatus = () => {
        return (
            <div className="flex column left pt-16 pb-16 pl-20 pr-20">
                <div className="flex left fs-14 fw-6 lh-20 cn-9 mb-12">
                    <RocketIcon className="icon-dim-20 scn-9 mr-8" />
                    Deployments
                </div>
                {otherEnvsLoading ? (
                    <div className="dc__loading-dots" />
                ) : otherEnvsResult.result?.length > 0 ? (
                    <div className="env-deployments-info-wrapper w-100">
                        <div className="env-deployments-info-header display-grid dc__align-items-center dc__border-bottom-n1 dc__uppercase fs-12 fw-6 cn-7">
                            <span>Environment</span>
                            <span>App status</span>
                            <span>Last deployed</span>
                        </div>
                        <div className="env-deployments-info-body">
                            {otherEnvsResult.result.map((_env) => (
                                <div
                                    key={`${_env.environmentName}-${_env.environmentId}`}
                                    className="env-deployments-info-row display-grid dc__align-items-center"
                                >
                                    <Link to={`${URLS.APP}/${appId}/details/${_env.environmentId}/`} className="fs-13">
                                        {_env.environmentName}
                                    </Link>
                                    <AppStatus appStatus={_env.appStatus} />
                                    <span className="fs-13 fw-4 cn-7">
                                        {_env.lastDeployed ? handleUTCTime(_env.lastDeployed, true) : 'Not deployed'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="fs-13 fw-4 cn-7">This application has not been deployed yet.</div>
                )}
            </div>
        )
    }

    if (!appMetaInfo || fetchingProjects) {
        return <Progressing pageLoader />
    }

    return (
        <div className="app-overview-container display-grid bcn-0 dc__overflow-hidden">
            {renderSideInfoColumn()}
            <div className="app-overview-wrapper dc__overflow-scroll">
                {renderLabelTags()}
                {renderAppLevelExternalLinks()}
                {renderEnvironmentDeploymentsStatus()}
            </div>
            {showUpdateAppModal && renderInfoModal()}
        </div>
    )
}
