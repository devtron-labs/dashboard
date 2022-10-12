import { DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP } from '../../../../config'
import { deepEqual, showError } from '../../../common'
import { DeploymentHistoryDetail } from '../cdDetails/cd.type'
import { prepareHistoryData } from '../cdDetails/service'
import { DeploymentWithConfigType, TriggerViewDeploymentConfigType } from './types'

export const DEPLOYMENT_CONFIGURATION_NAV_MAP = {
    DEPLOYMENT_TEMPLATE: {
        key: 'deploymentTemplate',
        displayName: 'Deployment Template',
        isMulti: false,
    },
    PIPELINE_STRATEGY: {
        key: 'pipelineStrategy',
        displayName: 'Pipeline Configuration',
        isMulti: false,
    },
    CONFIGMAP: {
        key: 'configMap',
        displayName: 'ConfigMaps',
        isMulti: true,
    },
    SECRET: {
        key: 'secret',
        displayName: 'Secrets',
        isMulti: true,
    },
}

export const SPECIFIC_TRIGGER_CONFIG_OPTION = {
    label: 'Config deployed with selected image',
    value: DeploymentWithConfigType.SPECIFIC_TRIGGER_CONFIG,
    infoText: 'Use configuration deployed with selected image',
}

export const getDeployConfigOptions = () => {
    return [
        {
            label: 'Select a configuration to deploy',
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
                SPECIFIC_TRIGGER_CONFIG_OPTION,
            ],
        },
    ]
}

export const processResolvedPromise = (resp: { status: string; value?: any; reason?: any }) => {
    if (resp.status === 'fulfilled') {
        return {
            configMap:
                resp.value?.result?.configMap &&
                resp.value.result.configMap.map((_configMap) => ({
                    componentName: _configMap.componentName,
                    ...prepareHistoryData(_configMap.config, DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP.CONFIGMAP.VALUE),
                })),
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
                resp.value.result.secret.map((_secret) => ({
                    componentName: _secret.componentName,
                    ...prepareHistoryData(_secret.config, DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP.SECRET.VALUE),
                })),
            wfrId: resp.value?.result?.wfrId,
        }
    }

    showError(resp.reason)
    return null
}

const compareConfigValues = (configA: DeploymentHistoryDetail, configB: DeploymentHistoryDetail): boolean => {
    if (!configA && !configB) {
        return false
    } else if (
        (configA && !configB) ||
        (!configA && configB) ||
        (configA.values && !configB.values) ||
        (!configA.values && configB.values) ||
        (configA.codeEditorValue?.value && !configB.codeEditorValue?.value) ||
        (!configA.codeEditorValue?.value && configB.codeEditorValue?.value)
    ) {
        return true
    } else if (!deepEqual(configA.values, configB.values)) {
        return true
    } else {
        try {
            const parsedEditorValueA = JSON.parse(configA.codeEditorValue.value)
            const parsedEditorValueB = JSON.parse(configB.codeEditorValue.value)

            if (!deepEqual(parsedEditorValueA, parsedEditorValueB)) {
                return true
            }
        } catch (err) {
            return false
        }
    }

    return false
}

const checkForDiffInArray = (
    configA: TriggerViewDeploymentConfigType,
    configB: TriggerViewDeploymentConfigType,
    key: string,
    diffForOptions: Record<string, boolean>,
): Record<string, boolean> => {
    const configOptions = []
    const configValueA = configA[key]
    const configValueB = configB[key]

    if (Array.isArray(configValueA)) {
        configValueA.forEach((navOption) => {
            configOptions.push(navOption['componentName'])
        })
    }

    if (Array.isArray(configValueB)) {
        configValueB.forEach((navOption) => {
            if (!configOptions.includes(navOption['componentName'])) {
                configOptions.push(navOption['componentName'])
            }
        })
    }

    for (const _cm of configOptions) {
        const _valueA = configValueA?.find((_config) => _config.componentName === _cm)
        const _valueB = configValueB?.find((_config) => _config.componentName === _cm)

        diffForOptions[_cm] = compareConfigValues(_valueA, _valueB)
    }

    return diffForOptions
}

export const checkForDiff = (configA: TriggerViewDeploymentConfigType, configB: TriggerViewDeploymentConfigType) => {
    if (!configA || !configB) {
        return null
    }

    let diffForOptions: Record<string, boolean> = {
        deploymentTemplate: compareConfigValues(configA.deploymentTemplate, configB.deploymentTemplate),
        pipelineStrategy: compareConfigValues(configA.pipelineStrategy, configB.pipelineStrategy),
    }

    if (configA.configMap?.length > 0 || configB.configMap?.length > 0) {
        diffForOptions = checkForDiffInArray(configA, configB, 'configMap', diffForOptions)
    }

    if (configA.secret?.length > 0 || configB.secret?.length > 0) {
        diffForOptions = checkForDiffInArray(configA, configB, 'secret', diffForOptions)
    }

    return diffForOptions
}
