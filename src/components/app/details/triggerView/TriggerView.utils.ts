import { DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP } from '../../../../config'
import { showError } from '../../../common'
import { prepareHistoryData } from '../cdDetails/service'
import { DeploymentWithConfigType } from './types'

export const getDeployConfigOptions = () => {
    return [
        {
            label: 'Select configuration to deploy',
            options: [
                {
                    label: 'Last saved config',
                    value: DeploymentWithConfigType.LAST_SAVED_CONFIG,
                    infoText: 'Use last saved configuration to deploy',
                },
                {
                    label: 'Last deployed config',
                    value: DeploymentWithConfigType.LATEST_TRIGGER_CONFIG,
                    infoText: 'Retain currently deployed configuration',
                },
                {
                    label: 'Config deployed with selected image',
                    value: DeploymentWithConfigType.SPECIFIC_TRIGGER_CONFIG,
                    infoText: 'Use configuration deployed with selected image',
                },
            ],
        },
    ]
}

export const processResolvedPromise = (resp: { status: string; value?: any; reason?: any }) => {
    if (resp.status === 'fulfilled') {
        return {
            configMap:
                resp.value?.result?.configMap &&
                resp.value.result.configMap.map((_configMap) => {
                    prepareHistoryData(_configMap.config, DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP.CONFIGMAP.VALUE)
                }),
            deploymentTemplate:
                resp.value?.result?.deploymentTemplate &&
                prepareHistoryData(
                    resp.value.result.deploymentTemplate,
                    DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP.DEPLOYMENT_TEMPLATE.VALUE,
                ),
            pipelineStrategy:
                resp.value?.result?.pipelineStrategy &&
                prepareHistoryData(
                    resp.value.result.pipelineStrategy,
                    DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP.PIPELINE_STRATEGY.VALUE,
                ),
            secret:
                resp.value?.result?.secret &&
                resp.value.result.secret.map((_secret) => {
                    prepareHistoryData(_secret.config, DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP.SECRET.VALUE)
                }),
        }
    }

    showError(resp.reason)
    return null
}

export const checkForDiff = (configA, configB, diffKey): number => {
    try {
        let diffCount = 0,
            change
        const _configValuesA = diffKey === 'values' ? configA.values : JSON.parse(configA.codeEditorValue)
        const _configValuesB = diffKey === 'values' ? configB.values : JSON.parse(configB.codeEditorValue)
        for (const idx in _configValuesA) {
            if (typeof _configValuesA[idx] === 'object' && typeof _configValuesB[idx] === 'object') {
                change = checkForDiff(_configValuesA[idx], _configValuesB[idx], diffKey)
                if (Object.keys(change).length) {
                    diffCount += 1
                }
            } else if (_configValuesA[idx] !== _configValuesB[idx]) {
                diffCount += 1
            }
        }

        return diffCount
    } catch (err) {
        return 0
    }
}
