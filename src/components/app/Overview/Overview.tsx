import React, { useEffect, useMemo, useState } from 'react'
import moment from 'moment'
import { Link, useParams } from 'react-router-dom'
import { ModuleNameMap, Moment12HourFormat, URLS } from '../../../config'
import { getAppOtherEnvironment, getJobCIPipeline, getTeamList } from '../../../services/service'
import {
    showError,
    Progressing,
    TagType,
    stopPropagation,
    useAsync,
    getRandomColor,
} from '@devtron-labs/devtron-fe-common-lib'
import { handleUTCTime, importComponentFromFELibrary, processDeployedTime, sortOptionsByValue } from '../../common'
import { AppDetails, AppOverviewProps, JobPipeline } from '../types'
import { ReactComponent as EditIcon } from '../../../assets/icons/ic-pencil.svg'
import { ReactComponent as AppIcon } from '../../../assets/icons/ic-devtron-app.svg'
import { ReactComponent as WorkflowIcon } from '../../../assets/icons/ic-workflow.svg'
import { ReactComponent as JobIcon } from '../../../assets/icons/ic-job-node.svg'
import { ReactComponent as TagIcon } from '../../../assets/icons/ic-tag.svg'
import { ReactComponent as LinkedIcon } from '../../../assets/icons/ic-linked.svg'
import { ReactComponent as RocketIcon } from '../../../assets/icons/ic-nav-rocket.svg'
import { ReactComponent as SucceededIcon } from '../../../assets/icons/ic-success.svg'
import { ReactComponent as InProgressIcon } from '../../../assets/icons/ic-progressing.svg'
import { ReactComponent as FailedIcon } from '../../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as CrossIcon } from '../../../assets/icons/ic-close.svg'
import { ReactComponent as VirtualEnvIcon } from '../../../assets/icons/ic-environment-temp.svg'
import { ReactComponent as Database } from '../../../assets/icons/ic-env.svg'
import AboutAppInfoModal from '../details/AboutAppInfoModal'
import {
    ExternalLinkIdentifierType,
    ExternalLinksAndToolsType,
    ExternalLinkScopeType,
} from '../../externalLinks/ExternalLinks.type'
import { getExternalLinks } from '../../externalLinks/ExternalLinks.service'
import { sortByUpdatedOn } from '../../externalLinks/ExternalLinks.utils'
import { AppLevelExternalLinks } from '../../externalLinks/ExternalLinks.component'
import AboutTagEditModal from '../details/AboutTagEditModal'
import AppStatus from '../AppStatus'
import { StatusConstants, DefaultJobNote, DefaultAppNote } from '../list-new/Constants'
import { getModuleInfo } from '../../v2/devtronStackManager/DevtronStackManager.service'
import { ModuleStatus } from '../../v2/devtronStackManager/DevtronStackManager.type'
import TagChipsContainer from './TagChipsContainer'
import './Overview.scss'
import { environmentName } from '../../Jobs/Utils'
import { DEFAULT_ENV } from '../details/triggerView/Constants'
import GenericDescription from '../../common/Description/GenericDescription'
const MandatoryTagWarning = importComponentFromFELibrary('MandatoryTagWarning')

export default function AppOverview({
    appMetaInfo,
    getAppMetaInfoRes,
    isJobOverview,
    filteredEnvIds,
}: AppOverviewProps) {
    const { appId } = useParams<{ appId: string }>()
    const [isLoading, setIsLoading] = useState(true)
    const [currentLabelTags, setCurrentLabelTags] = useState<TagType[]>([])
    const [fetchingProjects, projectsListRes] = useAsync(() => getTeamList(), [appId])
    const [showUpdateAppModal, setShowUpdateAppModal] = useState(false)
    const [showUpdateTagModal, setShowUpdateTagModal] = useState(false)
    const [descriptionId, setDescriptionId] = useState<number>(0)
    const [newDescription, setNewDescription] = useState<string>(isJobOverview ? DefaultJobNote : DefaultAppNote)
    const [newUpdatedOn, setNewUpdatedOn] = useState<string>()
    const [newUpdatedBy, setNewUpdatedBy] = useState<string>()
    const [externalLinksAndTools, setExternalLinksAndTools] = useState<ExternalLinksAndToolsType>({
        fetchingExternalLinks: true,
        externalLinks: [],
        monitoringTools: [],
    })
    const [otherEnvsLoading, otherEnvsResult] = useAsync(
        () => Promise.all([getAppOtherEnvironment(appId), getModuleInfo(ModuleNameMap.ARGO_CD)]),
        [appId],
        !isJobOverview,
    )
    const isArgoInstalled: boolean = otherEnvsResult?.[1]?.result?.status === ModuleStatus.INSTALLED
    const [jobPipelines, setJobPipelines] = useState<JobPipeline[]>([])
    const [reloadMandatoryProjects, setReloadMandatoryProjects] = useState<boolean>(true)
    const resourceName = isJobOverview ? 'job' : 'application'

    let _moment: moment.Moment
    let _date: string

    useEffect(() => {
        if (appMetaInfo?.appName) {
            setCurrentLabelTags(appMetaInfo.labels)
            _moment = moment(appMetaInfo?.description?.updatedOn, 'YYYY-MM-DDTHH:mm:ssZ')
            _date = _moment.isValid() ? _moment.format(Moment12HourFormat) : appMetaInfo?.description?.updatedOn
            const description =
                appMetaInfo?.description?.description !== '' && appMetaInfo?.description?.id
                    ? appMetaInfo.description.description
                    : isJobOverview
                    ? DefaultJobNote
                    : DefaultAppNote
            _date = appMetaInfo?.description?.description !== '' && appMetaInfo?.description?.id ? _date : ''
            setNewUpdatedOn(_date)
            setNewUpdatedBy(appMetaInfo?.description?.updatedBy)
            setNewDescription(description)
            setDescriptionId(appMetaInfo?.description?.id)
            setIsLoading(false)
        }
    }, [appMetaInfo])

    useEffect(() => {
        if (isJobOverview) {
            getCIPipelinesForJob()
        } else {
            getExternalLinksDetails()
        }
    }, [appId])

    const envList = useMemo(() => {
        if (otherEnvsResult?.[0]?.result?.length > 0) {
            const filteredEnvMap = filteredEnvIds?.split(',').reduce((agg, curr) => agg.set(+curr, true), new Map())
            return (
                otherEnvsResult[0].result
                    .filter((env) => !filteredEnvMap || filteredEnvMap.get(env.environmentId))
                    ?.sort((a, b) => (a.environmentName > b.environmentName ? 1 : -1)) || []
            )
        }
        return []
    }, [filteredEnvIds, otherEnvsResult])

    const getExternalLinksDetails = (): void => {
        getExternalLinks(0, appId, ExternalLinkIdentifierType.DevtronApp)
            .then((externalLinksRes) => {
                setExternalLinksAndTools({
                    fetchingExternalLinks: false,
                    externalLinks:
                        externalLinksRes.result?.ExternalLinks?.filter(
                            (_link) => _link.type === ExternalLinkScopeType.AppLevel,
                        ).sort(sortByUpdatedOn) || [],
                    monitoringTools:
                        externalLinksRes.result?.Tools?.map((tool) => ({
                            label: tool.name,
                            value: tool.id,
                            icon: tool.icon,
                        })).sort(sortOptionsByValue) || [],
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

    const getCIPipelinesForJob = (): void => {
        getJobCIPipeline(appId)
            .then((response) => {
                setJobPipelines(response.result)
            })
            .catch((error) => {
                showError(error)
            })
    }

    const toggleChangeProjectModal = (e) => {
        stopPropagation(e)
        setShowUpdateAppModal(!showUpdateAppModal)
    }

    const toggleTagsUpdateModal = (e) => {
        stopPropagation(e)
        setShowUpdateTagModal(!showUpdateTagModal)
        if (showUpdateTagModal) {
            setReloadMandatoryProjects(!reloadMandatoryProjects)
        }
    }

    const renderInfoModal = () => {
        return (
            <AboutAppInfoModal
                isLoading={isLoading}
                appId={appId}
                appMetaInfo={appMetaInfo}
                onClose={toggleChangeProjectModal}
                getAppMetaInfoRes={getAppMetaInfoRes}
                fetchingProjects={fetchingProjects}
                projectsList={projectsListRes?.result}
                description={appMetaInfo.description.description}
                isJobOverview={isJobOverview}
            />
        )
    }

    const renderEditTagsModal = () => {
        return (
            <AboutTagEditModal
                isLoading={isLoading}
                appId={appId}
                appMetaInfo={appMetaInfo}
                onClose={toggleTagsUpdateModal}
                getAppMetaInfoRes={getAppMetaInfoRes}
                currentLabelTags={currentLabelTags}
                description={appMetaInfo.description.description}
            />
        )
    }

    const renderSideInfoColumn = () => {
        const {
            appName,
            shortDescription = `Write a short description for this ${resourceName}`,
            // TODO: Update the placeholder text when integrating
            codeSource = 'devtron-labs/devtron',
            createdOn,
            createdBy,
            projectName,
        } = appMetaInfo

        return (
            <aside className="pt-20 pb-20 pl-20 pr-16 dc__border-right flexbox-col dc__gap-16">
                <div className="flexbox-col dc__gap-12">
                    <div>
                        {isJobOverview ? (
                            <JobIcon className="icon-dim-48 dc__icon-bg-color br-4 p-8" />
                        ) : (
                            <AppIcon className="icon-dim-48" />
                        )}
                    </div>
                    <div className="fs-16 fw-7 lh-24 cn-9 dc__word-break">{appName}</div>
                    {/* TODO: Uncomment and integrate */}
                    {/* <div className="flexbox flex-justify dc__gap-10">
                        <div className="fs-13 fw-4 lh-20 cn-9">{shortDescription}</div>
                        <EditIcon
                            className="icon-dim-16 cursor mw-16"
                            // TODO: Add onClick listener
                            onClick={() => alert('Please integrate me 🥹!')}
                        />
                    </div> */}
                </div>
                <div className="dc__border-top-n1" />
                <div className="flexbox-col dc__gap-12">
                    <div>
                        <div className="fs-13 fw-4 lh-20 cn-7 mb-4">Project</div>
                        <div className="flexbox flex-justify flex-align-center dc__gap-10 fs-13 fw-6 lh-20 cn-9">
                            {projectName}
                            <EditIcon className="icon-dim-16 cursor mw-16" onClick={toggleChangeProjectModal} />
                        </div>
                    </div>
                    <div>
                        <div className="fs-13 fw-4 lh-20 cn-7 mb-4">Created on</div>
                        <div className="fs-13 fw-6 lh-20 cn-9 dc__word-break">
                            {createdOn ? moment(createdOn).format(Moment12HourFormat) : '-'}
                        </div>
                    </div>
                    <div>
                        <div className="fs-13 fw-4 lh-20 cn-7 mb-4">Created by</div>
                        <div className="fs-13 fw-6 lh-20 cn-9 dc__word-break flexbox flex-align-center dc__gap-8">
                            <div
                                className="icon-dim-20 mw-20 flexbox flex-justify-center flex-align-center dc__border-radius-50-per dc__uppercase"
                                style={{ backgroundColor: getRandomColor(createdBy) }}
                            >
                                {createdBy[0]}
                            </div>
                            {createdBy}
                        </div>
                    </div>
                    {/* TODO: Uncomment, update and integrate. Also add the icon for the code source */}
                    {/* {!isJobOverview && (
                        <div>
                            <div className="fs-13 fw-4 lh-20 cn-7 mb-4">Code source</div>
                            <div className="fs-13 fw-6 lh-20 cn-9 dc__word-break">{codeSource}</div>
                        </div>
                    )} */}
                </div>
                <div className="dc__border-top-n1" />
                {renderLabelTags()}
            </aside>
        )
    }

    const renderLabelTags = () => (
        <div className="flexbox-col dc__gap-12">
            <div className="flexbox flex-justify dc__gap-10">
                <div className="flexbox flex-align-center dc__gap-8 fs-13 fw-6 lh-20 cn-9">
                    <TagIcon className="tags-icon icon-dim-20" />
                    Tags
                </div>
                <EditIcon className="icon-dim-16 cursor mw-16" onClick={toggleTagsUpdateModal} />
            </div>
            <TagChipsContainer
                labelTags={currentLabelTags}
                onAddTagButtonClick={toggleTagsUpdateModal}
                resourceName={resourceName}
            />
            {MandatoryTagWarning && (
                <MandatoryTagWarning
                    labelTags={currentLabelTags}
                    handleAddTag={toggleTagsUpdateModal}
                    selectedProjectId={appMetaInfo.projectId}
                    reloadProjectTags={reloadMandatoryProjects}
                />
            )}
        </div>
    )

    // Update once new API changes are introduced
    const renderAppLevelExternalLinks = () => {
        return (
            <div className="flex column left p-16 dc__border-bottom-n1">
                <div className="flex left fs-14 fw-6 lh-20 cn-9 mb-12" data-testid="overview-external-links">
                    <LinkedIcon className="icon-dim-20 mr-8" />
                    External Links
                </div>
                {externalLinksAndTools.fetchingExternalLinks ? (
                    <div className="dc__loading-dots" data-testid="overview-external-links-not-present" />
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

    const envIcon = (isVirtualCluster) => {
        if (isVirtualCluster) {
            return <VirtualEnvIcon className="fcb-5 icon-dim-20" />
        } else {
            return <Database className="icon-dim-20" />
        }
    }

    const renderDeploymentComponent = () => {
        if (envList.length > 0) {
            return (
                <div className="env-deployments-info-wrapper w-100">
                    <div
                        className="env-deployments-info-header display-grid dc__align-items-center dc__border-bottom-n1 dc__uppercase fs-12 fw-6 cn-7"
                        data-testid="overview-deployed-environment"
                    >
                        <span />
                        <span>Environment</span>
                        {isArgoInstalled && <span>App status</span>}
                        <span>Last deployed</span>
                    </div>

                    <div className="env-deployments-info-body">
                        {envList.map(
                            (_env, index) =>
                                !_env.deploymentAppDeleteRequest && (
                                    <div
                                        key={`${_env.environmentName}-${_env.environmentId}`}
                                        className="env-deployments-info-row display-grid dc__align-items-center"
                                    >
                                        {envIcon(_env.isVirtualEnvironment)}
                                        <Link
                                            to={`${URLS.APP}/${appId}/details/${_env.environmentId}/`}
                                            className="fs-13"
                                            data-testid={`overview-link-environment${index}`}
                                        >
                                            {_env.environmentName}
                                        </Link>
                                        {isArgoInstalled && (
                                            <AppStatus
                                                appStatus={
                                                    _env.lastDeployed
                                                        ? _env.appStatus
                                                        : StatusConstants.NOT_DEPLOYED.noSpaceLower
                                                }
                                                isVirtualEnv={_env.isVirtualEnvironment}
                                            />
                                        )}
                                        <span className="fs-13 fw-4 cn-7" data-testid="overview-deployed-time">
                                            {processDeployedTime(_env.lastDeployed, isArgoInstalled)}
                                        </span>
                                    </div>
                                ),
                        )}
                    </div>
                </div>
            )
        }

        return (
            <div className="fs-13 fw-4 cn-7" data-testid="overview-no-deployment">
                This application has not been deployed yet.
            </div>
        )
    }

    const renderEnvironmentDeploymentsStatus = () => {
        return (
            <div className="flex column left p-16">
                <div className="flex left fs-14 fw-6 lh-20 cn-9 mb-12" data-testid="overview-deployment">
                    <RocketIcon className="icon-dim-20 scn-9 mr-8" />
                    Deployments
                </div>
                {otherEnvsLoading ? <div className="dc__loading-dots" /> : renderDeploymentComponent()}
            </div>
        )
    }

    const getStatusIcon = (status: string): JSX.Element => {
        switch (status) {
            case 'Succeeded':
                return <SucceededIcon className="dc__app-summary__icon icon-dim-16 mr-6" />
            case 'Failed':
            case 'Error':
                return <FailedIcon className="dc__app-summary__icon icon-dim-16 mr-6" />
            case 'InProgress':
                return <InProgressIcon className="dc__app-summary__icon icon-dim-16 mr-6" />
            case 'Starting':
                return <div className="dc__app-summary__icon icon-dim-16 mr-6 progressing" />
            case 'Running':
                return <div className="dc__app-summary__icon icon-dim-16 mr-6 progressing" />
            case 'CANCELLED':
                return <div className="dc__app-summary__icon icon-dim-16 mr-6 cancelled" />
            default:
                return (
                    <>
                        <CrossIcon className="dc__app-summary__icon icon-dim-16 mr-6" />
                        Yet to run
                    </>
                )
        }
    }

    const renderWorkflowComponent = () => {
        if (!Array.isArray(jobPipelines) || !jobPipelines.length) {
            return (
                <div className="fs-13 fw-4 cn-7" data-testid="overview-no-pipelines">
                    No job pipelines are configured
                </div>
            )
        }

        return (
            <div className="env-deployments-info-wrapper w-100">
                <div
                    className="flex dc__border-bottom-n1 dc__uppercase fs-12 fw-6 cn-7 dc__content-start"
                    data-testid="overview-configured-pipeline"
                >
                    <div className="m-tb-8 w-300">Pipeline name</div>
                    <div className="flex">
                        <div className="m-tb-8 mr-16 w-150">Last run status</div>
                        <div className="m-tb-8 mr-16 w-150">Run in environment</div>
                        <div className="w-150 m-tb-8">Last run at</div>
                    </div>
                </div>
                {jobPipelines.map((jobPipeline, index) => (
                    <div key={jobPipeline.ciPipelineID} className="flex dc__content-start">
                        <div className="h-20 m-tb-8 cb-5 fs-13 w-300">
                            <Link
                                to={`${URLS.JOB}/${appId}/ci-details/${jobPipeline.ciPipelineName}/`}
                                className="fs-13"
                                data-testid={`overview-link-pipeline${index}`}
                            >
                                {jobPipeline.ciPipelineName}
                            </Link>
                        </div>
                        <div className="flex">
                            <div
                                data-testid={`${jobPipeline.status || 'notdeployed'}-job-status`}
                                className="mr-16 w-150 h-20 m-tb-8 fs-13 cn-9 flex dc__content-start"
                            >
                                {getStatusIcon(jobPipeline.status)}
                                {jobPipeline.status === 'CANCELLED' ? (
                                    <div>Aborted</div>
                                ) : (
                                    <div>{jobPipeline.status}</div>
                                )}
                            </div>
                            <div
                                data-testid={`${jobPipeline.environmentName}-${index}`}
                                className="mr-16 w-150 h-20 m-tb-8 fs-13 cn-9 flex dc__content-start"
                            >
                                {environmentName(jobPipeline)}
                                {environmentName(jobPipeline) === DEFAULT_ENV && (
                                    <span className="fw-4 fs-11 ml-4 dc__italic-font-style">{`(Default)`}</span>
                                )}
                            </div>
                            <div className="w-150 h-20 m-tb-8 fs-13">
                                {jobPipeline.startedOn !== '0001-01-01T00:00:00Z'
                                    ? handleUTCTime(jobPipeline.startedOn, true)
                                    : '-'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    const renderWorkflowsStatus = () => {
        return (
            <div className="flex column left pt-16 pb-16 pl-20 pr-20">
                <div className="flex left fs-14 fw-6 lh-20 cn-9 mb-12" data-testid="job-pipeline">
                    <WorkflowIcon className="icon-dim-20 scn-9 mr-8" />
                    Job pipelines
                </div>
                {renderWorkflowComponent()}
            </div>
        )
    }

    function renderAppDescription() {
        return (
            <div className="pl-16 pr-16 pt-16 dc__border-bottom-n1">
                <GenericDescription
                    isClusterTerminal={false}
                    isSuperAdmin={true}
                    appId={Number(appId)}
                    descriptionId={descriptionId}
                    initialDescriptionText={newDescription}
                    initialDescriptionUpdatedBy={newUpdatedBy}
                    initialDescriptionUpdatedOn={newUpdatedOn}
                    initialEditDescriptionView={true}
                    appMetaInfo={appMetaInfo}
                />
            </div>
        )
    }

    function renderOverviewContent(isJobOverview) {
        if (isJobOverview) {
            return (
                <div className="app-overview-wrapper dc__border-bottom-n1">
                    {renderAppDescription()}
                    {renderWorkflowsStatus()}
                </div>
            )
        } else {
            return (
                <div className="app-overview-wrapper dc__border-bottom-n1">
                    {renderAppDescription()}
                    {renderAppLevelExternalLinks()}
                    {renderEnvironmentDeploymentsStatus()}
                </div>
            )
        }
    }

    if (!appMetaInfo || fetchingProjects) {
        return <Progressing pageLoader />
    }

    return (
        // TODO: Fix the scroll for two column layout
        <div className="app-overview-container display-grid bcn-0">
            {renderSideInfoColumn()}
            {!isLoading && renderOverviewContent(isJobOverview)}
            {showUpdateAppModal && renderInfoModal()}
            {showUpdateTagModal && renderEditTagsModal()}
        </div>
    )
}
