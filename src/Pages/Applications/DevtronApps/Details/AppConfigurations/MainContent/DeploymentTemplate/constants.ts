import { SelectPickerOptionType, TemplateListType } from '@devtron-labs/devtron-fe-common-lib'
import { CompareWithOptionGroupKindType } from './types'

export const BASE_DEPLOYMENT_TEMPLATE_ENV_ID = -1
export const PROTECT_BASE_DEPLOYMENT_TEMPLATE_IDENTIFIER_DTO = 'BaseDeploymentTemplate' as const

/**
 * Have'nt added base deployment template as it would be always there on top
 */
export const COMPARE_WITH_OPTIONS_ORDER: Record<string, CompareWithOptionGroupKindType[]> = {
    BASE_TEMPLATE: [TemplateListType.PublishedOnEnvironments, TemplateListType.DefaultVersions],
    OVERRIDDEN: [
        TemplateListType.DeployedOnSelfEnvironment,
        TemplateListType.PublishedOnEnvironments,
        TemplateListType.DefaultVersions,
    ],
}

export const COMPARE_WITH_BASE_TEMPLATE_OPTION: SelectPickerOptionType = {
    label: 'Base deployment template',
    value: BASE_DEPLOYMENT_TEMPLATE_ENV_ID,
}
