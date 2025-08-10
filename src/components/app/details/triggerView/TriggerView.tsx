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
import { Route, Switch, useHistory, useLocation, useParams, useRouteMatch } from 'react-router-dom'

import {
    CommonNodeAttr,
    DeploymentNodeType,
    DocLink,
    ErrorScreenManager,
    Progressing,
} from '@devtron-labs/devtron-fe-common-lib'

import { getExternalCIConfig } from '@Components/ciPipeline/Webhook/webhook.service'

import { URLS } from '../../../../config'
import { APP_DETAILS } from '../../../../config/constantMessaging'
import { LinkedCIDetail } from '../../../../Pages/Shared/LinkedCIDetailsModal'
import {
    getCDPipelineURL,
    importComponentFromFELibrary,
    InValidHostUrlWarningBlock,
    useAppContext,
} from '../../../common'
import { getModuleInfo } from '../../../v2/devtronStackManager/DevtronStackManager.service'
import { AppNotConfigured } from '../appDetails/AppDetails'
import { Workflow } from './workflow/Workflow'
import { BuildImageModal } from './BuildImageModal'
import { TRIGGER_VIEW_PARAMS } from './Constants'
import { DeployImageModal } from './DeployImageModal'
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
        />
    </>
)

const TriggerView = ({ isJobView, filteredEnvIds }: TriggerViewProps) => {
    const { appId, envId } = useParams<CIMaterialRouterProps>()
    const history = useHistory()
    const location = useLocation()
    const match = useRouteMatch()

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
        history.push(`${match.url}${URLS.BUILD}/${ciNodeId}`)
    }

    const closeApprovalModal = (e: React.MouseEvent): void => {
        e.stopPropagation()
        history.push({
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
        history.push(match.url)
    }

    const renderCDMaterial = () => {
        if (
            location.search.includes(TRIGGER_VIEW_PARAMS.CD_NODE) ||
            location.search.includes(TRIGGER_VIEW_PARAMS.ROLLBACK_NODE)
        ) {
            const cdNode: CommonNodeAttr = getSelectedNodeFromWorkflows(workflows, location.search)

            const materialType = location.search.includes(TRIGGER_VIEW_PARAMS.CD_NODE)
                ? MATERIAL_TYPE.inputMaterialList
                : MATERIAL_TYPE.rollbackMaterialList

            const selectedWorkflow = workflows.find((wf) => wf.nodes.some((node) => node.id === cdNode.id))
            const selectedCINode = selectedWorkflow?.nodes.find((node) => node.type === 'CI' || node.type === 'WEBHOOK')
            const doesWorkflowContainsWebhook = selectedCINode?.type === 'WEBHOOK'
            const configurePluginURL = getCDPipelineURL(
                appId,
                selectedWorkflow?.id || '0',
                doesWorkflowContainsWebhook ? '0' : selectedCINode?.id,
                doesWorkflowContainsWebhook,
                cdNode.id || '0',
                true,
            )

            return (
                <DeployImageModal
                    materialType={materialType}
                    appId={+appId}
                    envId={cdNode.environmentId}
                    appName={currentAppName}
                    stageType={cdNode.type as DeploymentNodeType}
                    envName={cdNode.environmentName}
                    pipelineId={Number(cdNode.id)}
                    handleClose={revertToPreviousURL}
                    handleSuccess={reloadWorkflowStatus}
                    deploymentAppType={cdNode.deploymentAppType}
                    isVirtualEnvironment={cdNode.isVirtualEnvironment}
                    showPluginWarningBeforeTrigger={cdNode.showPluginWarning}
                    consequence={cdNode.pluginBlockState}
                    configurePluginURL={configurePluginURL}
                    isTriggerBlockedDueToPlugin={cdNode.showPluginWarning && cdNode.isTriggerBlocked}
                    triggerType={cdNode.triggerType}
                    parentEnvironmentName={cdNode.parentEnvironmentName}
                />
            )
        }

        return null
    }

    const renderApprovalMaterial = () => {
        if (ApprovalMaterialModal && location.search.includes(TRIGGER_VIEW_PARAMS.APPROVAL_NODE)) {
            const node = getSelectedNodeFromWorkflows(workflows, location.search)

            if (!node.id) {
                return null
            }

            return (
                <ApprovalMaterialModal
                    node={node}
                    materialType={MATERIAL_TYPE.inputMaterialList}
                    stageType={node.type}
                    closeApprovalModal={closeApprovalModal}
                    appId={+appId}
                    pipelineId={node.id}
                    getModuleInfo={getModuleInfo}
                    ciPipelineId={node.connectingCiPipelineId}
                    history={history}
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
                    history={history}
                    location={location}
                    match={{ params: { appId, envId }, url: match.url, path: match.path, isExact: match.isExact }}
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
            <LinkedCIDetail workflows={workflows} handleClose={revertToPreviousURL} />
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
                {isJobView ? (
                    <AppNotConfigured
                        title={APP_DETAILS.JOB_FULLY_NOT_CONFIGURED.title}
                        subtitle={<JobNotConfiguredSubtitle />}
                        buttonTitle={APP_DETAILS.JOB_FULLY_NOT_CONFIGURED.buttonTitle}
                        isJobView={isJobView}
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
                {renderHostErrorMessage()}
                {renderWorkflow()}

                <Switch>
                    <Route path={`${match.url}${URLS.BUILD}/:ciNodeId`} exact>
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
                    </Route>
                </Switch>

                {renderCDMaterial()}
                {renderApprovalMaterial()}
            </div>
            {WorkflowActionRouter && (
                <WorkflowActionRouter
                    basePath={match.path}
                    baseURL={match.url}
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
