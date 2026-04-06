import { useLocation } from 'react-router-dom'

import { DeploymentNodeType } from '@devtron-labs/devtron-fe-common-lib'

import { getCDPipelineURL, useAppContext } from '@Components/common'

import { TRIGGER_VIEW_PARAMS } from './Constants'
import { DeployImageModal } from './DeployImageModal'
import { getSelectedNodeFromWorkflows } from './TriggerView.utils'
import { CDMaterialProps, MATERIAL_TYPE } from './types'

const CDMaterial = ({ workflows, handleClose, handleSuccess, isTriggerView }: CDMaterialProps) => {
    const location = useLocation()
    const { currentAppName: triggerViewAppName } = useAppContext()

    if (
        location.search.includes(TRIGGER_VIEW_PARAMS.CD_NODE) ||
        location.search.includes(TRIGGER_VIEW_PARAMS.ROLLBACK_NODE)
    ) {
        const { node: cdNode, cdNodeId } = getSelectedNodeFromWorkflows(workflows, location.search)

        const materialType = location.search.includes(TRIGGER_VIEW_PARAMS.CD_NODE)
            ? MATERIAL_TYPE.inputMaterialList
            : MATERIAL_TYPE.rollbackMaterialList

        const selectedWorkflow = workflows.find((wf) => wf.nodes.some((node) => node.id === cdNodeId))
        const selectedCINode = selectedWorkflow?.nodes.find((node) => node.type === 'CI' || node.type === 'WEBHOOK')
        const doesWorkflowContainsWebhook = selectedCINode?.type === 'WEBHOOK'

        const appId = selectedWorkflow?.appId ?? 0

        const configurePluginURL = getCDPipelineURL(
            String(appId),
            selectedWorkflow?.id || '0',
            doesWorkflowContainsWebhook ? '0' : selectedCINode?.id,
            doesWorkflowContainsWebhook,
            cdNode.id || '0',
            true,
        )

        return (
            <DeployImageModal
                materialType={materialType}
                appId={appId}
                envId={cdNode.environmentId}
                appName={isTriggerView ? triggerViewAppName : (selectedWorkflow?.name ?? '')}
                stageType={cdNode.type as DeploymentNodeType}
                envName={cdNode.environmentName}
                pipelineId={Number(cdNodeId)}
                handleClose={handleClose}
                handleSuccess={handleSuccess}
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

export default CDMaterial
