import React, { useEffect, useState } from 'react'
import { Progressing, showError } from '../../../../common'
import DeploymentHistoryHeader from './DeploymentHistoryHeader'
import { getDeploymentHistoryDetail, prepareHistoryData } from '../service'
import { useParams } from 'react-router'
import {
    DeploymentTemplateOptions,
    CompareViewDeploymentType,
    DeploymentHistoryDetail,
    DeploymentHistoryParamsType,
} from '../cd.type'
import DeploymentHistorySidebar from './DeploymentHistorySidebar'
import DeploymentHistoryDiffView from './DeploymentHistoryDiffView'

export default function DeploymentHistoryDetailedView({
    showTemplate,
    setShowTemplate,
    loader,
    setLoader,
    deploymentHistoryList,
    setDeploymentHistoryList,
}: CompareViewDeploymentType) {
    const { appId, pipelineId, historyComponent, baseConfigurationId, historyComponentName } =
        useParams<DeploymentHistoryParamsType>()
    const [selectedDeploymentTemplate, setSelectedDeploymentTemplate] = useState<DeploymentTemplateOptions>()
    const [currentConfiguration, setCurrentConfiguration] = useState<DeploymentHistoryDetail>()
    const [baseTemplateConfiguration, setBaseTemplateConfiguration] = useState<DeploymentHistoryDetail>()
    const [codeEditorLoading, setCodeEditorLoading] = useState<boolean>(false)
    const [previousConfigAvailable, setPreviousConfigAvailable] = useState<boolean>(true)

    useEffect(() => {
        if (selectedDeploymentTemplate) {
            try {
                setLoader(true)
                getDeploymentHistoryDetail(
                    appId,
                    pipelineId,
                    selectedDeploymentTemplate.value,
                    historyComponent,
                    historyComponentName,
                ).then((response) => {
                    setCurrentConfiguration(prepareHistoryData(response.result, historyComponent))
                })
            } catch (err) {
                showError(err)
            } finally {
                setLoader(false)
            }
        }
    }, [selectedDeploymentTemplate])

    useEffect(() => {
        try {
            setCodeEditorLoading(true)
            getDeploymentHistoryDetail(
                appId,
                pipelineId,
                baseConfigurationId,
                historyComponent,
                historyComponentName,
            ).then((response) => {
                setBaseTemplateConfiguration(prepareHistoryData(response.result, historyComponent))
            })
        } catch (err) {
            showError(err)
        } finally {
            setCodeEditorLoading(false)
        }
    }, [baseConfigurationId, historyComponent, historyComponentName])

    useEffect(() => {
        //show template showing historical diff detailed view
        //in case if !shoowTemplate CD detail component being rendered

        if (!showTemplate) {
            setShowTemplate(true)
        }

        return (): void => {
            if (showTemplate) {
                setShowTemplate(false)
            }
        }
    }, [])

    return (
        <>
            <DeploymentHistoryHeader
                selectedDeploymentTemplate={selectedDeploymentTemplate}
                setSelectedDeploymentTemplate={setSelectedDeploymentTemplate}
                setShowTemplate={setShowTemplate}
                setLoader={setLoader}
                setPreviousConfigAvailable={setPreviousConfigAvailable}
            />

            <div className="historical-diff__container bcn-1">
                <DeploymentHistorySidebar
                    deploymentHistoryList={deploymentHistoryList}
                    setDeploymentHistoryList={setDeploymentHistoryList}
                />
                {loader ? (
                    <Progressing pageLoader />
                ) : (
                    <DeploymentHistoryDiffView
                        currentConfiguration={currentConfiguration}
                        baseTemplateConfiguration={baseTemplateConfiguration}
                        codeEditorLoading={codeEditorLoading}
                        previousConfigAvailable={previousConfigAvailable}
                    />
                )}
            </div>
        </>
    )
}
