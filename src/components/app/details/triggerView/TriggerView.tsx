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
import {
    ServerErrors,
    showError,
    Progressing,
    ErrorScreenManager,
    stopPropagation,
    VisibleModal,
    DeploymentNodeType,
    CommonNodeAttr,
    ToastManager,
    ToastVariantType,
    getEnvironmentListMinPublic,
    DocLink,
} from '@devtron-labs/devtron-fe-common-lib'
import ReactGA from 'react-ga4'
import { withRouter, Route, Switch } from 'react-router-dom'
import {
    getWorkflowStatus,
} from '../../service'
import {
    getCDPipelineURL,
    importComponentFromFELibrary,
    InValidHostUrlWarningBlock,
    preventBodyScroll,
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
import { DEFAULT_ENV, TRIGGER_VIEW_PARAMS, TRIGGER_VIEW_GA_EVENTS } from './Constants'
import {
    APP_DETAILS,
} from '../../../../config/constantMessaging'
import {
    processWorkflowStatuses,
} from '../../../ApplicationGroup/AppGroup.utils'
import { getModuleInfo } from '../../../v2/devtronStackManager/DevtronStackManager.service'
import { LinkedCIDetail } from '../../../../Pages/Shared/LinkedCIDetailsModal'
import { getExternalCIConfig } from '@Components/ciPipeline/Webhook/webhook.service'
import { shouldRenderWebhookAddImageModal } from './TriggerView.utils'
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
            cdNodeId: 0,
            workflowId: 0,
            nodeType: null,
            materialType: '',
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
        this.onClickCDMaterial = this.onClickCDMaterial.bind(this)
        this.abortController = new AbortController()
        this.abortCIBuild = new AbortController()
    }

    componentWillUnmount() {
        clearInterval(this.timerRef)
        this.inprogressStatusTimer && clearTimeout(this.inprogressStatusTimer)
    }

    componentDidMount() {
        this.getHostURLConfig()
        this.getWorkflows(true)
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
            }).finally(() => {
                this.setState({ isEnvListLoading: false })
            })
    }

    getWorkflows = (isFromOnMount?: boolean) => {
        getTriggerWorkflows(
            this.props.match.params.appId,
            !this.props.isJobView,
            this.props.isJobView,
            this.props.filteredEnvIds,
        )
            .then((result) => {
                const _filteredCIPipelines = result.filteredCIPipelines || []
                const workflows = result.workflows || []
                this.setState({ workflows, view: ViewType.FORM, filteredCIPipelines: _filteredCIPipelines }, () => {
                    this.getWorkflowStatus()
                    if (isFromOnMount) {
                        if (ApprovalMaterialModal) {
                            if (this.props.location.search.includes(TRIGGER_VIEW_PARAMS.APPROVAL_NODE)) {
                                const searchParams = new URLSearchParams(this.props.location.search)
                                const nodeId = searchParams.get(TRIGGER_VIEW_PARAMS.APPROVAL_NODE)
                                this.onClickCDMaterial(nodeId, DeploymentNodeType.CD, true)
                            }
                        }

                        if (this.props.location.search.includes('rollback-node')) {
                            const searchParams = new URLSearchParams(this.props.location.search)
                            const nodeId = Number(searchParams.get('rollback-node'))
                            if (!isNaN(nodeId)) {
                                this.onClickRollbackMaterial(nodeId)
                            } else {
                                ToastManager.showToast({
                                    variant: ToastVariantType.error,
                                    description: 'Invalid node id',
                                })
                                this.props.history.push({
                                    search: '',
                                })
                            }
                        } else if (this.props.location.search.includes('cd-node')) {
                            const searchParams = new URLSearchParams(this.props.location.search)
                            const nodeId = Number(searchParams.get('cd-node'))
                            const nodeType = searchParams.get('node-type') ?? DeploymentNodeType.CD

                            if (
                                nodeType !== DeploymentNodeType.CD &&
                                nodeType !== DeploymentNodeType.PRECD &&
                                nodeType !== DeploymentNodeType.POSTCD
                            ) {
                                ToastManager.showToast({
                                    variant: ToastVariantType.error,
                                    description: 'Invalid node type',
                                })
                                this.props.history.push({
                                    search: '',
                                })
                            } else if (!isNaN(nodeId)) {
                                this.onClickCDMaterial(nodeId, nodeType as DeploymentNodeType)
                            } else {
                                ToastManager.showToast({
                                    variant: ToastVariantType.error,
                                    description: 'Invalid node id',
                                })
                                this.props.history.push({
                                    search: '',
                                })
                            }
                        }
                    }
                    this.timerRef && clearInterval(this.timerRef)
                    this.timerRef = setInterval(() => {
                        this.getWorkflowStatus()
                    }, 30000)
                })
            })
            .catch((errors: ServerErrors) => {
                showError(errors)
                this.setState({ code: errors.code, view: ViewType.ERROR })
            })
    }

    getHostURLConfig() {
        getHostURLConfiguration()
            .then((response) => {
                this.setState({ hostURLConfig: response.result })
            })
            .catch((error) => {})
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
        // TODO: Check if match.url support fw/bw navigation
        this.props.history.push(`${this.props.match.url}${URLS.BUILD}/${ciNodeId}`)
    }

    // TODO: Can also combine rollback and onClickCDMaterial
    // Till then make sure that they are consistent
    onClickCDMaterial(cdNodeId, nodeType: DeploymentNodeType, isApprovalNode: boolean = false) {
        ReactGA.event(isApprovalNode ? TRIGGER_VIEW_GA_EVENTS.ApprovalNodeClicked : TRIGGER_VIEW_GA_EVENTS.ImageClicked)

        const workflows = [...this.state.workflows].map((workflow) => {
            const nodes = workflow.nodes.map((node) => {
                if (cdNodeId == node.id && node.type === nodeType) {
                    if (node.type === 'CD') {
                        // TODO: Potential bug since removed, data was from api which is now in cdmaterials data.userApprovalConfig ?? workflow.approvalConfiguredIdsMap[cdNodeId]
                        node.approvalConfigData = workflow.approvalConfiguredIdsMap[cdNodeId]
                    }
                }
                return node
            })

            workflow.nodes = nodes
            return workflow
        })
        this.setState({
            workflows,
            materialType: 'inputMaterialList',
            cdNodeId,
            nodeType,
        })
        preventBodyScroll(true)

        const newParams = new URLSearchParams(this.props.location.search)
        newParams.set(
            isApprovalNode ? TRIGGER_VIEW_PARAMS.APPROVAL_NODE : TRIGGER_VIEW_PARAMS.CD_NODE,
            cdNodeId.toString(),
        )
        if (!isApprovalNode) {
            newParams.set('node-type', nodeType)
        } else {
            const currentApprovalState = newParams.get(TRIGGER_VIEW_PARAMS.APPROVAL_STATE)
            const approvalState =
                currentApprovalState === TRIGGER_VIEW_PARAMS.PENDING
                    ? TRIGGER_VIEW_PARAMS.PENDING
                    : TRIGGER_VIEW_PARAMS.APPROVAL

            newParams.set(TRIGGER_VIEW_PARAMS.APPROVAL_STATE, approvalState)
            newParams.delete(TRIGGER_VIEW_PARAMS.CD_NODE)
            newParams.delete(TRIGGER_VIEW_PARAMS.NODE_TYPE)
        }
        this.props.history.push({
            search: newParams.toString(),
        })
    }

    // Assuming that rollback has only CD as nodeType
    onClickRollbackMaterial = (cdNodeId: number, offset?: number, size?: number) => {
        if (!offset && !size) {
            ReactGA.event(TRIGGER_VIEW_GA_EVENTS.RollbackClicked)
        }

        const workflows = [...this.state.workflows].map((workflow) => {
            const nodes = workflow.nodes.map((node) => {
                if (node.type === 'CD' && +node.id == cdNodeId) {
                    node.approvalConfigData = workflow.approvalConfiguredIdsMap[cdNodeId]
                }
                return node
            })
            workflow.nodes = nodes
            return workflow
        })
        this.setState(
            {
                workflows,
                materialType: 'rollbackMaterialList',
                cdNodeId,
                nodeType: 'CD',
            },
            () => {
                preventBodyScroll(true)
                this.getWorkflowStatus()
            },
        )

        const newParams = new URLSearchParams(this.props.location.search)
        newParams.set('rollback-node', cdNodeId.toString())
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
        preventBodyScroll(false)
        this.getWorkflowStatus()
    }

    closeApprovalModal = (e: React.MouseEvent): void => {
        e.stopPropagation()
        preventBodyScroll(false)
        this.props.history.push({
            search: '',
        })
        preventBodyScroll(false)
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

    getCDNode = (): CommonNodeAttr => {
        let node: CommonNodeAttr
        if (this.state.cdNodeId) {
            for (const _workflow of this.state.workflows) {
                node = _workflow.nodes.find((el) => {
                    // NOTE: cdNodeId is not a number here
                    return +el.id == this.state.cdNodeId && el.type == this.state.nodeType
                })

                if (node) {
                    break
                }
            }
        }

        return node ?? ({} as CommonNodeAttr)
    }

    renderCDMaterialContent = (cdNode: CommonNodeAttr) => {
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
                materialType={this.state.materialType}
                appId={Number(this.props.match.params.appId)}
                pipelineId={Number(this.state.cdNodeId)}
                stageType={DeploymentNodeType[this.state.nodeType]}
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
        if (this.props.location.search.includes('cd-node') || this.props.location.search.includes('rollback-node')) {
            const cdNode: CommonNodeAttr = this.getCDNode()
            if (!cdNode.id) {
                return null
            }
            const material = cdNode[this.state.materialType] || []

            return (
                <VisibleModal className="" parentClassName="dc__overflow-hidden" close={this.closeCDModal}>
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
                            this.renderCDMaterialContent(cdNode)
                        )}
                    </div>
                </VisibleModal>
            )
        }

        return null
    }

    renderApprovalMaterial() {
        if (ApprovalMaterialModal && this.props.location.search.includes(TRIGGER_VIEW_PARAMS.APPROVAL_NODE)) {
            const node: CommonNodeAttr = this.getCDNode()
            return (
                <ApprovalMaterialModal
                    isLoading={this.state.isLoading}
                    node={node}
                    materialType={this.state.materialType}
                    stageType={DeploymentNodeType[this.state.nodeType]}
                    closeApprovalModal={this.closeApprovalModal}
                    appId={Number(this.props.match.params.appId)}
                    pipelineId={this.state.cdNodeId}
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
