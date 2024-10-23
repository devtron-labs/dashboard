import { PolicyKindType } from '@devtron-labs/devtron-fe-common-lib'

export interface OfflinePipelineModalAppViewProps {
    appId: number
    appName: string
    policyKind: PolicyKindType
    policyName: string
}
