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

import { useState } from 'react'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    CIMaterialType,
    ComponentSizeType,
    CustomInput,
    InfoBlock,
    savePipeline,
    showError,
    SourceTypeMap,
    stopPropagation,
    VisibleModal2,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as Close } from '@Icons/ic-close.svg'
import { getGitProviderIcon } from '@Components/common'

import { REQUIRED_FIELD_MSG } from '../../../../config/constantMessaging'
import { BRANCH_REGEX_MODAL_MESSAGING } from './Constants'
import { BranchRegexModalProps, RegexValueType } from './types'

const renderRegexInfo = () => (
    <InfoBlock
        borderConfig={{
            top: false,
            right: false,
            left: false,
        }}
        borderRadiusConfig={{
            top: false,
            right: false,
            bottom: false,
            left: false,
        }}
        description="Commit will be fetched from the provided branch. This can be changed later."
    />
)

const BranchRegexModal = ({
    material,
    selectedCIPipeline,
    title,
    onCloseBranchRegexModal,
    appId,
    workflowId,
    handleReload,
}: BranchRegexModalProps) => {
    const getInitialRegexValue = () => {
        const initialValue: Record<number, RegexValueType> = {}
        material.forEach((mat) => {
            initialValue[mat.gitMaterialId] = {
                value: mat.value,
                isInvalid: mat.regex && !new RegExp(mat.regex).test(mat.value),
            }
        })
        return initialValue
    }

    const [isSavingRegexValue, setIsSavingRegexValue] = useState(false)
    const [regexValue, setRegexValue] = useState<Record<number, RegexValueType>>(getInitialRegexValue)

    const isRegexValueInvalid = (_cm): void => {
        const regExp = new RegExp(_cm.source.regex)
        const regVal = structuredClone(regexValue[_cm.gitMaterialId])
        if (!regExp.test(regVal.value)) {
            const _regexVal = {
                ...regexValue,
                [_cm.gitMaterialId]: { value: regVal.value, isInvalid: true },
            }
            setRegexValue(_regexVal)
        }
    }

    const handleSave = async () => {
        setIsSavingRegexValue(true)
        const payload: Parameters<typeof savePipeline>[0] = {
            appId: +appId,
            id: +workflowId,
            ciPipelineMaterial: [],
        }

        if (selectedCIPipeline?.ciMaterial?.length) {
            payload.ciPipelineMaterial = selectedCIPipeline.ciMaterial.map((_cm) => {
                const regVal = regexValue[_cm.gitMaterialId]
                let _updatedCM

                if (regVal?.value && _cm.source.regex) {
                    isRegexValueInvalid(_cm)

                    _updatedCM = {
                        ..._cm,
                        type: SourceTypeMap.BranchFixed,
                        value: regVal.value,
                        regex: _cm.source.regex,
                    }
                } else {
                    // Maintain the flattened object structure for unchanged values
                    _updatedCM = {
                        ..._cm,
                        ..._cm.source,
                    }
                }

                // Deleting as it's not required in the request payload
                delete _updatedCM.source

                return _updatedCM
            })
        }

        try {
            await savePipeline(payload, {
                isRegexMaterial: true,
                isTemplateView: false,
            })
            onCloseBranchRegexModal()
            handleReload()
        } catch (error) {
            showError(error)
        } finally {
            setIsSavingRegexValue(false)
        }
    }

    const getBranchRegexName = (gitMaterialId: number) => {
        const ciMaterial = selectedCIPipeline?.ciMaterial?.find(
            (_ciMaterial) =>
                _ciMaterial.gitMaterialId === gitMaterialId &&
                (_ciMaterial.source?.type === SourceTypeMap.BranchRegex || _ciMaterial.source.regex.length > 0),
        )

        return ciMaterial?.source?.regex || ''
    }

    const renderBranchRegexMaterialHeader = () => (
        <div className="flex dc__content-space py-12 px-20 dc__border-bottom">
            <div className="modal__title flex left fs-16 fw-6">
                <span className="dc__mxw-250 dc__truncate">{title}</span>&nbsp;/ Set branch
            </div>
            <Button
                dataTestId="regex-modal-header-close-button"
                onClick={onCloseBranchRegexModal}
                ariaLabel="close-button"
                variant={ButtonVariantType.borderLess}
                size={ComponentSizeType.small}
                showAriaLabelInTippy={false}
                icon={<Close />}
                style={ButtonStyleType.negativeGrey}
            />
        </div>
    )

    const getErrorMessage = (_regexValue) => {
        if (!_regexValue.value) {
            return REQUIRED_FIELD_MSG
        }
        if (_regexValue.isInvalid) {
            return BRANCH_REGEX_MODAL_MESSAGING.NoMatchingBranchName
        }
        return ''
    }

    const handleRegexInputValue = (id: number, value: string, mat: CIMaterialType) => {
        setRegexValue((prevState) => ({
            ...prevState,
            [id]: { value, isInvalid: mat.regex && !new RegExp(mat.regex).test(value) },
        }))
    }

    const renderBranchRegexContent = () => (
        <div className="ci-trigger__branch-regex-wrapper px-20 fs-13 dc__overflow-auto mxh-500 mh-200">
            <div className="bcn-2 flexbox-col dc__gap-1">
                {material.map((mat, index) => {
                    const _regexValue = regexValue[mat.gitMaterialId]

                    return (
                        mat.regex && (
                            <div className="flex left column dc__gap-6 pt-16 pb-16 bg__primary" key={`regex_${mat.id}`}>
                                <div className="flex left dc__gap-14">
                                    {getGitProviderIcon(mat.gitMaterialUrl, 'icon-dim-24')}
                                    <div>
                                        <div className="fw-6 lh-20">{mat.gitMaterialName}</div>
                                        <div className="dc__required-field">
                                            <span className="cn-7">{BRANCH_REGEX_MODAL_MESSAGING.SubTitle}</span>&nbsp;
                                            <span className="fw-6 cn-9">
                                                {getBranchRegexName(mat.gitMaterialId) || mat.regex}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="pl-36 w-100">
                                    <CustomInput
                                        name="name"
                                        data-testid={`branch-name-matching-regex-textbox${index}`}
                                        placeholder={BRANCH_REGEX_MODAL_MESSAGING.MatchingBranchNameRegex}
                                        value={_regexValue.value}
                                        onChange={(e) => handleRegexInputValue(mat.gitMaterialId, e.target.value, mat)}
                                        autoFocus={index === 0}
                                        error={getErrorMessage(_regexValue)}
                                    />
                                </div>
                            </div>
                        )
                    )
                })}
            </div>
        </div>
    )
    const renderMaterialRegexFooterNextButton = () => {
        const isDisabled = material.some((selectedMaterial) => {
            const _regexValue = regexValue[selectedMaterial.gitMaterialId]
            return _regexValue.isInvalid
        })

        return (
            <div className="trigger-modal__trigger flex right dc__gap-12 dc__position-rel-imp dc__bottom-radius-4">
                <Button
                    variant={ButtonVariantType.secondary}
                    text="Cancel"
                    dataTestId="branch-regex-save-close-button"
                    onClick={onCloseBranchRegexModal}
                    size={ComponentSizeType.medium}
                    style={ButtonStyleType.neutral}
                />
                <Button
                    variant={ButtonVariantType.primary}
                    text="Fetch commits"
                    dataTestId="branch-regex-save-next-button"
                    onClick={handleSave}
                    disabled={isDisabled || isSavingRegexValue}
                    isLoading={isSavingRegexValue}
                    size={ComponentSizeType.medium}
                />
            </div>
        )
    }

    return (
        <VisibleModal2 className="visible-modal__body">
            <div onClick={stopPropagation} className="ci-trigger__branch-regex-wrapper modal__body w-600 p-0 fs-13">
                {renderBranchRegexMaterialHeader()}
                {renderRegexInfo()}
                {renderBranchRegexContent()}
                {renderMaterialRegexFooterNextButton()}
            </div>
        </VisibleModal2>
    )
}

export default BranchRegexModal
