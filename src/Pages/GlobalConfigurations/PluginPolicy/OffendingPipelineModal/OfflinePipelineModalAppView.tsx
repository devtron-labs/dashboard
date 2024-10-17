import { useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import { APIResponseHandler, GenericEmptyState, noop, useAsync } from '@devtron-labs/devtron-fe-common-lib'
import noOffendingPipelineImg from '@Images/no-offending-pipeline.png'
import { WorkflowCreate } from '@Components/app/details/triggerView/config'
import { getInitialWorkflows } from '@Components/app/details/triggerView/workflow.service'
import { Workflow } from '@Components/workflowEditor/Workflow'
import { OfflinePipelineModalAppViewProps } from './types'

const OfflinePipelineModalAppView = ({ appId }: OfflinePipelineModalAppViewProps) => {
    const history = useHistory()
    const location = useLocation()
    const match = useRouteMatch<any>()

    const [isWorkflowsLoading, workflowsResponse, workflowsError, refetchWorkflows] = useAsync(
        () => getInitialWorkflows(appId.toString(), WorkflowCreate, WorkflowCreate.workflow, true, false, null),
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
            {!isWorkflowsLoading && !workflowsError && workflowsResponse.workflows.length > 0 ? (
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
                        match={match}
                        handleCDSelect={noop}
                        handleCISelect={noop}
                        openEditWorkflow={noop}
                        showDeleteDialog={noop}
                        addCIPipeline={noop}
                        addWebhookCD={noop}
                        showWebhookTippy={workflow.showTippy}
                        hideWebhookTippy={noop}
                        isJobView={false}
                        envList={[]}
                        filteredCIPipelines={[]}
                        addNewPipelineBlocked
                        handleChangeCI={null}
                        selectedNode={null}
                        handleSelectedNodeChange={noop}
                        appName={null}
                        getWorkflows={refetchWorkflows}
                        reloadEnvironments={noop}
                        workflowPositionState={null}
                        handleDisplayLoader={noop}
                    />
                ))
            ) : (
                <GenericEmptyState
                    title="All pipelines are compliant for this app"
                    subTitle="All matching pipelines have required plugins configured."
                    image={noOffendingPipelineImg}
                />
            )}
        </APIResponseHandler>
    )
}

export default OfflinePipelineModalAppView
