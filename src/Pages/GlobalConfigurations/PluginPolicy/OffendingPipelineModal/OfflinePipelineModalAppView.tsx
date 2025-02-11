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

import { useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import { APIResponseHandler, GenericEmptyState, ImageType, noop, useAsync } from '@devtron-labs/devtron-fe-common-lib'
import noOffendingPipelineImg from '@Images/no-offending-pipeline.svg'
import { WorkflowCreate } from '@Components/app/details/triggerView/config'
import { getInitialWorkflows } from '@Components/app/details/triggerView/workflow.service'
import { Workflow } from '@Components/workflowEditor/Workflow'
import { OffendingPipelineModalAppViewProps } from './types'

const OffendingPipelineModalAppView = ({
    appId,
    appName,
    policyKind,
    policyName,
}: OffendingPipelineModalAppViewProps) => {
    const history = useHistory()
    const location = useLocation()
    const match = useRouteMatch<any>()

    const [isWorkflowsLoading, workflowsResponse, workflowsError, refetchWorkflows] = useAsync(
        () =>
            getInitialWorkflows({
                id: appId.toString(),
                dimensions: WorkflowCreate,
                workflowOffset: WorkflowCreate.workflow,
                useAppWfViewAPI: true,
                isJobView: false,
                filteredEnvIds: null,
                shouldCheckDeploymentWindow: false,
                offending: `policy/${policyKind}|identifier|${policyName}`,
                isTemplateView: false,
            }),
        [appId],
        !!appId,
    )

    return (
        <APIResponseHandler
            isLoading={isWorkflowsLoading}
            progressingProps={{
                pageLoader: true,
            }}
            error={workflowsError}
            errorScreenManagerProps={{
                code: workflowsError?.code,
                reload: refetchWorkflows,
            }}
        >
            {!isWorkflowsLoading && !workflowsError && workflowsResponse.workflows?.length > 0 ? (
                workflowsResponse.workflows.map((workflow) => (
                    <Workflow
                        key={workflow.id}
                        id={Number(workflow.id)}
                        name={workflow.name}
                        startX={workflow.startX}
                        startY={workflow.startY}
                        width={workflow.width}
                        height={workflow.height}
                        nodes={workflow.nodes}
                        history={history}
                        location={location}
                        match={{
                            ...match,
                            // Can't pass appId to url since we have infinite scrolling
                            params: {
                                ...match.params,
                                appId,
                                workflowId: workflow.id,
                            },
                        }}
                        handleCDSelect={noop}
                        handleCISelect={noop}
                        openEditWorkflow={noop}
                        showDeleteDialog={noop}
                        addCIPipeline={noop}
                        addWebhookCD={noop}
                        showWebhookTippy={false}
                        hideWebhookTippy={noop}
                        isJobView={false}
                        envList={[]}
                        filteredCIPipelines={[]}
                        addNewPipelineBlocked
                        handleChangeCI={null}
                        selectedNode={null}
                        handleSelectedNodeChange={noop}
                        appName={appName}
                        getWorkflows={refetchWorkflows}
                        reloadEnvironments={noop}
                        workflowPositionState={null}
                        handleDisplayLoader={noop}
                        isOffendingPipelineView
                    />
                ))
            ) : (
                <GenericEmptyState
                    title="All pipelines are compliant for this app"
                    subTitle="All matching pipelines have required plugins configured."
                    image={noOffendingPipelineImg}
                    imageType={ImageType.Large}
                />
            )}
        </APIResponseHandler>
    )
}

export default OffendingPipelineModalAppView
