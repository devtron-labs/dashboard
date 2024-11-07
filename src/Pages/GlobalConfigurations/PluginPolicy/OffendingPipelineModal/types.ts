import { PolicyKindType } from '@devtron-labs/devtron-fe-common-lib'

export interface OffendingPipelineModalAppViewProps {
    appId: number
    appName: string
    policyKind: PolicyKindType
    policyName: string
}
