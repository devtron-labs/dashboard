/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ChangeEvent, Fragment } from 'react'

import {
    CiPipelineSourceTypeOption,
    ComponentSizeType,
    InfoBlock,
    MaterialType,
    SourceTypeMap,
} from '@devtron-labs/devtron-fe-common-lib'

import { createWebhookConditionList } from '@Components/ciPipeline/ciPipeline.service'
import { ValidationRules } from '@Components/ciPipeline/validationRules'

import { SourceMaterialsSelector } from '../SourceMaterialsSelector'
import { getCIPipelineBranchSelectorFooterConfig, getSelectedWebhookEvent } from '../utils'
import { ConfigureWebhookWrapper } from './ConfigureWebhookWrapper'
import { CIStepperContentProps } from './types'
import { getBranchValue, getSelectedMaterial } from './utils'

const validationRules = new ValidationRules()

export const CIStepperContent = ({
    ciCdPipeline,
    setCiCdPipeline,
    ciCdPipelineFormError,
    setCiCdPipelineFormError,
    isCreatingWorkflow,
    cdNodeCreateError,
}: CIStepperContentProps) => {
    const { materials, ciPipelineSourceTypeOptions, webhookEvents, gitHost, webhookConditionList, ciPipelineEditable } =
        ciCdPipeline.ci

    // CONSTANTS
    const isMultiGit = materials.length > 1
    const isFormDisabled = isCreatingWorkflow || !!cdNodeCreateError

    // HANDLERS
    /**
     * Returns a change event handler for branch input fields.
     *
     * @returns A change event handler function for the input field.
     */
    const handleBranchInputChange =
        (gitMaterialId: MaterialType['gitMaterialId'], isBranchRegex: boolean) =>
        (event: ChangeEvent<HTMLInputElement>) => {
            const inputValue = event.target.value

            // Clone the previous pipeline state to maintain immutability
            const { ci, cd } = structuredClone(ciCdPipeline)

            // Find the corresponding material by its ID
            const material = ci.materials.find((m) => m.gitMaterialId === gitMaterialId)

            if (material) {
                // Update either the regex or value field based on isBranchRegex
                if (isBranchRegex) {
                    material.regex = inputValue
                    material.value = ''
                } else {
                    material.value = inputValue
                    material.regex = ''
                }
            }

            setCiCdPipeline({ ci, cd })

            // Update form error state with validation message
            const updatedCiCdPipelineFormError = structuredClone(ciCdPipelineFormError)
            updatedCiCdPipelineFormError.ci[gitMaterialId] = {
                branch: validationRules.sourceValue(inputValue, isBranchRegex).message,
            }
            setCiCdPipelineFormError(updatedCiCdPipelineFormError)
        }

    /**
     * Returns a handler to update the Git material source type.
     *
     * Updates the selected source type (branch, regex, webhook, etc.) for the given Git material ID
     * and adjusts the pipeline state accordingly. Also handles special behavior for webhook types
     * by setting appropriate default values and conditions.
     *
     * @returns A function that handles the selected source type change.
     */
    const handleSourceTypeChange =
        (gitMaterialId: MaterialType['gitMaterialId']) => (selectedOption: CiPipelineSourceTypeOption) => {
            const { ci, cd } = structuredClone(ciCdPipeline)

            // Find the material index to update
            const materialIndex = ci.materials.findIndex((mat) => mat.gitMaterialId === gitMaterialId)

            if (materialIndex !== -1) {
                const currentMaterial = ci.materials[materialIndex]
                const newSourceType = selectedOption.value
                const isRegexType = newSourceType === SourceTypeMap.BranchRegex

                // Determine if the previously selected source was a webhook
                const wasWebhookPreviously =
                    ci.ciPipelineSourceTypeOptions.find((opt) => opt.isSelected)?.value === SourceTypeMap.WEBHOOK

                // Update material with new type and adjusted values
                ci.materials[materialIndex] = {
                    ...currentMaterial,
                    type: newSourceType,
                    isRegex: isRegexType,
                    regex: isRegexType ? currentMaterial.regex : '',
                    value: wasWebhookPreviously && newSourceType !== SourceTypeMap.WEBHOOK ? '' : currentMaterial.value,
                }
            }

            // Update the selected option in the source type dropdown
            ci.ciPipelineSourceTypeOptions = ci.ciPipelineSourceTypeOptions.map((option) => ({
                ...option,
                isSelected: option.label === selectedOption.label,
            }))

            // If the selected type is a webhook, initialize its data and condition list
            if (selectedOption.isWebhook) {
                const material = ci.materials[0]
                const selectedWebhook = ci.webhookEvents.find((event) => event.name === selectedOption.label)

                const conditionMap: Record<number, string> = (selectedWebhook?.selectors ?? []).reduce(
                    (acc, selector) => {
                        if (selector.fixValue) {
                            acc[selector.id] = selector.fixValue
                        }

                        return acc
                    },
                    {},
                )

                material.value = JSON.stringify({
                    eventId: selectedWebhook?.id,
                    condition: conditionMap,
                })

                ci.webhookConditionList = createWebhookConditionList(material.value)
            }

            setCiCdPipeline({ ci, cd })
        }

    return (
        <div className="flexbox-col dc__gap-20">
            {!!cdNodeCreateError && (
                <InfoBlock variant="success" description="Build pipeline is created" size={ComponentSizeType.medium} />
            )}
            {materials.map((material, index) => {
                const { id, name, type, isRegex, value, regex, gitMaterialId } = material

                const isBranchRegex = type === SourceTypeMap.BranchRegex || isRegex
                const isBranchFixed = type === SourceTypeMap.BranchFixed && !isRegex

                const selectedWebhookEvent =
                    type === SourceTypeMap.WEBHOOK && value && getSelectedWebhookEvent(material, webhookEvents)

                const isMultiGitAndWebhook = isMultiGit && !!selectedWebhookEvent

                const selectedMaterial = getSelectedMaterial({
                    isBranchRegex,
                    selectedWebhookEvent,
                    type,
                    ciPipelineSourceTypeOptions,
                })

                return (
                    <Fragment key={id}>
                        <SourceMaterialsSelector
                            repoName={name}
                            sourceTypePickerProps={{
                                inputId: 'ci-pipeline-sourceType',
                                label: 'Source Type',
                                placeholder: 'Source Type',
                                classNamePrefix: 'ci-pipeline-sourceType',
                                isSearchable: false,
                                options: !isMultiGit
                                    ? ciPipelineSourceTypeOptions
                                    : ciPipelineSourceTypeOptions.slice(0, 2),
                                value: selectedMaterial,
                                onChange: handleSourceTypeChange(gitMaterialId),
                                getOptionValue: (option) => `${option.value}-${option.label}`,
                                menuListFooterConfig: getCIPipelineBranchSelectorFooterConfig(materials),
                                isDisabled: isFormDisabled || isMultiGitAndWebhook,
                                disabledTippyContent: isMultiGitAndWebhook
                                    ? `Cannot change source type ${selectedWebhookEvent.name} for multi-git applications`
                                    : null,
                            }}
                            branchInputProps={{
                                label: isBranchRegex ? 'Branch Regex' : 'Branch Name',
                                name: isBranchRegex ? 'branchRegex' : 'branchName',
                                hideInput: !isBranchRegex && !isBranchFixed,
                                placeholder: isBranchRegex ? 'Eg. feature.*' : 'Eg. main',
                                value: getBranchValue({
                                    isBranchRegex,
                                    selectedMaterial,
                                    value,
                                    regex,
                                }),
                                disabled: isFormDisabled,
                                onChange: handleBranchInputChange(gitMaterialId, isBranchRegex),
                                error: ciCdPipelineFormError.ci[gitMaterialId]?.branch ?? null,
                                autoFocus: index === 0,
                            }}
                        />
                        {type === SourceTypeMap.WEBHOOK && selectedWebhookEvent && (
                            <ConfigureWebhookWrapper
                                webhookConditionList={webhookConditionList}
                                selectedWebhookEvent={selectedWebhookEvent}
                                gitHost={gitHost}
                                ciPipelineEditable={ciPipelineEditable}
                                setCiCdPipeline={setCiCdPipeline}
                            />
                        )}
                    </Fragment>
                )
            })}
        </div>
    )
}
