import {
    getIsRequestAborted,
    MaterialType,
    ModuleNameMap,
    showError,
    SourceTypeMap,
    TriggerType,
} from '@devtron-labs/devtron-fe-common-lib'

import { getModuleConfigured } from '@Components/app/details/appDetails/appDetails.service'
import { getPipelineMetaConfiguration } from '@Components/ciPipeline/ciPipeline.service'

import { CreateCICDPipelineData } from './types'

export const getCICDPipelineInitData = async (appId: string | number): Promise<CreateCICDPipelineData> => {
    try {
        const [{ result: pipelineMetaConfig }, { result: moduleConfig }] = await Promise.all([
            getPipelineMetaConfiguration(appId.toString(), true, true, false, false),
            getModuleConfigured(ModuleNameMap.BLOB_STORAGE),
        ])

        const scanEnabled =
            window._env_ && (window._env_.RECOMMEND_SECURITY_SCANNING || window._env_.FORCE_SECURITY_SCANNING)

        const isMultiGit = pipelineMetaConfig.materials.length > 1
        const webhookTypeMaterial = pipelineMetaConfig.materials.find(
            (material: MaterialType) => material.type === SourceTypeMap.WEBHOOK,
        )

        return {
            materials: isMultiGit && webhookTypeMaterial ? [webhookTypeMaterial] : pipelineMetaConfig.materials,
            gitHost: pipelineMetaConfig.gitHost,
            webhookEvents: pipelineMetaConfig.webhookEvents,
            ciPipelineSourceTypeOptions: pipelineMetaConfig.ciPipelineSourceTypeOptions,
            webhookConditionList: pipelineMetaConfig.webhookConditionList,
            triggerType: window._env_.DEFAULT_CI_TRIGGER_TYPE_MANUAL ? TriggerType.Manual : TriggerType.Auto,
            scanEnabled,
            ciPipelineEditable: true,
            workflowCacheConfig: pipelineMetaConfig.workflowCacheConfig ?? null,
            isBlobStorageConfigured: moduleConfig.enabled,
        }
    } catch (err) {
        if (!getIsRequestAborted(err)) {
            showError(err)
        }
        throw err
    }
}
