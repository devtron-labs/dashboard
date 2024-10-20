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

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { showError, Progressing } from '../../../../Common'
import DeploymentHistoryHeader from './DeploymentHistoryHeader'
import DeploymentHistoryDiffView from './DeploymentHistoryDiffView'
import DeploymentHistorySidebar from './DeploymentHistorySidebar'
import { CompareViewDeploymentType, DeploymentHistoryParamsType, DeploymentTemplateOptions } from './types'
import { DeploymentHistoryDetail } from '../types'
import { getDeploymentHistoryDetail, prepareHistoryData } from '../service'

const DeploymentHistoryDetailedView = ({
    setFullScreenView,
    deploymentHistoryList,
    setDeploymentHistoryList,
    renderRunSource,
    resourceId,
}: CompareViewDeploymentType) => {
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
                    // eslint-disable-next-line @typescript-eslint/no-floating-promises
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
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
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
        // show template showing historical diff detailed view
        // in case if !showTemplate CD detail component being rendered
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
                renderRunSource={renderRunSource}
                resourceId={resourceId}
            />

            <div className="historical-diff__container bcn-1">
                <DeploymentHistorySidebar
                    deploymentHistoryList={deploymentHistoryList}
                    setDeploymentHistoryList={setDeploymentHistoryList}
                />
                {loader ? (
                    <Progressing pageLoader />
                ) : (
                    <div className="dc__overflow-scroll">
                        <DeploymentHistoryDiffView
                            currentConfiguration={currentConfiguration}
                            baseTemplateConfiguration={baseTemplateConfiguration}
                            previousConfigAvailable={previousConfigAvailable}
                        />
                    </div>
                )}
            </div>
        </>
    )
}

export default DeploymentHistoryDetailedView
