import { getIsRequestAborted, ModuleNameMap, ModuleStatus, showError } from '@devtron-labs/devtron-fe-common-lib'

import { getInitData } from '@Components/ciPipeline/ciPipeline.service'
import { getModuleInfo } from '@Components/v2/devtronStackManager/DevtronStackManager.service'

import { CreateCICDPipelineData } from './types'

export const getCICDPipelineInitData = async (appId: string | number): Promise<CreateCICDPipelineData> => {
    try {
        const [
            {
                result: { form, isBlobStorageConfigured },
            },
            {
                result: { status },
            },
        ] = await Promise.all([
            getInitData(appId.toString(), true, false, false),
            getModuleInfo(ModuleNameMap.SECURITY),
        ])

        return {
            ...form,
            isBlobStorageConfigured,
            isSecurityModuleInstalled: status === ModuleStatus.INSTALLED,
        }
    } catch (err) {
        if (!getIsRequestAborted(err)) {
            showError(err)
        }
        throw err
    }
}
