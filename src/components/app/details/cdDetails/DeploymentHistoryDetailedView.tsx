import React, { useEffect, useState } from 'react'
import { showError, sortCallback } from '../../../common'
import CompareWithBaseConfig from './CompareWithBaseConfig'
import HistoryDiff from './HistoryDiffWrapper'
import { getDeploymentTemplateDiff, getDeploymentTemplateDiffId } from './service'
import { useParams } from 'react-router'
import {
    DeploymentTemplateOptions,
    CompareViewDeploymentType,
    DeploymentTemplateConfiguration,
    DeploymentTemplateViaTargetId,
} from './cd.type'
import CDEmptyState from './CDEmptyState'

function DeploymentHistoryDetailedView({
    showTemplate,
    setShowTemplate,
    baseTimeStamp,
    baseTemplateId,
    setBaseTemplateId,
    deploymentTemplatesConfiguration,
    loader,
    setLoader,
}: CompareViewDeploymentType) {
    const { appId, pipelineId } = useParams<{ appId: string; pipelineId: string }>()
    const [selectedDeploymentTemplate, setSeletedDeploymentTemplate] = useState<DeploymentTemplateOptions>()
    const [currentConfiguration, setCurrentConfiguration] = useState<DeploymentTemplateViaTargetId>()
    const [baseTemplateConfiguration, setBaseTemplateConfiguration] = useState<DeploymentTemplateViaTargetId>()

    const [codeEditorLoading, setCodeEditorLoading] = useState<boolean>(false)

    useEffect(() => {
        setLoader(true)

        if (deploymentTemplatesConfiguration && selectedDeploymentTemplate) {
            try {
                getDeploymentTemplateDiffId(appId, pipelineId, selectedDeploymentTemplate.value).then((response) => {
                    setCurrentConfiguration(response?.result)
                    setLoader(false)
                })
            } catch (err) {
                showError(err)
                setLoader(false)
            }
        }
    }, [selectedDeploymentTemplate])

    useEffect(() => {
        try {
            setCodeEditorLoading(true)
            if (deploymentTemplatesConfiguration && baseTemplateId) {
                getDeploymentTemplateDiffId(appId, pipelineId, baseTemplateId).then((response) => {
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
              setShowTemplate(false);
            }
        }
    },[showTemplate])

    return !deploymentTemplatesConfiguration && deploymentTemplatesConfiguration.length < 1 && !loader ? (
        <CDEmptyState />
    ) : (
        <>
            <CompareWithBaseConfig
                deploymentTemplatesConfiguration={deploymentTemplatesConfiguration}
                selectedDeploymentTemplate={selectedDeploymentTemplate}
                setSeletedDeploymentTemplate={setSeletedDeploymentTemplate}
                setShowTemplate={setShowTemplate}
                setBaseTemplateId={setBaseTemplateId}
                baseTemplateId={baseTemplateId}
                baseTimeStamp={baseTimeStamp}
            />
            <HistoryDiff
                currentConfiguration={currentConfiguration}
                loader={loader}
                codeEditorLoading={codeEditorLoading}
                baseTemplateConfiguration={baseTemplateConfiguration}
            />
        </>
    )
}

export default DeploymentHistoryDetailedView
