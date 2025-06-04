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

import { Fragment, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import {
    CiPipelineSourceTypeOption,
    InfoBlock,
    MaterialType,
    SelectPickerProps,
    SourceTypeMap,
} from '@devtron-labs/devtron-fe-common-lib'

import { URLS } from '@Config/routes'
import { SourceMaterialsSelector } from '@Pages/App/Configurations'

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
    const [materials, setMaterials] = useState<MaterialType[]>(initialMaterials)

    // HOOKS
    const location = useLocation()

    // CONSTANTS
    const isLinkedCI = location.pathname.includes('linked-ci')
    const isMultiGit = materials.length > 1

    useEffect(() => {
        const webhookTypeMaterial = initialMaterials.find((material) => material.type === SourceTypeMap.WEBHOOK)

        if (isMultiGit && webhookTypeMaterial) {
            setMaterials([webhookTypeMaterial])
        } else {
            setMaterials(initialMaterials)
        }
    }, [initialMaterials])

    // HANDLERS
    const onBlur = async () => {
        if (handleOnBlur) {
            await handleOnBlur()
        }
    }

    const getMenuListFooterConfig = (): SelectPickerProps['menuListFooterConfig'] => {
        const _isMultiGit = includeWebhookEvents && isMultiGit
        const _isSingleGit = includeWebhookEvents && !isMultiGit

        let value: SelectPickerProps['menuListFooterConfig']['value'] = null

        if (_isMultiGit) {
            value = (
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
            )
        } else if (_isSingleGit) {
            if (!materials[0].gitHostId) {
                value = (
                    <span>
                        Select git host for this git account to view all supported options.&nbsp;
                        <Link className="anchor" to={URLS.GLOBAL_CONFIG_GIT}>
                            Select git host
                        </Link>
                    </span>
                )
            } else if (materials[0].gitHostId > 0) {
                value = (
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
                )
            }
        }

        return {
            type: 'text',
            value,
        }
    }

    return (
        <div className="flexbox-col dc__gap-16">
            <h3 className="m-0 fs-14 lh-20 fw-6 cn-9">Select code source</h3>
            <div className="flexbox-col">
                {materials.map((material, index) => {
                    const mat = material
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
                                        inputId: `sourceType-${mat.name}`,
                                        label: 'Source Type',
                                        placeholder: 'Source Type',
                                        classNamePrefix: `select-build-pipeline-sourcetype-${index}`,
                                        options: !isMultiGit
                                            ? ciPipelineSourceTypeOptions
                                            : ciPipelineSourceTypeOptions.slice(0, 2),
                                        isDisabled: isLinkedCI || isMultiGitAndWebhook,
                                        value: selectedMaterial,
                                        onChange: (selected) => selectSourceType(selected, mat.gitMaterialId),
                                        menuListFooterConfig: getMenuListFooterConfig(),
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
                                <div className="mt-16">
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
        </div>
    )
}
