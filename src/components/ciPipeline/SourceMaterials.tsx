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

import { Fragment, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { CiPipelineSourceTypeOption, InfoBlock, SourceTypeMap } from '@devtron-labs/devtron-fe-common-lib'

import { getCIPipelineBranchSelectorFooterConfig, SourceMaterialsSelector } from '@Pages/App/Configurations'

import { ConfigureWebhook } from './ConfigureWebhook'
import { SourceMaterialsProps } from './types'

export const SourceMaterials = ({
    materials: initialMaterials,
    includeWebhookEvents,
    canEditPipeline,
    ciPipelineSourceTypeOptions,
    handleOnBlur,
    handleSourceChange,
    selectSourceType,
    validationRules,
    webhookData,
}: SourceMaterialsProps) => {
    // STATES
    const [isProviderChanged, setProviderChanged] = useState(false)

    // HOOKS
    const location = useLocation()

    // CONSTANTS
    const isLinkedCI = location.pathname.includes('linked-ci')
    const isMultiGit = initialMaterials.length > 1
    const materials = useMemo(() => {
        const webhookTypeMaterial = initialMaterials.find((material) => material.type === SourceTypeMap.WEBHOOK)

        if (isMultiGit && webhookTypeMaterial) {
            return [webhookTypeMaterial]
        }

        return initialMaterials
    }, [isMultiGit, initialMaterials])

    // HANDLERS
    const onBlur = async () => {
        if (handleOnBlur) {
            await handleOnBlur()
        }
    }

    return (
        <div className="flexbox-col dc__gap-16">
            <h3 className="m-0 fs-14 lh-20 fw-6 cn-9">Select code source</h3>
            {materials.map((material, index) => {
                const mat = structuredClone(material)
                const isBranchRegex = mat.type === SourceTypeMap.BranchRegex || mat.isRegex
                const isBranchFixed = mat.type === SourceTypeMap.BranchFixed && !mat.isRegex
                const _selectedWebhookEvent =
                    mat.type === SourceTypeMap.WEBHOOK && mat.value && webhookData?.getSelectedWebhookEvent(mat)
                let selectedMaterial: CiPipelineSourceTypeOption

                if (includeWebhookEvents && mat.type === SourceTypeMap.WEBHOOK && !_selectedWebhookEvent) {
                    selectedMaterial = null

                    if (!isProviderChanged) {
                        mat.value = ''
                        setProviderChanged(true)
                    }
                } else if (ciPipelineSourceTypeOptions.length === 1) {
                    ;[selectedMaterial] = ciPipelineSourceTypeOptions
                } else {
                    selectedMaterial =
                        ciPipelineSourceTypeOptions.find((i) => {
                            if (i.value === SourceTypeMap.WEBHOOK) {
                                return i.isSelected
                            }

                            return isBranchRegex ? i.value === SourceTypeMap.BranchRegex : i.value === mat.type
                        }) || ciPipelineSourceTypeOptions[0]
                }
                const errorObj = validationRules?.sourceValue(isBranchRegex ? mat.regex : mat.value, isBranchRegex)
                const isMultiGitAndWebhook = isMultiGit && _selectedWebhookEvent

                return (
                    <Fragment key={`source-material-${mat.id}`}>
                        <div className="flexbox-col dc__gap-16">
                            <SourceMaterialsSelector
                                repoName={mat.name}
                                sourceTypePickerProps={{
                                    inputId: 'ci-pipeline-sourceType',
                                    label: 'Source Type',
                                    placeholder: 'Source Type',
                                    classNamePrefix: 'ci-pipeline-sourceType',
                                    isSearchable: false,
                                    options: !isMultiGit
                                        ? ciPipelineSourceTypeOptions
                                        : ciPipelineSourceTypeOptions.slice(0, 2),
                                    isDisabled: isLinkedCI || isMultiGitAndWebhook,
                                    value: selectedMaterial,
                                    onChange: (selected) => selectSourceType(selected, mat.gitMaterialId),
                                    menuListFooterConfig: getCIPipelineBranchSelectorFooterConfig(materials),
                                    getOptionValue: (option) => `${option.value}-${option.label}`,
                                    disabledTippyContent: isMultiGitAndWebhook
                                        ? `Cannot change source type ${_selectedWebhookEvent.name} for multi-git applications`
                                        : null,
                                }}
                                branchInputProps={{
                                    label: isBranchRegex ? 'Branch Regex' : 'Branch Name',
                                    name: isBranchRegex ? 'branchRegex' : 'branchName',
                                    hideInput: !isBranchRegex && !isBranchFixed,
                                    placeholder: isBranchRegex ? 'Eg. feature.*' : 'Eg. main',
                                    disabled: !handleSourceChange,
                                    value: isBranchRegex ? mat.regex : mat.value,
                                    onChange: (event) => {
                                        handleSourceChange(
                                            event,
                                            mat.gitMaterialId,
                                            isBranchRegex ? SourceTypeMap.BranchRegex : SourceTypeMap.BranchFixed,
                                        )
                                    },
                                    onBlur,
                                    error:
                                        errorObj &&
                                        !errorObj.isValid &&
                                        validationRules?.sourceValue(
                                            isBranchRegex ? mat.regex : mat.value,
                                            isBranchRegex,
                                        ).message,
                                    autoFocus: index === 0,
                                }}
                            />
                            {isBranchRegex && (
                                <InfoBlock description="Branch Regex allows you to easily switch between branches matching the configured regex before triggering the build pipeline." />
                            )}
                        </div>
                        {includeWebhookEvents && mat.type === SourceTypeMap.WEBHOOK && _selectedWebhookEvent && (
                            <div>
                                <ConfigureWebhook
                                    webhookConditionList={webhookData.webhookConditionList}
                                    gitHost={webhookData.gitHost}
                                    selectedWebhookEvent={_selectedWebhookEvent}
                                    addWebhookCondition={webhookData.addWebhookCondition}
                                    deleteWebhookCondition={webhookData.deleteWebhookCondition}
                                    onWebhookConditionSelectorChange={webhookData.onWebhookConditionSelectorChange}
                                    onWebhookConditionSelectorValueChange={
                                        webhookData.onWebhookConditionSelectorValueChange
                                    }
                                    canEditPipeline={canEditPipeline}
                                />
                            </div>
                        )}
                    </Fragment>
                )
            })}
        </div>
    )
}
