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

import React, { Component, ReactElement } from 'react'
import { Link } from 'react-router-dom'
import Tippy from '@tippyjs/react'
import {
    ConditionalWrap,
    ConfirmationDialog,
    DeploymentAppTypes,
    MODAL_TYPE,
    ServerErrors,
    showError,
    ToastManager,
    ToastVariantType,
    WorkflowNodeType,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICWarning } from '@Icons/ic-warning.svg'
import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg'
import { ReactComponent as ICDelete } from '../../../assets/icons/ic-delete-interactive.svg'
import { CDNodeProps, CDNodeState } from '../types'
import {
    BUTTON_TEXT,
    CONFIRMATION_DIALOG_MESSAGING,
    ERR_MESSAGE_ARGOCD,
    TOAST_INFO,
    VIEW_DELETION_STATUS,
} from '../../../config/constantMessaging'
import warningIconSrc from '../../../assets/icons/info-filled.svg'
import { URLS } from '../../../config'
import { envDescriptionTippy } from '../../app/details/triggerView/workflow/nodes/workflow.utils'
import DeleteCDNode from '../../cdPipeline/DeleteCDNode'
import { DeleteDialogType, ForceDeleteMessageType } from '../../cdPipeline/types'
import { CD_PATCH_ACTION } from '../../cdPipeline/cdPipeline.types'
import { deleteCDPipeline } from '../../cdPipeline/cdPipeline.service'
import { importComponentFromFELibrary } from '../../common'
import { handleDeleteCDNodePipeline } from '../../cdPipeline/cdpipeline.util'

const DeploymentWindowConfirmationDialog = importComponentFromFELibrary('DeploymentWindowConfirmationDialog')
export class CDNode extends Component<CDNodeProps, CDNodeState> {
    constructor(props) {
        super(props)
        this.state = {
            showDeletePipelinePopup: false,
            showDeleteDialog: false,
            showDeploymentConfirmationDeleteDialog: false,
            deleteDialog: DeleteDialogType.showNormalDeleteDialog,
            forceDeleteData: { forceDeleteDialogMessage: '', forceDeleteDialogTitle: '' },
            clusterName: '',
            deleteInProgress: false,
            deploymentWindowConfimationValue: '',
        }
    }

    setDeploymentWindowConfimationValue = (value: string) => {
        this.setState({ deploymentWindowConfimationValue: value })
    }

    onClickShowDeletePipelinePopup = () => {
        if (this.props.isDeploymentBlocked) {
            this.setState({ showDeploymentConfirmationDeleteDialog: true })
        } else {
            this.setState({
                showDeletePipelinePopup: true,
            })
        }
    }

    onClickHideDeletePipelinePopup = () => {
        this.setState({ showDeletePipelinePopup: false, showDeploymentConfirmationDeleteDialog: false })
    }

    handleDeleteCDNode = (e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()

        if (this.props.deploymentAppDeleteRequest) {
            this.onClickShowDeletePipelinePopup()
            return
        }
        if (this.props.isDeploymentBlocked) {
            this.setState({ showDeploymentConfirmationDeleteDialog: true })
        } else {
            this.setState({ showDeleteDialog: true })
        }
    }

    handleDeleteDialogUpdate = (deleteDialog: DeleteDialogType) => {
        this.setState({ deleteDialog })
    }

    handleForceDeleteDataUpdate = (forceDeleteData: ForceDeleteMessageType) => {
        this.setState({ forceDeleteData })
    }

    handleClusterNameUpdate = (clusterName: string) => {
        this.setState({ clusterName })
    }

    handleHideDeleteModal = () => {
        this.setState({ showDeleteDialog: false })
    }

    parseErrorIntoForceDelete = (serverError) => {
        const _forceDeleteData = { ...this.state.forceDeleteData }
        this.handleDeleteDialogUpdate(DeleteDialogType.showForceDeleteDialog)
        if (serverError instanceof ServerErrors && Array.isArray(serverError.errors)) {
            serverError.errors.map(({ userMessage, internalMessage }) => {
                _forceDeleteData.forceDeleteDialogMessage = internalMessage
                _forceDeleteData.forceDeleteDialogTitle = userMessage
            })
        }
        this.handleForceDeleteDataUpdate(_forceDeleteData)
    }

    deleteCD = (force: boolean, cascadeDelete: boolean) => {
        const isPartialDelete =
            this.props.deploymentAppType === DeploymentAppTypes.GITOPS && this.props.deploymentAppCreated && !force
        const payload = {
            action: isPartialDelete ? CD_PATCH_ACTION.DEPLOYMENT_PARTIAL_DELETE : CD_PATCH_ACTION.DELETE,
            appId: +this.props.appId,
            pipeline: {
                id: +this.props.id.substring(4),
            },
        }
        this.setState({ deleteInProgress: true })
        deleteCDPipeline(payload, force, cascadeDelete)
            .then((response) => {
                if (response.result) {
                    this.handleClusterNameUpdate(response.result.deleteResponse?.clusterName)
                    if (
                        cascadeDelete &&
                        !response.result.deleteResponse?.clusterReachable &&
                        !response.result.deleteResponse?.deleteInitiated
                    ) {
                        this.handleDeleteDialogUpdate(DeleteDialogType.showNonCascadeDeleteDialog)
                    } else {
                        this.handleHideDeleteModal()
                        ToastManager.showToast({
                            variant: ToastVariantType.success,
                            description: TOAST_INFO.PIPELINE_DELETION_INIT,
                        })
                        this.handleDeleteDialogUpdate(DeleteDialogType.showNormalDeleteDialog)
                        this.props.handleDisplayLoader?.()
                        this.props.getWorkflows?.()
                        this.props.reloadEnvironments?.()
                    }
                } else if (response.errors) {
                    this.handleDeleteDialogUpdate(DeleteDialogType.showForceDeleteDialog)
                    this.handleForceDeleteDataUpdate({
                        forceDeleteDialogTitle: 'Something went wrong',
                        forceDeleteDialogMessage: response.errors[0].userMessage,
                    })
                }
            })
            .catch((error: ServerErrors) => {
                // 412 is for linked pipeline and 403 is for RBAC
                if (!force && error.code != 403 && error.code != 412) {
                    this.parseErrorIntoForceDelete(error)
                    this.handleDeleteDialogUpdate(DeleteDialogType.showForceDeleteDialog)
                } else {
                    this.handleHideDeleteModal()
                }
                showError(error)
            })
            .finally(() => {
                this.setState({ deleteInProgress: false, showDeploymentConfirmationDeleteDialog: false })
            })
    }

    renderReadOnlyCard() {
        return (
            <div className="workflow-node dc__overflow-auto">
                <div className="workflow-node__title flex">
                    <div className="workflow-node__full-width-minus-Icon">
                        <span className="workflow-node__text-light">Deploy</span>
                        <div className="flex left column fs-12 fw-6 lh-18 pt-6 pb-6">
                            {this.props.cdNamesList.map((_cdName) => (
                                <span className="dc__ellipsis-right">{_cdName}</span>
                            ))}
                        </div>
                    </div>
                    <div className="workflow-node__icon-common workflow-node__CD-icon" />
                </div>
            </div>
        )
    }

    handleAddNewNode = (event: any) => {
        event.preventDefault()
        event.stopPropagation()

        if (this.props.addNewPipelineBlocked) {
            return
        }

        if (this.props.deploymentAppDeleteRequest) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: ERR_MESSAGE_ARGOCD,
            })
            return
        }

        if (this.props.isLastNode) {
            this.props.toggleCDMenu()
        } else {
            this.props.handleSelectedNodeChange({
                nodeType: WorkflowNodeType.CD,
                id: this.props.id.substring(4),
            })
        }
    }

    getAppDetailsURL(): string {
        const url = `${URLS.APP_DETAILS}/${this.props.environmentId}`
        return `${this.props.match.url.replace('edit/workflow', url)}`
    }

    renderConfirmationModal = (): JSX.Element => {
        return (
            <ConfirmationDialog>
                <ConfirmationDialog.Icon src={warningIconSrc} />
                <ConfirmationDialog.Body
                    title={`Deployment pipeline for ${this.props.environmentName} environment is being deleted`}
                />
                <p className="fs-13 cn-7 lh-1-54 mt-20">{CONFIRMATION_DIALOG_MESSAGING.DELETION_IN_PROGRESS}</p>
                <ConfirmationDialog.ButtonGroup>
                    <button type="button" className="cta cancel" onClick={this.onClickHideDeletePipelinePopup}>
                        {BUTTON_TEXT.CANCEL}
                    </button>
                    <Link to={this.getAppDetailsURL()}>
                        <button className="cta ml-12 dc__no-decor">{VIEW_DELETION_STATUS}</button>
                    </Link>
                </ConfirmationDialog.ButtonGroup>
            </ConfirmationDialog>
        )
    }

    renderDeploymentWindowConfirmationModal = () => (
        <DeploymentWindowConfirmationDialog
            onClose={this.onClickHideDeletePipelinePopup}
            value={this.state.deploymentWindowConfimationValue}
            setValue={this.setDeploymentWindowConfimationValue}
            isLoading={this.state.deleteInProgress}
            type={MODAL_TYPE.PIPELINE}
            onClickActionButton={() =>
                handleDeleteCDNodePipeline(this.deleteCD, this.props.deploymentAppType as DeploymentAppTypes)
            }
            appName={this.props.appName}
            envName={this.props.environmentName}
            appId={this.props.appId}
            envId={this.props.environmentId}
        />
    )

    renderDeleteConfirmationDialog = () => {
        if (this.state.showDeploymentConfirmationDeleteDialog && DeploymentWindowConfirmationDialog) {
            return this.renderDeploymentWindowConfirmationModal()
        } else if (this.state.showDeletePipelinePopup) {
            return this.renderConfirmationModal()
        }
        return null
    }

    onClickNodeCard = (event) => {
        if (this.props.deploymentAppDeleteRequest) {
            event.preventDefault()
            this.onClickShowDeletePipelinePopup()
        } else {
            this.props.hideWebhookTippy()
        }
    }

    renderNodeIcon = () => {
        if (this.props.showPluginWarning) {
            return <ICWarning className="icon-dim-18 warning-icon-y7 mr-12 dc__no-shrink" />
        }

        return (
            <div
                className={`workflow-node__icon-common dc__no-shrink pt-12 pb-12 mr-12 ${
                    this.props.isVirtualEnvironment
                        ? 'workflow-node__CD-rocket-icon'
                        : 'workflow-node__CD-icon dc__flip'
                }`}
            />
        )
    }

    renderWrapWithLink = (children: ReactElement) => (
        <Link
            to={this.props.to}
            onClick={this.onClickNodeCard}
            target={this.props.isOffendingPipelineView ? '_blank' : '_self'}
            className="dc__no-decor"
        >
            {children}
        </Link>
    )

    renderCardContent() {
        const selectedNodeKey = `${this.props.selectedNode?.nodeType}-${this.props.selectedNode?.id}`
        const currentNodeKey = `${WorkflowNodeType.CD}-${this.props.id.substring(4)}`
        return (
            <ConditionalWrap
                condition={!!this.props.to && (!this.props.isOffendingPipelineView || this.props.showPluginWarning)}
                wrap={this.renderWrapWithLink}
            >
                <div
                    data-testid={`workflow-editor-cd-node-${this.props.environmentName}`}
                    className={`workflow-node cursor ${this.props.deploymentAppDeleteRequest ? 'pl-0' : 'pl-16'}`}
                >
                    {this.props.deploymentAppDeleteRequest ? (
                        <div className="workflow-node__trigger-type-delete workflow-node__trigger-type--create-delete bcr-5 m-0 dc__position-abs fs-10 dc__uppercase dc__top-radius-8 dc__text-center" />
                    ) : (
                        <div className="workflow-node__trigger-type workflow-node__trigger-type--create">
                            {this.props.triggerType}
                        </div>
                    )}
                    <div className="workflow-node__title h-100 workflow-node__title--no-margin flex">
                        <div className="workflow-node__full-width-minus-Icon p-12">
                            <span className="workflow-node__text-light">
                                {this.props.deploymentAppDeleteRequest ? (
                                    <div className="cr-5">
                                        Deleting
                                        <span className="dc__loading-dots" />
                                    </div>
                                ) : (
                                    this.props.title
                                )}
                            </span>
                            {envDescriptionTippy(this.props.environmentName, this.props.description)}
                        </div>

                        {this.renderNodeIcon()}

                        {!this.props.isOffendingPipelineView && selectedNodeKey !== currentNodeKey && (
                            <div className="flexbox-col h-100 dc__border-left-n1 w-24 dc__align-items-center">
                                <Tippy
                                    placement="right"
                                    className="default-tt"
                                    content={
                                        <span className="add-cd-btn-tippy">
                                            {this.props.addNewPipelineBlocked
                                                ? 'Cannot add new workflow or deployment pipelines when environment filter is applied.'
                                                : 'Add deployment pipeline'}
                                        </span>
                                    }
                                >
                                    <div className="flex h-100 w-100 dc__border-bottom-n1--important">
                                        <button
                                            type="button"
                                            className="flex h-100 w-100 p-0 dc__outline-none-imp bg__primary dc__no-border workflow-node__title--add-cd-icon dc__hover-b500  pt-4 pb-4 pl-6 pr-6 workflow-node__title--top-right-rad-8"
                                            disabled={this.props.addNewPipelineBlocked}
                                            onClick={this.handleAddNewNode}
                                        >
                                            <Add className="icon-dim-12" />
                                        </button>
                                    </div>
                                </Tippy>

                                <Tippy placement="right" content="Delete pipeline" className="default-tt">
                                    <button
                                        type="button"
                                        className="flex h-100 w-100 dc__hover-r500 workflow-node__title--bottom-right-rad-8 pt-4 pb-4 pl-6 pr-6 dc__outline-none-imp bg__primary dc__no-border workflow-node__title--delete-cd-icon"
                                        onClick={this.handleDeleteCDNode}
                                    >
                                        <ICDelete className="icon-dim-12" />
                                    </button>
                                </Tippy>
                            </div>
                        )}
                    </div>
                </div>
            </ConditionalWrap>
        )
    }

    render() {
        return (
            <>
                <foreignObject
                    className="data-hj-whitelist"
                    key={`cd-${this.props.id}`}
                    x={this.props.x}
                    y={this.props.y}
                    width={this.props.width}
                    height={this.props.height}
                    style={{ overflow: this.props.cdNamesList?.length > 0 ? 'scroll' : 'visible' }}
                >
                    {this.props.cdNamesList?.length > 0 ? this.renderReadOnlyCard() : this.renderCardContent()}
                </foreignObject>
                <DeleteCDNode
                    showDeleteDialog={this.state.showDeleteDialog}
                    deleteDialog={this.state.deleteDialog}
                    setDeleteDialog={this.handleDeleteDialogUpdate}
                    clusterName={this.state.clusterName}
                    appName={this.props.appName}
                    hideDeleteModal={this.handleHideDeleteModal}
                    deleteCD={this.deleteCD}
                    deploymentAppType={this.props.deploymentAppType ?? ''}
                    forceDeleteData={this.state.forceDeleteData}
                    deleteTitleName={this.props.environmentName}
                    isLoading={this.state.deleteInProgress}
                />
                {this.renderDeleteConfirmationDialog()}
            </>
        )
    }
}
