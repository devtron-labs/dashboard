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

import React, { Component } from 'react'
import { withRouter, Route, Switch } from 'react-router-dom'

import {
    ServerErrors,
    showError,
    Progressing,
    ErrorScreenManager,
    stopPropagation,
    VisibleModal,
    DeploymentNodeType,
    CommonNodeAttr,
    getEnvironmentListMinPublic,
    DocLink,
    DEFAULT_ENV,
    handleAnalyticsEvent,
    WorkflowType,
} from '@devtron-labs/devtron-fe-common-lib'

import { getWorkflowStatus } from '../../service'
import {
    getCDPipelineURL,
    importComponentFromFELibrary,
    InValidHostUrlWarningBlock,
    sortObjectArrayAlphabetically,
    withAppContext,
} from '../../../common'
import { getTriggerWorkflows } from './workflow.service'
import { Workflow } from './workflow/Workflow'
import { TriggerViewProps, TriggerViewState } from './types'
import CDMaterial from './cdMaterial'
import { URLS, ViewType } from '../../../../config'
import { AppNotConfigured } from '../appDetails/AppDetails'
import { getHostURLConfiguration } from '../../../../services/service'
import { ReactComponent as CloseIcon } from '../../../../assets/icons/ic-close.svg'
import { TriggerViewContext } from './config'
import { TRIGGER_VIEW_PARAMS, TRIGGER_VIEW_GA_EVENTS } from './Constants'
import { APP_DETAILS } from '../../../../config/constantMessaging'
import { processWorkflowStatuses } from '../../../ApplicationGroup/AppGroup.utils'
import { getModuleInfo } from '../../../v2/devtronStackManager/DevtronStackManager.service'
import { LinkedCIDetail } from '../../../../Pages/Shared/LinkedCIDetailsModal'
import { getExternalCIConfig } from '@Components/ciPipeline/Webhook/webhook.service'
import { getSelectedNodeFromWorkflows, shouldRenderWebhookAddImageModal } from './TriggerView.utils'
import { BuildImageModal } from './BuildImageModal'

const ApprovalMaterialModal = importComponentFromFELibrary('ApprovalMaterialModal')
const WorkflowActionRouter = importComponentFromFELibrary('WorkflowActionRouter', null, 'function')
const WebhookAddImageModal = importComponentFromFELibrary('WebhookAddImageModal', null, 'function')

class TriggerView extends Component<TriggerViewProps, TriggerViewState> {
    timerRef

    inprogressStatusTimer

    abortController: AbortController

    abortCIBuild: AbortController

    constructor(props: TriggerViewProps) {
        super(props)
        this.state = {
            code: 0,
            view: ViewType.LOADING,
            workflows: [],
            workflowId: 0,
            isLoading: false,
            hostURLConfig: undefined,
            filteredCIPipelines: [],
            isSaveLoading: false,
            environmentLists: [],
            appReleaseTags: [],
            tagsEditable: false,
            configs: false,
            isDefaultConfigPresent: false,
            searchImageTag: '',
            resourceFilters: [],
            selectedWebhookNodeId: null,
            isEnvListLoading: false,
        }
        this.abortController = new AbortController()
        this.abortCIBuild = new AbortController()
    }

    componentWillUnmount() {
        clearInterval(this.timerRef)
        this.inprogressStatusTimer && clearTimeout(this.inprogressStatusTimer)
    }

    componentDidMount() {
        this.getHostURLConfig()
        this.getWorkflows()
        this.getEnvironments()
    }

    reloadTriggerView = () => {
        this.setState({
            view: ViewType.LOADING,
        })
        this.inprogressStatusTimer && clearTimeout(this.inprogressStatusTimer)
        this.getWorkflows()
    }

    getEnvironments = () => {
        this.setState({ isEnvListLoading: true })
        getEnvironmentListMinPublic()
            .then((response) => {
                const list = []
                list.push({
                    id: 0,
                    clusterName: '',
                    name: DEFAULT_ENV,
                    active: false,
                    isClusterActive: false,
                    description: 'System default',
                })
                response.result?.forEach((env) => {
                    if (env.cluster_name !== 'default_cluster' && env.isClusterCdActive) {
                        list.push({
                            id: env.id,
                            clusterName: env.cluster_name,
                            name: env.environment_name,
                            active: false,
                            isClusterActive: env.isClusterActive,
                            description: env.description,
                        })
                    }
                })
                sortObjectArrayAlphabetically(list, 'name')
                this.setState({ environmentLists: list })
            })
            .catch((error) => {
                showError(error)
            })
            .finally(() => {
                this.setState({ isEnvListLoading: false })
            })
    }

    getWorkflows = async (): Promise<WorkflowType[]> => {
        try {
            const result = await getTriggerWorkflows(
                this.props.match.params.appId,
                !this.props.isJobView,
                this.props.isJobView,
                this.props.filteredEnvIds,
            )

            const _filteredCIPipelines = result.filteredCIPipelines || []
            const workflows = result.workflows || []
            this.setState({ workflows, view: ViewType.FORM, filteredCIPipelines: _filteredCIPipelines }, () => {
                this.getWorkflowStatus()
                this.timerRef && clearInterval(this.timerRef)
                this.timerRef = setInterval(() => {
                    this.getWorkflowStatus()
                }, 30000)
            })

            return workflows
        } catch (errors) {
            showError(errors)
            this.setState({ code: errors.code, view: ViewType.ERROR })
            return this.state.workflows
        }
    }

    getHostURLConfig() {
        getHostURLConfiguration()
            .then((response) => {
                this.setState({ hostURLConfig: response.result })
            })
            .catch(() => {})
    }

    componentDidUpdate(prevProps) {
        if (
            this.props.match.params.appId !== prevProps.match.params.appId ||
            prevProps.filteredEnvIds !== this.props.filteredEnvIds
        ) {
            this.setState({
                view: ViewType.LOADING,
            })
            this.getWorkflows()
        }
    }

    getWorkflowStatus = () => {
        getWorkflowStatus(this.props.match.params.appId)
            .then((response) => {
                const _processedWorkflowsData = processWorkflowStatuses(
                    response?.result?.ciWorkflowStatus ?? [],
                    response?.result?.cdWorkflowStatus ?? [],
                    this.state.workflows,
                )
                this.inprogressStatusTimer && clearTimeout(this.inprogressStatusTimer)
                if (_processedWorkflowsData.cicdInProgress) {
                    this.inprogressStatusTimer = setTimeout(() => {
                        this.getWorkflowStatus()
                    }, 10000)
                }
                this.setState({ workflows: _processedWorkflowsData.workflows })
            })
            .catch((errors: ServerErrors) => {
                showError(errors)
            })
    }

    openCIMaterialModal = (ciNodeId: string) => {
        this.props.history.push(`${this.props.match.url}${URLS.BUILD}/${ciNodeId}`)
    }

    onClickApprovalNode = (cdNodeId: number) => {
        handleAnalyticsEvent(TRIGGER_VIEW_GA_EVENTS.ApprovalNodeClicked)

        const newParams = new URLSearchParams([
            [TRIGGER_VIEW_PARAMS.APPROVAL_NODE, cdNodeId.toString()],
            [TRIGGER_VIEW_PARAMS.APPROVAL_STATE, TRIGGER_VIEW_PARAMS.APPROVAL],
        ])
        this.props.history.push({ search: newParams.toString() })
    }

    onClickCDMaterial = (cdNodeId: number, nodeType: DeploymentNodeType) => {
        handleAnalyticsEvent(TRIGGER_VIEW_GA_EVENTS.ImageClicked)

        const newParams = new URLSearchParams([
            [TRIGGER_VIEW_PARAMS.CD_NODE, cdNodeId.toString()],
            [TRIGGER_VIEW_PARAMS.NODE_TYPE, nodeType],
        ])
        this.props.history.push({
            search: newParams.toString(),
        })
    }

    // Assuming that rollback has only CD as nodeType
    onClickRollbackMaterial = (cdNodeId: number) => {
        handleAnalyticsEvent(TRIGGER_VIEW_GA_EVENTS.RollbackClicked)

        const newParams = new URLSearchParams([[TRIGGER_VIEW_PARAMS.ROLLBACK_NODE, cdNodeId.toString()]])
        this.props.history.push({
            search: newParams.toString(),
        })
    }

    closeCDModal = (e?: React.MouseEvent): void => {
        e?.stopPropagation()
        this.setState({ searchImageTag: '' })
        this.props.history.push({
            search: '',
        })
        this.getWorkflowStatus()
    }

    closeApprovalModal = (e: React.MouseEvent): void => {
        e.stopPropagation()
        this.props.history.push({
            search: '',
        })
        this.getWorkflowStatus()
    }

    getWebhookDetails = () =>
        getExternalCIConfig(this.props.match.params.appId, this.state.selectedWebhookNodeId, false)

    handleWebhookAddImageClick = (webhookId: number) => {
        this.setState({ selectedWebhookNodeId: webhookId })
    }

    handleWebhookAddImageModalClose = () => {
        this.setState({ selectedWebhookNodeId: null })
    }

    renderCDMaterialContent = (cdNode: CommonNodeAttr, materialType: string) => {
        const selectedWorkflow = this.state.workflows.find((wf) => wf.nodes.some((node) => node.id === cdNode.id))
        const selectedCINode = selectedWorkflow?.nodes.find((node) => node.type === 'CI' || node.type === 'WEBHOOK')
        const doesWorkflowContainsWebhook = selectedCINode?.type === 'WEBHOOK'
        const configurePluginURL = getCDPipelineURL(
            this.props.match.params.appId,
            selectedWorkflow.id,
            doesWorkflowContainsWebhook ? '0' : selectedCINode?.id,
            doesWorkflowContainsWebhook,
            cdNode.id,
            true,
        )

        return (
            <CDMaterial
                materialType={materialType}
                appId={Number(this.props.match.params.appId)}
                pipelineId={Number(cdNode.id)}
                stageType={cdNode.type as DeploymentNodeType}
                envName={cdNode?.environmentName}
                envId={cdNode?.environmentId}
                closeCDModal={this.closeCDModal}
                triggerType={cdNode.triggerType}
                isVirtualEnvironment={cdNode.isVirtualEnvironment}
                parentEnvironmentName={cdNode.parentEnvironmentName}
                isLoading={this.state.isLoading}
                ciPipelineId={cdNode.connectingCiPipelineId}
                isSaveLoading={this.state.isSaveLoading}
                deploymentAppType={cdNode?.deploymentAppType}
                showPluginWarningBeforeTrigger={cdNode?.showPluginWarning}
                consequence={cdNode?.pluginBlockState}
                configurePluginURL={configurePluginURL}
                isTriggerBlockedDueToPlugin={cdNode?.showPluginWarning && cdNode?.isTriggerBlocked}
            />
        )
    }

    renderCDMaterial() {
        if (
            this.props.location.search.includes(TRIGGER_VIEW_PARAMS.CD_NODE) ||
            this.props.location.search.includes(TRIGGER_VIEW_PARAMS.ROLLBACK_NODE)
        ) {
            const cdNode: CommonNodeAttr = getSelectedNodeFromWorkflows(
                this.state.workflows,
                this.props.location.search,
            )
            if (!cdNode) {
                return null
            }
            const materialType = this.props.location.search.includes(TRIGGER_VIEW_PARAMS.CD_NODE)
                ? 'inputMaterialList'
                : 'rollbackMaterialList'
            const material = cdNode[materialType] || []

            return (
                <VisibleModal parentClassName="dc__overflow-hidden" close={this.closeCDModal}>
                    <div
                        className={`modal-body--cd-material h-100 flexbox-col contains-diff-view ${
                            material.length > 0 ? '' : 'no-material'
                        }`}
                        onClick={stopPropagation}
                    >
                        {this.state.isLoading ? (
                            <>
                                <div className="trigger-modal__header flexbox dc__content-space">
                                    <button type="button" className="dc__transparent" onClick={this.closeCDModal}>
                                        <CloseIcon />
                                    </button>
                                </div>
                                <div className="flex-grow-1">
                                    <Progressing pageLoader size={32} />
                                </div>
                            </>
                        ) : (
                            this.renderCDMaterialContent(cdNode, materialType)
                        )}
                    </div>
                </VisibleModal>
            )
        }

        return null
    }

    renderApprovalMaterial() {
        if (ApprovalMaterialModal && this.props.location.search.includes(TRIGGER_VIEW_PARAMS.APPROVAL_NODE)) {
            const node = getSelectedNodeFromWorkflows(this.state.workflows, this.props.location.search)

            if (!node) {
                return null
            }

            return (
                <ApprovalMaterialModal
                    isLoading={this.state.isLoading}
                    node={node}
                    materialType="inputMaterialList"
                    stageType={node.type}
                    closeApprovalModal={this.closeApprovalModal}
                    appId={Number(this.props.match.params.appId)}
                    pipelineId={node.id}
                    getModuleInfo={getModuleInfo}
                    ciPipelineId={node.connectingCiPipelineId}
                    history={this.props.history}
                />
            )
        }

        return null
    }

    renderWebhookAddImageModal() {
        if (
            WebhookAddImageModal &&
            shouldRenderWebhookAddImageModal(this.props.location) &&
            this.state.selectedWebhookNodeId
        ) {
            return (
                <WebhookAddImageModal
                    getWebhookDetails={this.getWebhookDetails}
                    onClose={this.handleWebhookAddImageModalClose}
                />
            )
        }

        return null
    }

    revertToPreviousURL = () => {
        this.props.history.push(this.props.match.url)
    }

    renderWorkflow() {
        return (
            <>
                {this.state.workflows.map((workflow, index) => {
                    return (
                        <Workflow
                            key={workflow.id}
                            id={workflow.id}
                            name={workflow.name}
                            startX={workflow.startX}
                            startY={workflow.startY}
                            height={workflow.height}
                            width={workflow.width}
                            nodes={workflow.nodes}
                            artifactPromotionMetadata={workflow.artifactPromotionMetadata}
                            history={this.props.history}
                            location={this.props.location}
                            match={this.props.match}
                            isJobView={this.props.isJobView}
                            index={index}
                            filteredCIPipelines={this.state.filteredCIPipelines}
                            environmentLists={this.state.environmentLists}
                            appId={+this.props.match.params.appId}
                            handleWebhookAddImageClick={this.handleWebhookAddImageClick}
                            openCIMaterialModal={this.openCIMaterialModal}
                        />
                    )
                })}
                <LinkedCIDetail workflows={this.state.workflows} handleClose={this.revertToPreviousURL} />
                {this.renderWebhookAddImageModal()}
            </>
        )
    }

    renderHostErrorMessage() {
        if (!this.state.hostURLConfig || this.state.hostURLConfig.value !== window.location.origin) {
            return (
                <div className="mb-16">
                    <InValidHostUrlWarningBlock />
                </div>
            )
        }

        return null
    }

    jobNotConfiguredSubtitle = () => {
        return (
            <>
                {APP_DETAILS.JOB_FULLY_NOT_CONFIGURED.subTitle}&nbsp;
                <DocLink
                    docLinkKey="APP_CREATE"
                    dataTestId="job-not-configured-learn-more"
                    fontWeight="normal"
                    text={APP_DETAILS.NEED_HELP}
                />
            </>
        )
    }

    render() {
        if (this.state.view === ViewType.LOADING || this.state.isEnvListLoading) {
            return <Progressing pageLoader />
        }
        if (this.state.view === ViewType.ERROR) {
            return <ErrorScreenManager code={this.state.code} />
        }
        if (!this.state.workflows.length) {
            return (
                <div className="flex-grow-1">
                    {this.props.isJobView ? (
                        <AppNotConfigured
                            title={APP_DETAILS.JOB_FULLY_NOT_CONFIGURED.title}
                            subtitle={this.jobNotConfiguredSubtitle()}
                            buttonTitle={APP_DETAILS.JOB_FULLY_NOT_CONFIGURED.buttonTitle}
                            isJobView={this.props.isJobView}
                        />
                    ) : (
                        <AppNotConfigured />
                    )}
                </div>
            )
        }

        return (
            <>
                <div className="bg__primary py-16 px-20 dc__overflow-auto">
                    <TriggerViewContext.Provider
                        value={{
                            onClickCDMaterial: this.onClickCDMaterial,
                            onClickRollbackMaterial: this.onClickRollbackMaterial,
                            onClickApprovalNode: this.onClickApprovalNode,
                            reloadTriggerView: this.reloadTriggerView,
                        }}
                    >
                        {this.renderHostErrorMessage()}
                        {this.renderWorkflow()}

                        <Switch>
                            <Route path={`${this.props.match.url}${URLS.BUILD}/:ciNodeId`} exact>
                                <BuildImageModal
                                    handleClose={this.revertToPreviousURL}
                                    isJobView={this.props.isJobView}
                                    filteredCIPipelines={this.state.filteredCIPipelines}
                                    workflows={this.state.workflows}
                                    reloadWorkflows={this.getWorkflows}
                                    appId={+this.props.match.params.appId}
                                    environmentLists={this.state.environmentLists}
                                    reloadWorkflowStatus={this.getWorkflowStatus}
                                />
                            </Route>
                        </Switch>

                        {this.renderCDMaterial()}
                        {this.renderApprovalMaterial()}
                    </TriggerViewContext.Provider>
                </div>
                {WorkflowActionRouter && (
                    <WorkflowActionRouter
                        basePath={this.props.match.path}
                        baseURL={this.props.match.url}
                        workflows={this.state.workflows}
                        getModuleInfo={getModuleInfo}
                        reloadWorkflowStatus={this.getWorkflowStatus}
                        appName={this.props.appContext.currentAppName}
                    />
                )}
            </>
        )
    }
}

export default withRouter(withAppContext(TriggerView))
