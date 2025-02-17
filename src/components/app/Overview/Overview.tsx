/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useEffect, useState } from 'react'
import moment from 'moment'
import { Link, useHistory, useLocation, useParams } from 'react-router-dom'
import { APP_TYPE, ModuleNameMap, Moment12HourFormat, URLS } from '../../../config'
import { getJobCIPipeline, getTeamList } from '../../../services/service'
import {
    showError,
    Progressing,
    TagType,
    stopPropagation,
    useAsync,
    getRandomColor,
    noop,
    StyledRadioGroup as RadioGroup,
    EditableTextArea,
    ToastManager,
    ToastVariantType,
    AppStatus,
    StatusType,
} from '@devtron-labs/devtron-fe-common-lib'
import ReactGA from 'react-ga4'
import { getGitProviderIcon, handleUTCTime, importComponentFromFELibrary } from '../../common'
import { AppOverviewProps, EditAppRequest, JobPipeline } from '../types'
import { ReactComponent as EditIcon } from '../../../assets/icons/ic-pencil.svg'
import { ReactComponent as TagIcon } from '../../../assets/icons/ic-tag.svg'
import defaultChartImage from '../../../assets/icons/ic-default-chart.svg'
import AboutAppInfoModal from '../details/AboutAppInfoModal'
import AboutTagEditModal from '../details/AboutTagEditModal'
import TagChipsContainer from './TagChipsContainer'
import './Overview.scss'
import { environmentName } from '../../Jobs/Utils'
import { DEFAULT_ENV } from '../details/triggerView/Constants'
import GenericDescription from '../../common/Description/GenericDescription'
import { editApp } from '../service'
import { getAppConfig, getResourceKindFromAppType } from './utils'
import { EnvironmentList } from './EnvironmentList'
import { MAX_LENGTH_350 } from '../../../config/constantMessaging'
import { getModuleInfo } from '../../v2/devtronStackManager/DevtronStackManager.service'
import { MODAL_STATE, OVERVIEW_TABS, TAB_SEARCH_KEY } from './constants'

const MandatoryTagWarning = importComponentFromFELibrary('MandatoryTagWarning')
const Catalog = importComponentFromFELibrary('Catalog', null, 'function')
const DependencyList = importComponentFromFELibrary('DependencyList')
const DeploymentWindowOverview = importComponentFromFELibrary('DeploymentWindowOverview')
const PartOfReleaseTrack = importComponentFromFELibrary('PartOfReleaseTrack', null, 'function')

type AvailableTabs = (typeof OVERVIEW_TABS)[keyof typeof OVERVIEW_TABS]

export default function AppOverview({ appMetaInfo, getAppMetaInfoRes, filteredEnvIds, appType }: AppOverviewProps) {
    const { appId: appIdFromParams } = useParams<{ appId: string }>()
    const location = useLocation()
    const history = useHistory()
    const searchParams = new URLSearchParams(location.search)
    const activeTab = searchParams.get(TAB_SEARCH_KEY) as AvailableTabs
    const isUpdateDependencyModalOpen =
        activeTab === OVERVIEW_TABS.DEPENDENCIES && searchParams.get(MODAL_STATE.key) === MODAL_STATE.value
    const config = getAppConfig(appType)
    const isJobOverview = appType === APP_TYPE.JOB
    const isHelmChart = appType === APP_TYPE.HELM_CHART
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
    // Added this state to handle the disabled and hidden state basis the loading of the dependency list inside DependencyList component
    const [isEditDependencyButtonDisabled, setIsEditDependencyButtonDisabled] = useState(false)
    const [reloadMandatoryProjects, setReloadMandatoryProjects] = useState<boolean>(true)
    const [, isArgoInstalled] = useAsync(() => getModuleInfo(ModuleNameMap.ARGO_CD), [])
    const { resourceName } = config

    let _moment: moment.Moment
    let _date: string

    const setActiveTab = (selectedTab: AvailableTabs) => {
        const _searchParams = new URLSearchParams({
            [TAB_SEARCH_KEY]: selectedTab,
        })
        history.replace({ search: _searchParams.toString() })
    }

    const toggleUpdateDependencyModal = () => {
        if (isUpdateDependencyModalOpen) {
            searchParams.delete(MODAL_STATE.key)
        } else {
            searchParams.set(MODAL_STATE.key, MODAL_STATE.value)
        }
        history.replace({ search: searchParams.toString() })
    }

    const handleEditDependencyClick = () => {
        ReactGA.event({
            category: 'Application Dependency',
            action: 'Edit Dependency click',
            label: 'Edit Dependency click',
        })
        toggleUpdateDependencyModal()
    }

    useEffect(() => {
        // add a default tab if not set
        if (!activeTab || !Object.values(OVERVIEW_TABS).includes(activeTab)) {
            searchParams.set(TAB_SEARCH_KEY, OVERVIEW_TABS.ABOUT)
            history.replace({ search: searchParams.toString() })
        }
    }, [searchParams])

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
                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: 'Successfully saved',
                })
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
                    {appType === APP_TYPE.DEVTRON_APPS && gitMaterials.length > 0 && (
                        <div>
                            <div className="fs-13 fw-4 lh-20 cn-7 mb-4">Code source</div>
                            <div className="flexbox-col dc__gap-4">
                                {gitMaterials.map((codeSource, index) => (
                                    <a
                                        className="flexbox dc__gap-8"
                                        href={codeSource.redirectionUrl}
                                        target="_blank"
                                        rel="external no-referrer noreferrer"
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
                    {PartOfReleaseTrack && appType === 'app' && <PartOfReleaseTrack appId={+appId} />}
                </div>
                {!isHelmChart && (
                    <>
                        <div className="dc__border-top-n1" />
                        {renderLabelTags()}
                    </>
                )}
            </aside>
        )
    }

    const renderLabelTags = () => (
        <div>
            <div className="flexbox-col dc__gap-12">
                <div className="flexbox flex-justify dc__gap-10">
                    <div className="flexbox flex-align-center dc__gap-8 fs-13 fw-6 lh-20 cn-9">
                        <TagIcon className="tags-icon icon-dim-20" />
                        Tags
                    </div>
                    <EditIcon className="icon-dim-16 cursor mw-16" onClick={toggleTagsUpdateModal} />
                </div>
                <TagChipsContainer
                    appType={appType}
                    labelTags={currentLabelTags}
                    onAddTagButtonClick={toggleTagsUpdateModal}
                    resourceName={resourceName}
                    whiteBackground
                />
            </div>
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
                                className="mr-16 w-150 h-20 m-tb-8"
                            >
                                <AppStatus status={jobPipeline.status || StatusType.NOT_DEPLOYED} isJobView />
                            </div>
                            <div
                                data-testid={`${jobPipeline.environmentName}-${index}`}
                                className="mr-16 w-150 h-20 m-tb-8 fs-13 cn-9 flex dc__content-start"
                            >
                                {environmentName(jobPipeline)}
                                {environmentName(jobPipeline) === DEFAULT_ENV && (
                                    <span className="fw-4 fs-11 ml-4 dc__italic-font-style">(Default)</span>
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
                {Catalog && <Catalog resourceId={appId} resourceType={getResourceKindFromAppType(appType)} />}
                {DeploymentWindowOverview && (
                    <DeploymentWindowOverview appId={Number(appId)} filteredEnvIds={filteredEnvIds} />
                )}
                <GenericDescription
                    isClusterTerminal={false}
                    appId={Number(appId)}
                    descriptionId={descriptionId}
                    initialDescriptionText={newDescription}
                    initialDescriptionUpdatedBy={newUpdatedBy}
                    initialDescriptionUpdatedOn={newUpdatedOn}
                    initialEditDescriptionView
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
                        className="gui-yaml-switch gui-yaml-switch--lg gui-yaml-switch-window-bg flex-justify-start dc__no-background-imp"
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
                    <div className="flexbox-col dc__gap-12">{contentToRender[activeTab]?.()}</div>
                </div>
            )
        }
        if (isHelmChart) {
            return <div className="app-overview-wrapper flexbox-col dc__gap-12">{renderAppDescription()}</div>
        }
        const contentToRender = {
            [OVERVIEW_TABS.ABOUT]: renderAppDescription,
            [OVERVIEW_TABS.ENVIRONMENTS]: () => <EnvironmentList appId={+appId} filteredEnvIds={filteredEnvIds} />,
            [OVERVIEW_TABS.DEPENDENCIES]: () =>
                DependencyList ? (
                    <DependencyList
                        resourceId={+appId}
                        resourceType={appType}
                        isArgoInstalled={isArgoInstalled}
                        resourceName={appMetaInfo.appName}
                        isUpdateModalOpen={isUpdateDependencyModalOpen}
                        toggleUpdateModalOpen={toggleUpdateDependencyModal}
                        toggleButtonDisabledState={setIsEditDependencyButtonDisabled}
                        filteredEnvIds={filteredEnvIds}
                    />
                ) : null,
        }

        return (
            <div className="app-overview-wrapper flexbox-col dc__gap-12">
                <div className="flex flex-justify dc__gap-8">
                    <RadioGroup
                        className="gui-yaml-switch gui-yaml-switch--lg gui-yaml-switch-window-bg flex-justify-start dc__no-background-imp"
                        name="overview-tabs"
                        initialTab={activeTab}
                        disabled={false}
                        onChange={(e) => {
                            setActiveTab(e.target.value)
                        }}
                    >
                        <RadioGroup.Radio value={OVERVIEW_TABS.ABOUT}>About</RadioGroup.Radio>
                        <RadioGroup.Radio value={OVERVIEW_TABS.ENVIRONMENTS}>Environments</RadioGroup.Radio>
                        {DependencyList && (
                            <RadioGroup.Radio value={OVERVIEW_TABS.DEPENDENCIES}>Dependencies</RadioGroup.Radio>
                        )}
                    </RadioGroup>
                    {activeTab === OVERVIEW_TABS.DEPENDENCIES && (
                        <button
                            type="button"
                            className={`cta flex h-28 dc__gap-4 ${isEditDependencyButtonDisabled ? 'disabled-opacity' : ''}`}
                            onClick={isEditDependencyButtonDisabled ? noop : handleEditDependencyClick}
                        >
                            <EditIcon className="mw-14 icon-dim-14 scn-0 dc__no-svg-fill" />
                            Edit Dependency
                        </button>
                    )}
                </div>
                <div className="flexbox-col dc__gap-12">{contentToRender[activeTab]?.()}</div>
            </div>
        )
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
