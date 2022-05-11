import React, { useEffect, useState } from 'react'
import { Progressing, showError } from '../../../../common'
import DeploymentHistoryHeader from './DeploymentHistoryHeader'
import { getDeploymentHistoryDetail } from '../service'
import { useParams } from 'react-router'
import { DeploymentTemplateOptions, CompareViewDeploymentType, DeploymentHistoryDetail } from '../cd.type'
import CDEmptyState from '../CDEmptyState'
import DeploymentHistorySidebar from './DeploymentHistorySidebar'
import DeploymentHistoryDiffView from './DeploymentHistoryDiffView'

export default function DeploymentHistoryDetailedView({
    showTemplate,
    setShowTemplate,
    baseTimeStamp,
    baseTemplateId,
    setBaseTemplateId,
    // deploymentTemplatesConfiguration,
    loader,
    setLoader,
    deploymentTemplatesConfigSelector
}: CompareViewDeploymentType) {
    const { appId, pipelineId } = useParams<{ appId: string; pipelineId: string }>()
    const [selectedDeploymentTemplate, setSelectedDeploymentTemplate] = useState<DeploymentTemplateOptions>()
    const [currentConfiguration, setCurrentConfiguration] = useState<DeploymentHistoryDetail>()
    const [baseTemplateConfiguration, setBaseTemplateConfiguration] = useState<DeploymentHistoryDetail>()

    const [codeEditorLoading, setCodeEditorLoading] = useState<boolean>(false)

    useEffect(() => {
        setLoader(true)

        if (deploymentTemplatesConfigSelector && selectedDeploymentTemplate) {
            try {
                getDeploymentHistoryDetail(appId, pipelineId, selectedDeploymentTemplate.value, '', '').then(
                    (response) => {
                        setCurrentConfiguration(response?.result)
                        setLoader(false)
                    },
                )
            } catch (err) {
                showError(err)
                setLoader(false)
            }
        }
    }, [selectedDeploymentTemplate])

    useEffect(() => {
        try {
            setCodeEditorLoading(true)
            if (deploymentTemplatesConfigSelector && baseTemplateId) {
                getDeploymentHistoryDetail(appId, pipelineId, baseTemplateId, '', '').then((response) => {
                    setBaseTemplateConfiguration(response.result)
                    setCodeEditorLoading(false)
                })
            }
        } catch (err) {
            showError(err)
            setCodeEditorLoading(false)
        }
    }, [baseTemplateId])

    useEffect(() => {
        if (!showTemplate) {
            setShowTemplate(true)
        }

        return (): void => {
            if (showTemplate) {
                setShowTemplate(false)
            }
        }
    }, [showTemplate])

    return !deploymentTemplatesConfigSelector && deploymentTemplatesConfigSelector.length < 1 && !loader ? (
        <CDEmptyState />
    ) : (
        <>
            <DeploymentHistoryHeader
                deploymentTemplatesConfigSelector={deploymentTemplatesConfigSelector}
                selectedDeploymentTemplate={selectedDeploymentTemplate}
                setSelectedDeploymentTemplate={setSelectedDeploymentTemplate}
                setShowTemplate={setShowTemplate}
                setBaseTemplateId={setBaseTemplateId}
                baseTemplateId={baseTemplateId}
                baseTimeStamp={baseTimeStamp}
            />
            {loader ? (
                <Progressing pageLoader />
            ) : (
                <div className="historical-diff__container bcn-1">
                    <DeploymentHistorySidebar />
                    <DeploymentHistoryDiffView
                        currentConfiguration={currentConfiguration}
                        baseTemplateConfiguration={baseTemplateConfiguration}
                        codeEditorLoading={codeEditorLoading}
                    />
                </div>
            )}
        </>
    )
}
