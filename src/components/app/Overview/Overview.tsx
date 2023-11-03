import React, { useEffect, useMemo, useState } from 'react'
import moment from 'moment'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Moment12HourFormat, OVERVIEW_TABS, URLS } from '../../../config'
import { getJobCIPipeline, getTeamList } from '../../../services/service'
import {
    showError,
    Progressing,
    TagType,
    stopPropagation,
    useAsync,
    getRandomColor,
} from '@devtron-labs/devtron-fe-common-lib'
import { EditableTextArea, RadioGroup, handleUTCTime, importComponentFromFELibrary } from '../../common'
import { AppOverviewProps, EditAppRequest, JobPipeline } from '../types'
import { ReactComponent as EditIcon } from '../../../assets/icons/ic-pencil.svg'
import { ReactComponent as TagIcon } from '../../../assets/icons/ic-tag.svg'
import { ReactComponent as SucceededIcon } from '../../../assets/icons/ic-success.svg'
import { ReactComponent as InProgressIcon } from '../../../assets/icons/ic-progressing.svg'
import { ReactComponent as FailedIcon } from '../../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as CrossIcon } from '../../../assets/icons/ic-close.svg'
import defaultChartImage from '../../../assets/icons/ic-default-chart.svg'
import AboutAppInfoModal from '../details/AboutAppInfoModal'
import AboutTagEditModal from '../details/AboutTagEditModal'
import TagChipsContainer from './TagChipsContainer'
import './Overview.scss'
import { environmentName } from '../../Jobs/Utils'
import { DEFAULT_ENV } from '../details/triggerView/Constants'
import GenericDescription from '../../common/Description/GenericDescription'
import { editApp } from '../service'
import { getAppConfig, getGitProviderIcon } from './utils'
import { EnvironmentList } from './EnvironmentList'
import { MAX_LENGTH_350 } from '../../../config/constantMessaging'
const MandatoryTagWarning = importComponentFromFELibrary('MandatoryTagWarning')

export default function AppOverview({ appMetaInfo, getAppMetaInfoRes, filteredEnvIds, appType }: AppOverviewProps) {
    const { appId: appIdFromParams } = useParams<{ appId: string }>()
    const config = getAppConfig(appType)
    const isJobOverview = appType === 'job'
    const isHelmChart = appType === 'helm-chart'
    // For helm the appId from the params is the installed appId and not the actual id of the app
    const appId = isHelmChart ? `${appMetaInfo.appId}` : appIdFromParams
    const [isLoading, setIsLoading] = useState(true)
    const [currentLabelTags, setCurrentLabelTags] = useState<TagType[]>([])
    const [fetchingProjects, projectsListRes] = useAsync(() => getTeamList(), [appId])
    const [showUpdateAppModal, setShowUpdateAppModal] = useState(false)
    const [showUpdateTagModal, setShowUpdateTagModal] = useState(false)
    const [descriptionId, setDescriptionId] = useState<number>(0)
    const [newDescription, setNewDescription] = useState<string>(config.defaultNote)
    const [newUpdatedOn, setNewUpdatedOn] = useState<string>()
    const [newUpdatedBy, setNewUpdatedBy] = useState<string>()
    const [jobPipelines, setJobPipelines] = useState<JobPipeline[]>([])
    const [reloadMandatoryProjects, setReloadMandatoryProjects] = useState<boolean>(true)
    const [activeTab, setActiveTab] = useState<typeof OVERVIEW_TABS[keyof typeof OVERVIEW_TABS]>(OVERVIEW_TABS.ABOUT)
    const resourceName = config.resourceName

    let _moment: moment.Moment
    let _date: string

    useEffect(() => {
        if (appMetaInfo?.appName) {
            setCurrentLabelTags(appMetaInfo.labels)
            _moment = moment(appMetaInfo?.note?.updatedOn, 'YYYY-MM-DDTHH:mm:ssZ')
            _date = _moment.isValid() ? _moment.format(Moment12HourFormat) : appMetaInfo?.note?.updatedOn
            const description =
                appMetaInfo?.note?.description !== '' && appMetaInfo?.note?.id
                    ? appMetaInfo.note.description
                    : config.defaultNote
            _date = appMetaInfo?.note?.description !== '' && appMetaInfo?.note?.id ? _date : ''
            setNewUpdatedOn(_date)
            setNewUpdatedBy(appMetaInfo?.note?.updatedBy)
            setNewDescription(description)
            setDescriptionId(appMetaInfo?.note?.id)
            setIsLoading(false)
        }
    }, [appMetaInfo])

    useEffect(() => {
        if (isJobOverview) {
            getCIPipelinesForJob()
        }
    }, [appId])

    useEffect(() => {
        // Reload the app meta info in case it has changed
        getAppMetaInfoRes()
    }, [])

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
                description={appMetaInfo.note.description}
                appType={appType}
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
                description={appMetaInfo.note.description}
                appType={appType}
            />
        )
    }

    const renderSideInfoColumn = () => {
        const { appName, description, gitMaterials = [], createdOn, createdBy, projectName, chartUsed } = appMetaInfo

        const handleSaveDescription = async (value: string) => {
            const payload: EditAppRequest = {
                id: +appId,
                teamId: appMetaInfo.projectId,
                description: value?.trim(),
                labels: appMetaInfo.labels,
            }

            try {
                await editApp(payload)
                toast.success('Successfully saved')
                await getAppMetaInfoRes()
            } catch (err) {
                showError(err)
                throw err
            }
        }

        return (
            <aside className="flexbox-col dc__gap-16">
                <div className="flexbox-col dc__gap-12">
                    {(config.icon || (isHelmChart && !!chartUsed)) && (
                        <div>
                            {config.icon ?? (
                                // For Helm Charts
                                <div className="mxh-64 dc__mxw-120 mh-40 w-100 h-100 flexbox">
                                    <img
                                        src={chartUsed.chartAvatar || defaultChartImage}
                                        alt="App icon"
                                        className={`dc__chart-grid-item__icon ${
                                            chartUsed.chartAvatar ? '' : 'icon-dim-48'
                                        }`}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                    <div className="fs-16 fw-7 lh-24 cn-9 dc__word-break font-merriweather">{appName}</div>
                    <EditableTextArea
                        emptyState={config.defaultDescription}
                        placeholder={config.defaultDescription}
                        rows={4}
                        initialText={description}
                        updateContent={handleSaveDescription}
                        validations={{
                            maxLength: {
                                value: 350,
                                message: MAX_LENGTH_350,
                            },
                        }}
                    />
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
                    {isHelmChart && !!chartUsed && (
                        <div>
                            <div className="fs-13 fw-4 lh-20 cn-7 mb-4">Chart used</div>
                            <div className="fs-13 fw-6 lh-20 cn-9 dc__word-break">
                                <span>{chartUsed.appStoreChartName}/</span>
                                <Link
                                    className="dc__ellipsis-right"
                                    to={`${URLS.CHARTS_DISCOVER}${URLS.CHART}/${chartUsed.appStoreChartId}`}
                                >
                                    {chartUsed.appStoreAppName} ({chartUsed.appStoreAppVersion})
                                </Link>
                            </div>
                        </div>
                    )}
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
                                className="icon-dim-20 mw-20 flexbox flex-justify-center flex-align-center dc__border-radius-50-per dc__uppercase cn-0 fw-4"
                                style={{ backgroundColor: getRandomColor(createdBy) }}
                            >
                                {createdBy[0]}
                            </div>
                            {createdBy}
                        </div>
                    </div>
                    {appType === 'app' && gitMaterials.length > 0 && (
                        <div>
                            <div className="fs-13 fw-4 lh-20 cn-7 mb-4">Code source</div>
                            <div className="flexbox-col dc__gap-4">
                                {gitMaterials.map((codeSource, index) => (
                                    <a
                                        className="flexbox dc__gap-8"
                                        href={codeSource.redirectionUrl}
                                        target="_blank"
                                        rel="external no-referrer"
                                        key={`${codeSource.displayName}-${index}`}
                                    >
                                        {getGitProviderIcon(codeSource.redirectionUrl)}
                                        <span className="fs-13 fw-6 lh-20 cn-9 dc__ellipsis-right dc__word-break">
                                            {codeSource.displayName}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
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
                whiteBackground
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
                    className="flex dc__border-bottom dc__uppercase fs-12 fw-6 cn-7 dc__content-start pr-16 pl-16"
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
                    <div key={jobPipeline.ciPipelineID} className="flex dc__content-start pr-16 pl-16">
                        <div className="h-20 m-tb-8 cb-5 fs-13 w-300">
                            <Link
                                to={`${URLS.JOB}/${appId}/ci-details/${jobPipeline.ciPipelineID}/`}
                                className="fs-13 dc__ellipsis-right"
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
        return <div className="flex column left">{renderWorkflowComponent()}</div>
    }

    function renderAppDescription() {
        return (
            <div>
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

    function renderOverviewContent() {
        if (isJobOverview) {
            const contentToRender = {
                [OVERVIEW_TABS.ABOUT]: renderAppDescription,
                [OVERVIEW_TABS.JOB_PIPELINES]: renderWorkflowsStatus,
            }

            return (
                <div className="app-overview-wrapper flexbox-col dc__gap-12">
                    <RadioGroup
                        className="gui-yaml-switch gui-yaml-switch-window-bg flex-justify-start dc__no-background-imp"
                        name="overview-tabs"
                        initialTab={OVERVIEW_TABS.ABOUT}
                        disabled={false}
                        onChange={(e) => {
                            setActiveTab(e.target.value)
                        }}
                    >
                        <RadioGroup.Radio value={OVERVIEW_TABS.ABOUT}>About</RadioGroup.Radio>
                        <RadioGroup.Radio value={OVERVIEW_TABS.JOB_PIPELINES}>Job Pipelines</RadioGroup.Radio>
                    </RadioGroup>
                    <div className="flexbox-col dc__gap-12">{contentToRender[activeTab]()}</div>
                </div>
            )
        } else if (isHelmChart) {
            return <div className="app-overview-wrapper flexbox-col dc__gap-12">{renderAppDescription()}</div>
        } else {
            const contentToRender = {
                [OVERVIEW_TABS.ABOUT]: renderAppDescription,
                [OVERVIEW_TABS.ENVIRONMENTS]: () => <EnvironmentList appId={+appId} filteredEnvIds={filteredEnvIds} />,
            }

            return (
                <div className="app-overview-wrapper flexbox-col dc__gap-12">
                    <RadioGroup
                        className="gui-yaml-switch gui-yaml-switch-window-bg flex-justify-start dc__no-background-imp"
                        name="overview-tabs"
                        initialTab={OVERVIEW_TABS.ABOUT}
                        disabled={false}
                        onChange={(e) => {
                            setActiveTab(e.target.value)
                        }}
                    >
                        <RadioGroup.Radio value={OVERVIEW_TABS.ABOUT}>About</RadioGroup.Radio>
                        <RadioGroup.Radio value={OVERVIEW_TABS.ENVIRONMENTS}>Environments</RadioGroup.Radio>
                    </RadioGroup>
                    <div className="flexbox-col dc__gap-12">{contentToRender[activeTab]()}</div>
                </div>
            )
        }
    }

    if (!appMetaInfo || fetchingProjects) {
        return <Progressing pageLoader />
    }

    return (
        // TODO: Fix the scroll for two column layout
        <div className={`app-overview-container p-20 h-100 ${activeTab === OVERVIEW_TABS.ABOUT ? 'sidebar-open' : ''}`}>
            {activeTab === OVERVIEW_TABS.ABOUT ? renderSideInfoColumn() : <span />}
            {!isLoading && renderOverviewContent()}
            {showUpdateAppModal && renderInfoModal()}
            {showUpdateTagModal && renderEditTagsModal()}
        </div>
    )
}
