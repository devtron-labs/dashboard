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

import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { SourceTypeMap, URLS } from '../../config'
import git from '../../assets/icons/git/git.svg'
import { ReactComponent as Info } from '../../assets/icons/ic-info-outline-purple.svg'
import { ConfigureWebhook } from './ConfigureWebhook'
import { SourceMaterialsProps } from './types'
import { ReactComponent as InfoIcon } from '../../assets/icons/info-filled.svg'
import {
    CustomInput,
    InfoColourBar,
    ConditionalWrap,
    SelectPicker,
    ComponentSizeType,
} from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'

export const SourceMaterials: React.FC<SourceMaterialsProps> = (props) => {
    const [isProviderChanged, setProviderChanged] = useState(false)
    const isMultiGit = props.materials.length > 1
    const location = useLocation()
    const isLinkedCI = location.pathname.includes('linked-ci')
    let _materials = props.materials
    const _webhookTypeMaterial = _materials.find((_material) => _material.type == SourceTypeMap.WEBHOOK)

    if (isMultiGit && _webhookTypeMaterial) {
        _materials = []
        _materials.push(_webhookTypeMaterial)
    }

    const renderInfoBarForMultiGitWebhook = () => {
        return (
            <InfoColourBar
                message="If you need webhook based CI for apps with multiple code sources,"
                classname="info_bar question-bar ml-8 mb-8 mr-8"
                Icon={Info}
                redirectLink="https://github.com/devtron-labs/devtron/issues"
                linkText="Create a github issue"
            />
        )
    }

    const renderInfoBarForSingleGitWebhookAndNoHostUrl = () => {
        return (
            <InfoColourBar
                message="Select git host for this git account to view all supported options."
                classname="info_bar question-bar ml-8 mb-8 mr-8"
                Icon={Info}
                redirectLink={URLS.GLOBAL_CONFIG_GIT}
                linkText="Select git host"
                internalLink
            />
        )
    }

    const renderInfoBarForSingleGitWebhook = () => {
        return (
            <InfoColourBar
                message="If you want to trigger CI using any other mechanism,"
                classname="info_bar question-bar ml-8 mb-8 mr-8"
                Icon={Info}
                redirectLink="https://github.com/devtron-labs/devtron/issues"
                linkText="Create a github issue"
            />
        )
    }

    const renderSourceMaterialDropdownFooter = (): JSX.Element => {
        const _isMultiGit = props.includeWebhookEvents && isMultiGit
        const _isSingleGit = props.includeWebhookEvents && !isMultiGit
        return (
            <>
                {_isMultiGit && renderInfoBarForMultiGitWebhook()}
                {_isSingleGit && !_materials[0].gitHostId && renderInfoBarForSingleGitWebhookAndNoHostUrl()}
                {_isSingleGit && _materials[0].gitHostId > 0 && renderInfoBarForSingleGitWebhook()}
            </>
        )
    }

    async function onBlur() {
        if (props.handleOnBlur) {
            await props.handleOnBlur()
        }
    }

    return (
        <>
            <p className="cn-9 fw-6 fs-14 lh-1-43 mb-18">Select code source</p>
            {_materials.map((mat, index) => {
                const isBranchRegex = mat.type === SourceTypeMap.BranchRegex || mat.isRegex
                const isBranchFixed = mat.type === SourceTypeMap.BranchFixed && !mat.isRegex
                const _selectedWebhookEvent =
                    mat.type === SourceTypeMap.WEBHOOK && mat.value && props.webhookData?.getSelectedWebhookEvent(mat)
                let selectedMaterial

                if (props.includeWebhookEvents && mat.type === SourceTypeMap.WEBHOOK && !_selectedWebhookEvent) {
                    selectedMaterial = null

                    if (!isProviderChanged) {
                        mat.value = ''
                        setProviderChanged(true)
                    }
                } else if (props.ciPipelineSourceTypeOptions.length === 1) {
                    selectedMaterial = props.ciPipelineSourceTypeOptions[0]
                } else {
                    selectedMaterial =
                        props.ciPipelineSourceTypeOptions.find((i) =>
                            i.value === SourceTypeMap.WEBHOOK
                                ? i.isSelected
                                : isBranchRegex
                                  ? i.value === SourceTypeMap.BranchRegex
                                  : i.value === mat.type,
                        ) || props.ciPipelineSourceTypeOptions[0]
                }
                const errorObj = props.validationRules?.sourceValue(
                    isBranchRegex ? mat.regex : mat.value,
                    isBranchRegex,
                )
                const isMultiGitAndWebhook = isMultiGit && _selectedWebhookEvent
                return (
                    <div key={`source-material-${index}`}>
                        <div className="mt-20" key={mat.gitMaterialId}>
                            <div className="mb-10 fs-14 cn-9 fw-5 lh-1-43">
                                <p className="m-0">
                                    <img src={git} alt="" className="ci-artifact__icon" />
                                    {mat.name}
                                </p>
                            </div>
                            <div className="mt-16 flex left">
                                <ConditionalWrap
                                    condition={isMultiGitAndWebhook}
                                    wrap={(children) => (
                                        <Tippy
                                            className="default-tt"
                                            arrow={false}
                                            placement="top"
                                            content={`Cannot change source type ${_selectedWebhookEvent.name} for multi-git applications`}
                                            interactive
                                        >
                                            {children}
                                        </Tippy>
                                    )}
                                >
                                    <div className="w-50 mr-8 ">
                                        <SelectPicker
                                            inputId="sourceType"
                                            label="Source Type"
                                            required
                                            placeholder="Source Type"
                                            classNamePrefix={`select-build-pipeline-sourcetype-${index}`}
                                            isSearchable={false}
                                            options={
                                                !isMultiGit
                                                    ? props.ciPipelineSourceTypeOptions
                                                    : props.ciPipelineSourceTypeOptions.slice(0, 2)
                                            }
                                            isDisabled={isLinkedCI || (isMultiGit && _selectedWebhookEvent)}
                                            value={selectedMaterial}
                                            closeMenuOnSelect
                                            onChange={(selected) =>
                                                props?.selectSourceType(selected, mat.gitMaterialId)
                                            }
                                            renderMenuListFooter={renderSourceMaterialDropdownFooter}
                                            isClearable={false}
                                            size={ComponentSizeType.large}
                                            getOptionValue={(option) => `${option.value}-${option.label}`}
                                        />

                                        <div className="h-24" />
                                    </div>
                                </ConditionalWrap>

                                {isBranchFixed && (
                                    <div className="w-50 ml-8 left">
                                        <CustomInput
                                            label="Branch Name"
                                            name="branchName"
                                            placeholder="Eg. main"
                                            type="text"
                                            data-testid={`build-pipeline-branch-name-textbox${index}`}
                                            disabled={!props.handleSourceChange}
                                            value={mat.value}
                                            onChange={(event) => {
                                                props?.handleSourceChange(
                                                    event,
                                                    mat.gitMaterialId,
                                                    SourceTypeMap.BranchFixed,
                                                )
                                            }}
                                            onBlur={onBlur}
                                            required
                                            error={
                                                errorObj &&
                                                !errorObj.isValid &&
                                                props.validationRules?.sourceValue(_materials[index].value, false)
                                                    .message
                                            }
                                            autoFocus
                                        />
                                        {/* Note: In case Error is not shown added height */}
                                        {(errorObj?.isValid || isLinkedCI) && <div className="h-24" />}
                                    </div>
                                )}

                                {isBranchRegex && (
                                    <div className="w-50 ml-8">
                                        <CustomInput
                                            label="Branch Regex"
                                            name="branchRegex"
                                            placeholder="Eg. feature.*"
                                            type="text"
                                            data-testid={`build-pipeline-branch-name-textbox${index}`}
                                            disabled={!props.handleSourceChange}
                                            value={mat.regex}
                                            onChange={(event) => {
                                                props?.handleSourceChange(
                                                    event,
                                                    mat.gitMaterialId,
                                                    SourceTypeMap.BranchRegex,
                                                )
                                            }}
                                            error={
                                                errorObj &&
                                                !errorObj.isValid &&
                                                props.validationRules?.sourceValue(_materials[index].regex, true)
                                                    .message
                                            }
                                        />
                                        {/* Note: In case Error is not shown */}
                                        {errorObj?.isValid && <div className="h-24" />}
                                    </div>
                                )}
                            </div>
                        </div>
                        {isBranchRegex && (
                            <div className={`${errorObj && !errorObj.isValid ? 'mt-16' : ''}`}>
                                <InfoColourBar
                                    message="Branch Regex allows you to easily switch between branches matching the configured regex before triggering the build pipeline."
                                    classname="info_bar"
                                    Icon={InfoIcon}
                                />
                            </div>
                        )}

                        {props.includeWebhookEvents && mat.type == SourceTypeMap.WEBHOOK && _selectedWebhookEvent && (
                            <ConfigureWebhook
                                webhookConditionList={props.webhookData.webhookConditionList}
                                gitHost={props.webhookData.gitHost}
                                selectedWebhookEvent={_selectedWebhookEvent}
                                addWebhookCondition={props.webhookData.addWebhookCondition}
                                deleteWebhookCondition={props.webhookData.deleteWebhookCondition}
                                onWebhookConditionSelectorChange={props.webhookData.onWebhookConditionSelectorChange}
                                onWebhookConditionSelectorValueChange={
                                    props.webhookData.onWebhookConditionSelectorValueChange
                                }
                                canEditPipeline={props.canEditPipeline}
                            />
                        )}
                    </div>
                )
            })}
        </>
    )
}
