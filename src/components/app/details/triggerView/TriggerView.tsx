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

import React, { useState } from 'react'
import { generatePath, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'

import { DocLink, ErrorScreenManager, Progressing, ROUTER_URLS } from '@devtron-labs/devtron-fe-common-lib'

import { getExternalCIConfig } from '@Components/ciPipeline/Webhook/webhook.service'

import { APP_DETAILS } from '../../../../config/constantMessaging'
import { LinkedCIDetail } from '../../../../Pages/Shared/LinkedCIDetailsModal'
import { importComponentFromFELibrary, InValidHostUrlWarningBlock, useAppContext } from '../../../common'
import { getModuleInfo } from '../../../v2/devtronStackManager/DevtronStackManager.service'
import { AppNotConfigured } from '../appDetails/AppDetails'
import { Workflow } from './workflow/Workflow'
import { BuildImageModal } from './BuildImageModal'
import CDMaterial from './CDMaterial'
import { TRIGGER_VIEW_PARAMS } from './Constants'
import { useTriggerViewServices } from './TriggerView.service'
import { getSelectedNodeFromWorkflows, shouldRenderWebhookAddImageModal } from './TriggerView.utils'
import { CIMaterialRouterProps, MATERIAL_TYPE, TriggerViewProps } from './types'

const ApprovalMaterialModal = importComponentFromFELibrary('ApprovalMaterialModal')
const WorkflowActionRouter = importComponentFromFELibrary('WorkflowActionRouter', null, 'function')
const WebhookAddImageModal = importComponentFromFELibrary('WebhookAddImageModal', null, 'function')

const JobNotConfiguredSubtitle = () => (
    <>
        {APP_DETAILS.JOB_FULLY_NOT_CONFIGURED.subTitle}&nbsp;
        <DocLink
            docLinkKey="APP_CREATE"
            dataTestId="job-not-configured-learn-more"
            fontWeight="normal"
            text={APP_DETAILS.NEED_HELP}
            fullWidth
        />
    </>
)

const TriggerView = ({ isJobView, filteredEnvIds }: TriggerViewProps) => {
    const { appId, envId } = useParams<CIMaterialRouterProps>()
    const navigate = useNavigate()
    const location = useLocation()

    const { currentAppName } = useAppContext()

    const [selectedWebhookNodeId, setSelectedWebhookNodeId] = useState<number | null>(null)

    const {
        isLoading,
        hostUrlConfig,
        environmentList,
        workflows,
        filteredCIPipelines,
        workflowsError,
        reloadWorkflows,
        reloadWorkflowStatus,
    } = useTriggerViewServices({ appId, isJobView, filteredEnvIds })

    const openCIMaterialModal = (ciNodeId: string) => {
        navigate(`build/${ciNodeId}`)
    }

    const closeApprovalModal = (e: React.MouseEvent): void => {
        e.stopPropagation()
        navigate({
            search: '',
        })
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        reloadWorkflowStatus()
    }

    const getWebhookDetails = () => getExternalCIConfig(appId, selectedWebhookNodeId, false)

    const handleWebhookAddImageClick = (webhookId: number) => {
        setSelectedWebhookNodeId(webhookId)
    }

    const handleWebhookAddImageModalClose = () => {
        setSelectedWebhookNodeId(null)
    }

    const revertToPreviousURL = () => {
        const redirectPath = generatePath(
            isJobView ? ROUTER_URLS.JOB_DETAIL.TRIGGER : ROUTER_URLS.DEVTRON_APP_DETAILS.TRIGGER,
            { appId },
        )
        navigate(redirectPath)
    }

    const renderApprovalMaterial = () => {
        if (ApprovalMaterialModal && location.search.includes(TRIGGER_VIEW_PARAMS.APPROVAL_NODE)) {
            const { node, cdNodeId } = getSelectedNodeFromWorkflows(workflows, location.search)

            return (
                <ApprovalMaterialModal
                    node={node}
                    materialType={MATERIAL_TYPE.inputMaterialList}
                    stageType={node?.type}
                    closeApprovalModal={closeApprovalModal}
                    appId={+appId}
                    pipelineId={cdNodeId}
                    getModuleInfo={getModuleInfo}
                    ciPipelineId={node?.connectingCiPipelineId}
                />
            )
        }

        return null
    }

    const renderWebhookAddImageModal = () => {
        if (WebhookAddImageModal && shouldRenderWebhookAddImageModal(location) && selectedWebhookNodeId) {
            return (
                <WebhookAddImageModal getWebhookDetails={getWebhookDetails} onClose={handleWebhookAddImageModalClose} />
            )
        }

        return null
    }

    const renderWorkflow = () => (
        <>
            {workflows.map((workflow, index) => (
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
                    params={{ appId, envId }}
                    location={location}
                    navigate={navigate}
                    isJobView={isJobView}
                    index={index}
                    filteredCIPipelines={filteredCIPipelines}
                    environmentLists={environmentList}
                    appId={+appId}
                    handleWebhookAddImageClick={handleWebhookAddImageClick}
                    openCIMaterialModal={openCIMaterialModal}
                    reloadTriggerView={reloadWorkflows}
                />
            ))}
            <LinkedCIDetail workflows={workflows} />
            {renderWebhookAddImageModal()}
        </>
    )

    const renderHostErrorMessage = () => {
        if (!hostUrlConfig || hostUrlConfig.value !== window.location.origin) {
            return (
                <div className="mb-16">
                    <InValidHostUrlWarningBlock />
                </div>
            )
        }

        return null
    }

    if (isLoading) {
        return <Progressing pageLoader />
    }

    if (workflowsError) {
        return <ErrorScreenManager code={workflowsError.code} reload={reloadWorkflows} />
    }

    if (!workflows.length) {
        return (
            <div className="flex-grow-1">
                <AppNotConfigured
                    {...(isJobView
                        ? {
                              title: APP_DETAILS.JOB_FULLY_NOT_CONFIGURED.title,
                              subtitle: <JobNotConfiguredSubtitle />,
                              buttonTitle: APP_DETAILS.JOB_FULLY_NOT_CONFIGURED.buttonTitle,
                              isJobView: true,
                          }
                        : {})}
                />
            </div>
        )
    }

    return (
        <>
            <div className="bg__primary py-16 px-20 dc__overflow-auto">
                {renderHostErrorMessage()}
                {renderWorkflow()}

                <Routes>
                    <Route
                        path="build/:ciNodeId"
                        element={
                            <BuildImageModal
                                handleClose={revertToPreviousURL}
                                isJobView={isJobView}
                                filteredCIPipelines={filteredCIPipelines}
                                workflows={workflows}
                                reloadWorkflows={reloadWorkflows}
                                appId={+appId}
                                environmentLists={environmentList}
                                reloadWorkflowStatus={reloadWorkflowStatus}
                            />
                        }
                    />
                </Routes>

                <CDMaterial
                    workflows={workflows}
                    handleClose={revertToPreviousURL}
                    handleSuccess={reloadWorkflowStatus}
                    isTriggerView
                />
                {renderApprovalMaterial()}
            </div>
            {WorkflowActionRouter && (
                <WorkflowActionRouter
                    workflows={workflows}
                    getModuleInfo={getModuleInfo}
                    reloadWorkflowStatus={reloadWorkflowStatus}
                    appName={currentAppName}
                />
            )}
        </>
    )
}

export default TriggerView
