import { TemplateListType } from '@devtron-labs/devtron-fe-common-lib'
import { CompareWithOptionGroupKindType } from '../types'

export const getCompareWithOptionsLabel = (
    environmentName: string,
    groupType?: CompareWithOptionGroupKindType,
): string => {
    switch (groupType) {
        case TemplateListType.DefaultVersions:
            return 'Default values'
        case TemplateListType.PublishedOnEnvironments:
            return 'Published on environments'
        case TemplateListType.DeployedOnSelfEnvironment:
            return `Prev. Deployments on ${environmentName}`
        default:
            return ''
    }
}
