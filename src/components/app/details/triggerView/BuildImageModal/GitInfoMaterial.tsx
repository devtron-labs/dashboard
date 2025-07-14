import { useState } from 'react'

import { CIMaterialSidebarType, showError, WorkflowNodeType } from '@devtron-labs/devtron-fe-common-lib'

import { getCIMaterialList, refreshGitMaterial } from '@Components/app/service'
import { getCIPipelineURL, importComponentFromFELibrary } from '@Components/common'

import { CiWebhookModal } from '../CiWebhookDebuggingModal'
import TriggerBuildSidebar from './TriggerBuildSidebar'
import { GitInfoMaterialProps } from './types'

import './GitInfoMaterial.scss'

const MissingPluginBlockState = importComponentFromFELibrary('MissingPluginBlockState', null, 'function')

const GitInfoMaterial = ({
    isCITriggerBlocked,
    appId,
    workflow,
    isJobView,
    ciNodeId,
    setMaterialList,
    runtimeParamsErrorState,
    materialList,
    showWebhookModal,
}: GitInfoMaterialProps) => {
    const [currentSidebarTab, setCurrentSidebarTab] = useState<CIMaterialSidebarType>(CIMaterialSidebarType.CODE_SOURCE)
    const workflowId = workflow.id
    // TODO: Check if send prop
    const ciNode = workflow.nodes.find((node) => node.type === WorkflowNodeType.CI)
    // Can these be multiple?
    const selectedMaterial = materialList.find((material) => material.isSelected)

    const handleSelectMaterial = (materialId: string) => {
        setMaterialList((prevMaterialList) =>
            prevMaterialList.map((material) => ({
                ...material,
                isSelected: +material.id === +materialId,
            })),
        )
    }

    const clearSearchFromSelectedMaterial = () => {
        setMaterialList((prevMaterialList) =>
            prevMaterialList.map((material) => ({
                ...material,
                searchText: material.isSelected ? '' : material.searchText,
            })),
        )
    }

    const refreshMaterial = async () => {
        if (!selectedMaterial) {
            return
        }

        try {
            setMaterialList((prevMaterialList) =>
                prevMaterialList.map((material) => ({
                    ...material,
                    isMaterialLoading: +material.id === selectedMaterial.id,
                })),
            )

            // TODO: AbortController
            await refreshGitMaterial(String(selectedMaterial.gitMaterialId), null)

            // TODO: Check if abortController is needed
            // FIXME: Lets disable search on refresh
            const newSelectedMaterialItem = await getCIMaterialList(
                {
                    pipelineId: String(ciNodeId),
                    materialId: selectedMaterial.gitMaterialId,
                    showExcluded: selectedMaterial.showAllCommits,
                },
                null,
            )

            setMaterialList((prevMaterialList) =>
                prevMaterialList.map((material) => {
                    // TODO: Check when newSelectedMaterialItem.result[0 is null
                    if (material.id === selectedMaterial.id) {
                        return {
                            ...newSelectedMaterialItem.result[0],
                            isSelected: material.isSelected,
                            isMaterialLoading: false,
                            searchText: material.searchText,
                            showAllCommits: material.showAllCommits,
                        }
                    }
                    return material
                }),
            )
        } catch (error) {
            showError(error)
        }
    }

    const handleSidebarTabChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentSidebarTab(e.target.value as CIMaterialSidebarType)
    }

    const renderBody = () => {
        if (showWebhookModal) {
            return (
                <CiWebhookModal
                    ciPipelineMaterialId={selectedMaterial.id}
                    gitMaterialUrl={selectedMaterial.gitMaterialUrl}
                    ciPipelineId={+(ciNode?.id || 0)}
                    workflowId={+workflowId}
                    appId={String(appId)}
                    isJobView={isJobView}
                    isJobCI={ciNode?.isJobCI}
                />
            )
        }

        return (
            <div className="dc__grid git-info-material__container">
                <TriggerBuildSidebar
                    ciNodeId={ciNodeId}
                    currentSidebarTab={currentSidebarTab}
                    handleSidebarTabChange={handleSidebarTabChange}
                    runtimeParamsErrorState={runtimeParamsErrorState}
                    materialList={materialList}
                    selectMaterial={handleSelectMaterial}
                    clearSearch={clearSearchFromSelectedMaterial}
                    refreshMaterial={refreshMaterial}
                />
            </div>
        )
    }

    const ciPipelineURL = getCIPipelineURL(
        String(appId),
        String(workflowId),
        true,
        ciNode?.id,
        isJobView,
        ciNode?.isJobCI,
        false,
    )

    return MissingPluginBlockState && isCITriggerBlocked ? (
        <MissingPluginBlockState
            configurePluginURL={ciPipelineURL}
            nodeType={WorkflowNodeType.CI}
            // In case of job [not jobCI] mandatory plugins are not applied
            isJobView={ciNode?.isJobCI}
        />
    ) : (
        renderBody()
    )
}

export default GitInfoMaterial
