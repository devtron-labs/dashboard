import { Link } from 'react-router-dom'

import { SelectPickerProps, SourceTypeMap } from '@devtron-labs/devtron-fe-common-lib'

import { ValidationRules } from '@Components/ciPipeline/validationRules'
import { URLS } from '@Config/routes'

import { CreateCICDPipelineData, CreateCICDPipelineFormError } from './types'

export const getCiCdPipelineDefaultState = (): CreateCICDPipelineData => ({
    name: '',
    materials: [],
    gitHost: null,
    webhookEvents: [],
    ciPipelineSourceTypeOptions: [],
    webhookConditionList: [],
    triggerType: '',
    scanEnabled: false,
    workflowCacheConfig: null,
    isBlobStorageConfigured: false,
    isSecurityModuleInstalled: false,
})

export const getSelectedWebhookEvent = (
    material: CreateCICDPipelineData['materials'][number],
    webhookEvents: CreateCICDPipelineData['webhookEvents'],
) => {
    const selectedEventId = JSON.parse(material.value)?.eventId
    return selectedEventId ? webhookEvents.find(({ id }) => id === selectedEventId) : null
}

export const getSelectedMaterial = ({
    type,
    selectedWebhookEvent,
    ciPipelineSourceTypeOptions,
    isBranchRegex,
}: Required<
    Pick<CreateCICDPipelineData['materials'][number], 'type'> &
        Pick<CreateCICDPipelineData, 'ciPipelineSourceTypeOptions'> & {
            selectedWebhookEvent: CreateCICDPipelineData['webhookEvents'][number]
            isBranchRegex: boolean
        }
>) => {
    if (type === SourceTypeMap.WEBHOOK && !selectedWebhookEvent) {
        return null
    }

    if (ciPipelineSourceTypeOptions.length === 1) {
        return ciPipelineSourceTypeOptions[0]
    }

    return (
        ciPipelineSourceTypeOptions.find((i) => {
            if (i.value === SourceTypeMap.WEBHOOK) {
                return i.isSelected
            }

            return isBranchRegex ? i.value === SourceTypeMap.BranchRegex : i.value === type
        }) || ciPipelineSourceTypeOptions[0]
    )
}

export const getBranchValue = ({
    selectedMaterial,
    isBranchRegex,
    regex,
    value,
}: Required<
    Pick<CreateCICDPipelineData['materials'][number], 'regex' | 'value'> & {
        selectedMaterial: CreateCICDPipelineData['ciPipelineSourceTypeOptions'][number]
        isBranchRegex: boolean
    }
>) => {
    if (selectedMaterial) {
        return isBranchRegex ? regex : value
    }

    return ''
}

export const validateCreateCICDPipelineData = (ciCdPipeline: CreateCICDPipelineData) => {
    const copyPipelineData = structuredClone(ciCdPipeline)
    const validationRules = new ValidationRules()

    let isValid = true

    const ciCdPipelineFormError = copyPipelineData.materials.reduce<CreateCICDPipelineFormError>(
        (acc, { gitMaterialId, type, regex, value }) => {
            if (type === SourceTypeMap.BranchFixed || type === SourceTypeMap.BranchRegex) {
                const isBranchRegex = type === SourceTypeMap.BranchRegex
                const inputValue = isBranchRegex ? regex : value

                const errorObj = validationRules.sourceValue(inputValue, isBranchRegex)
                acc[gitMaterialId] = {
                    branch: errorObj.message,
                }

                if (isValid) {
                    isValid = errorObj.isValid
                }
            }

            return acc
        },
        {},
    )

    return { isValid, ciCdPipelineFormError }
}

/**
 * Generates the payload for saving CI pipeline materials.
 *
 * ## Behavior:
 * - In **multi-git pipeline scenarios** (i.e., more than one material),
 *   if the user selects a **Webhook-based trigger** like "Pull Request" or "Tag Creation",
 *   we **only send the webhook material** and ignore the others.
 * - If there's only one material, return it as-is.
 *
 * ## Why:
 * Webhook triggers like PR or Tag creation are specific to a single git repository.
 * Sending multiple repositories in this context would be invalid.
 *
 * @param materials - Array of source materials for the CI pipeline configuration.
 * @returns A filtered array containing only the webhook material in multi-git + webhook scenarios,
 *          or the original array if it's single-material or not a webhook-based trigger.
 */
export const getSaveCIPipelineMaterialsPayload = (
    materials: CreateCICDPipelineData['materials'],
): CreateCICDPipelineData['materials'] => {
    if (materials.length > 1) {
        const webhookMaterial = materials.find((m) => m.type === SourceTypeMap.WEBHOOK)
        return webhookMaterial ? [webhookMaterial] : []
    }
    return materials
}

export const getMenuListFooterConfig = (
    materials: CreateCICDPipelineData['materials'],
): SelectPickerProps['menuListFooterConfig'] => {
    if (!materials) {
        return null
    }

    const isMultiGit = materials.length > 1
    const type: SelectPickerProps['menuListFooterConfig']['type'] = 'text'

    if (isMultiGit) {
        return {
            type,
            value: (
                <span>
                    If you need webhook based CI for apps with multiple code sources,&nbsp;
                    <a
                        className="anchor"
                        rel="noreferrer"
                        href="https://github.com/devtron-labs/devtron/issues"
                        target="_blank"
                    >
                        Create a GitHub issue
                    </a>
                </span>
            ),
        }
    }

    if (!materials[0].gitHostId) {
        return {
            type,
            value: (
                <span>
                    Select git host for this git account to view all supported options.&nbsp;
                    <Link className="anchor" to={URLS.GLOBAL_CONFIG_GIT}>
                        Select git host
                    </Link>
                </span>
            ),
        }
    }

    if (materials[0].gitHostId > 0) {
        return {
            type,
            value: (
                <span>
                    If you want to trigger CI using any other mechanism,&nbsp;
                    <a
                        className="anchor"
                        rel="noreferrer"
                        href="https://github.com/devtron-labs/devtron/issues"
                        target="_blank"
                    >
                        Create a GitHub issue
                    </a>
                </span>
            ),
        }
    }

    return {
        type,
        value: null,
    }
}
