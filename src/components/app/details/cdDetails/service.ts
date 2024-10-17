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
import { DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP, EXTERNAL_TYPES, decode } from '@devtron-labs/devtron-fe-common-lib'
import { DeploymentHistoryDetail, DeploymentHistorySingleValue } from './cd.type'

export const prepareDeploymentTemplateData = (rawData): Record<string, DeploymentHistorySingleValue> => {
    const deploymentTemplateData = {}
    if (rawData['templateVersion']) {
        deploymentTemplateData['templateVersion'] = { displayName: 'Chart Version', value: rawData['templateVersion'] }
    }
    if (rawData['isAppMetricsEnabled'] || rawData['isAppMetricsEnabled'] === false) {
        deploymentTemplateData['isAppMetricsEnabled'] = {
            displayName: 'Application metrics',
            value: rawData['isAppMetricsEnabled'] ? 'Enabled' : 'Disabled',
        }
    }
    return deploymentTemplateData
}

export const preparePipelineConfigData = (rawData): Record<string, DeploymentHistorySingleValue> => {
    const pipelineConfigData = {}
    if (rawData['pipelineTriggerType']) {
        pipelineConfigData['pipelineTriggerType'] = {
            displayName: 'When do you want the pipeline to execute?',
            value: rawData['pipelineTriggerType'],
        }
    }
    if (rawData['strategy']) {
        pipelineConfigData['strategy'] = {
            displayName: 'Deployment strategy',
            value: rawData['strategy'],
        }
    }
    return pipelineConfigData
}

export const prepareConfigMapAndSecretData = (
    rawData,
    type: string,
    historyData: DeploymentHistoryDetail,
    skipDecode?: boolean,
): Record<string, DeploymentHistorySingleValue> => {
    const secretValues = {}

    if (rawData['external'] !== undefined) {
        if (rawData['external']) {
            if (rawData['externalType']) {
                secretValues['external'] = {
                    displayName: 'Data type',
                    value: EXTERNAL_TYPES[type][rawData['externalType']],
                }
            } else {
                secretValues['external'] = {
                    displayName: 'Data type',
                    value:
                        type === 'Secret'
                            ? EXTERNAL_TYPES[type]['KubernetesSecret']
                            : EXTERNAL_TYPES[type]['KubernetesConfigMap'],
                }
            }
        } else {
            secretValues['external'] = { displayName: 'Data type', value: EXTERNAL_TYPES[type][''] }
            if (type === 'Secret' && historyData.codeEditorValue.value) {
                const secretData = JSON.parse(historyData.codeEditorValue.value)
                let resolvedSecretData = {}
                if (historyData.codeEditorValue?.resolvedValue) {
                    resolvedSecretData = JSON.parse(historyData.codeEditorValue.resolvedValue)
                }
                const decodeNotRequired =
                    skipDecode || Object.keys(secretData).some((data) => secretData[data] === '*****') // Don't decode in case of non admin user

                historyData.codeEditorValue.value = decodeNotRequired
                    ? historyData.codeEditorValue.value
                    : JSON.stringify(decode(secretData))
                historyData.codeEditorValue.resolvedValue = decodeNotRequired
                    ? historyData.codeEditorValue.resolvedValue
                    : JSON.stringify(decode(resolvedSecretData))
            }
        }
    }
    if (rawData['type']) {
        let typeValue = 'Environment Variable'
        if (rawData['type'] === 'volume') {
            typeValue = 'Data Volume'
            if (rawData['mountPath'] || rawData['defaultMountPath']) {
                secretValues['mountPath'] = {
                    displayName: 'Volume mount path',
                    value: rawData['mountPath'] || rawData['defaultMountPath'],
                }
            }
            if (rawData['subPath']) {
                secretValues['subPath'] = { displayName: 'Set SubPath', value: 'Yes' }

                if (rawData.esoSubPath) {
                    secretValues['subPathValues'] = { displayName: 'SubPath', value: rawData.esoSubPath.join(', ') }
                } else if (
                    rawData.external &&
                    rawData.externalType === 'KubernetesSecret' &&
                    historyData.codeEditorValue?.resolvedValue
                ) {
                    const resolvedSecretData = JSON.parse(historyData.codeEditorValue.resolvedValue)
                    secretValues['subPathValues'] = {
                        displayName: 'SubPath',
                        value: Object.keys(resolvedSecretData).join(', '),
                    }
                }
            }
            if (rawData['filePermission']) {
                secretValues['filePermission'] = {
                    displayName: 'Set file permission',
                    value: rawData['filePermission'],
                }
            }
        }
        secretValues['type'] = {
            displayName: `How do you want to use this ${type}?`,
            value: typeValue,
        }
    }
    if (type === 'Secret') {
        if (rawData['roleARN']) {
            secretValues['roleARN'] = { displayName: 'Role ARN', value: rawData['roleARN'] }
        }
    }
    return secretValues
}

export const prepareHistoryData = (
    rawData,
    historyComponent: string,
    skipDecode?: boolean,
): DeploymentHistoryDetail => {
    let values
    const historyData = { codeEditorValue: rawData.codeEditorValue, values: {} }
    delete rawData.codeEditorValue
    if (historyComponent === DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP.DEPLOYMENT_TEMPLATE.VALUE) {
        values = prepareDeploymentTemplateData(rawData)
    } else if (historyComponent === DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP.PIPELINE_STRATEGY.VALUE) {
        values = preparePipelineConfigData(rawData)
    } else {
        values = prepareConfigMapAndSecretData(
            rawData,
            historyComponent === DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP.CONFIGMAP.VALUE
                ? DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP.CONFIGMAP.DISPLAY_NAME
                : DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP.SECRET.DISPLAY_NAME,
            historyData,
            skipDecode,
        )
    }
    historyData.values = values
    return historyData
}
