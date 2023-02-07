import React, { useEffect, useState } from 'react'
import { showError, Progressing } from '@devtron-labs/devtron-fe-common-lib'
import DeploymentHistoryHeader from './DeploymentHistoryHeader'
import { getDeploymentHistoryDetail, prepareHistoryData } from '../service'
import { useParams } from 'react-router'
import { DeploymentHistoryDetail } from '../cd.type'
import { DeploymentTemplateOptions, CompareViewDeploymentType, DeploymentHistoryParamsType } from './types'
import DeploymentHistorySidebar from './DeploymentHistorySidebar'
import DeploymentHistoryDiffView from './DeploymentHistoryDiffView'

export default function DeploymentHistoryDetailedView({
    setFullScreenView,
    deploymentHistoryList,
    setDeploymentHistoryList,
}: CompareViewDeploymentType) {
    const { appId, pipelineId, historyComponent, baseConfigurationId, historyComponentName } =
        useParams<DeploymentHistoryParamsType>()
    const [selectedDeploymentTemplate, setSelectedDeploymentTemplate] = useState<DeploymentTemplateOptions>()
    const [currentConfiguration, setCurrentConfiguration] = useState<DeploymentHistoryDetail>()
    const [baseTemplateConfiguration, setBaseTemplateConfiguration] = useState<DeploymentHistoryDetail>()
    const [previousConfigAvailable, setPreviousConfigAvailable] = useState<boolean>(true)
    const [loader, setLoader] = useState<boolean>(true)

    useEffect(() => {
        if (selectedDeploymentTemplate) {
            setLoader(true)
            if (selectedDeploymentTemplate.value === 'NA') {
                setLoader(false)
            } else {
                try {
                    getDeploymentHistoryDetail(
                        appId,
                        pipelineId,
                        selectedDeploymentTemplate.value,
                        historyComponent,
                        historyComponentName,
                    ).then((response) => {
                        setCurrentConfiguration(prepareHistoryData(response.result, historyComponent))
                        setLoader(false)
                    })
                } catch (err) {
                    showError(err)
                    setLoader(false)
                }
            }
        }
    }, [selectedDeploymentTemplate])

    useEffect(() => {
        try {
            setLoader(true)
            setSelectedDeploymentTemplate(null)
            setCurrentConfiguration(null)
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
            setLoader(false)
        }
    }, [baseConfigurationId, historyComponent, historyComponentName])

    useEffect(() => {
        //show template showing historical diff detailed view
        //in case if !showTemplate CD detail component being rendered
        setFullScreenView(true)

        return (): void => {
            setFullScreenView(false)
        }
    }, [])

    return (
        <>
            <DeploymentHistoryHeader
                selectedDeploymentTemplate={selectedDeploymentTemplate}
                setSelectedDeploymentTemplate={setSelectedDeploymentTemplate}
                setFullScreenView={setFullScreenView}
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
                        previousConfigAvailable={previousConfigAvailable}
                    />
                )}
            </div>
        </>
    )
}
