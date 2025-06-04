import { Link } from 'react-router-dom'

import { SelectPickerProps, SourceTypeMap } from '@devtron-labs/devtron-fe-common-lib'

import { URLS } from '@Config/routes'

import { CreateCICDPipelineData } from './types'

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
