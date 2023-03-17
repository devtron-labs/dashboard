import { MultiValue } from 'react-select'
import { ResponseType } from '../../../../../services/service.types'
import { OptionType } from '../../../../app/types'
import { CIConfigListType } from '../../../AppGroup.types'

export const filteredData: MultiValue<OptionType> = [
    {
        value: '1',
        label: 'test-1',
    },
    {
        value: '2',
        label: 'test-2',
    },
]

export const ciResult: CIConfigListType = {
    pipelineList: [
        {
            isManual: false,
            dockerArgs: new Map(),
            isExternal: false,
            parentCiPipeline: 0,
            parentAppId: 0,
            appId: '1',
            externalCiConfig: {
                id: 1,
                webhookUrl: '',
                payload: '',
                accessKey: 'string'
            },
            ciMaterial: [
                {
                    source: {
                        type: 'SOURCE_TYPE_BRANCH_FIXED',
                        value: 'main',
                        regex: '',
                    },
                    gitMaterialId: 1,
                    id: 1,
                    gitMaterialName: 'getting-started-nodejs',
                    isRegex: false,
                },
            ],
            name: 'ci-1-zxju',
            id: 1,
            active: true,
            linkedCount: 0,
            scanEnabled: false,
            isDockerConfigOverridden: false,
            appName: 'test-1',
        },
        {
            isManual: false,
            isExternal: false,
            parentCiPipeline: 0,
            parentAppId: 0,
            appId: '2',
            externalCiConfig: {
                id: 0,
                webhookUrl: '',
                payload: '',
                accessKey: '',
            },
            ciMaterial: [
                {
                    source: {
                        type: 'SOURCE_TYPE_BRANCH_FIXED',
                        value: 'main',
                        regex: '',
                    },
                    gitMaterialId: 2,
                    id: 2,
                    gitMaterialName: 'getting-started-nodejs',
                    isRegex: false,
                },
            ],
            name: 'ci-1-zxju',
            id: 2,
            active: true,
            linkedCount: 0,
            scanEnabled: false,
            isDockerConfigOverridden: false,
            appName: 'test-2',
        },
    ],
    securityModuleInstalled: false,
    blobStorageConfigured: false,
}

export async function mockCIList(): Promise<any> {
    const response = {
        code: 200,
        status: 'OK',
        result: ciResult,
    }
    return response
}
