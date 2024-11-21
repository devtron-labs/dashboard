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

import {
    CustomInput,
    stopPropagation,
    InfoColourBar,
    SourceTypeMap,
    Button,
    ButtonVariantType,
    ComponentSizeType,
    ButtonStyleType,
    VisibleModal2,
} from '@devtron-labs/devtron-fe-common-lib'
import { getGitProviderIcon } from '@Components/common'
import { ReactComponent as Close } from '@Icons/ic-close.svg'
import { ReactComponent as LeftIcon } from '@Icons/ic-arrow-backward.svg'
import { ReactComponent as Info } from '@Icons/info-filled.svg'
import { BranchRegexModalProps } from './types'
import { BRANCH_REGEX_MODAL_MESSAGING } from './Constants'
import { REQUIRED_FIELD_MSG } from '../../../../config/constantMessaging'

const BranchRegexModal = ({
    material,
    selectedCIPipeline,
    title,
    isChangeBranchClicked,
    onClickNextButton,
    handleRegexInputValue,
    regexValue,
    onCloseBranchRegexModal,
    savingRegexValue,
}: BranchRegexModalProps) => {
    const getBranchRegexName = (gitMaterialId: number) => {
        const ciMaterial = selectedCIPipeline?.ciMaterial?.find(
            (_ciMaterial) =>
                _ciMaterial.gitMaterialId === gitMaterialId &&
                (_ciMaterial.source?.type === SourceTypeMap.BranchRegex || _ciMaterial.source.regex.length > 0),
        )

        return ciMaterial?.source?.regex || ''
    }
    console.log(regexValue)

    const renderBranchRegexMaterialHeader = () => (
        <div className="flex dc__content-space py-12 px-20 dc__border-bottom">
            <div className="modal__title flex left fs-16 fw-6">
                {isChangeBranchClicked && (
                    <Button
                        dataTestId="regex-modal-header-back-button"
                        onClick={onCloseBranchRegexModal}
                        ariaLabel="regex-back"
                        icon={<LeftIcon />}
                        variant={ButtonVariantType.borderLess}
                        size={ComponentSizeType.small}
                        showAriaLabelInTippy={false}
                        style={ButtonStyleType.neutral}
                    />
                )}
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

    const renderRegexInfo = () => (
        <div className="dc__border-bottom--b2">
            <InfoColourBar
                classname="info_bar dc__no-border-radius dc__no-border-imp"
                message="Commit will be fetched from the provided branch. This can be changed later."
                Icon={Info}
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

    const renderBranchRegexContent = () => (
        <div className="ci-trigger__branch-regex-wrapper px-20 py-16 fs-13 dc__overflow-scroll mxh-500 mh-200">
            {material?.map((mat, index) => {
                const _regexValue = regexValue[mat.gitMaterialId] || {}
                return (
                    mat.regex && (
                        <div
                            className={`flex left column dc__gap-6 pb-20 ${index === material.length - 1 ? '' : 'dc__border-bottom'}`}
                            key={`regex_${mat.id}`}
                        >
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
                            <div className="ml-36-imp w-100">
                                <CustomInput
                                    name="name"
                                    data-testid={`branch-name-matching-regex-textbox${index}`}
                                    tabIndex={index}
                                    placeholder={BRANCH_REGEX_MODAL_MESSAGING.MatchingBranchNameRegex}
                                    rootClassName="w-95-imp"
                                    value={_regexValue.value}
                                    onChange={(e) => handleRegexInputValue(mat.gitMaterialId, e.target.value, mat)}
                                    autoFocus
                                    error={getErrorMessage(_regexValue)}
                                />
                            </div>
                        </div>
                    )
                )
            })}
        </div>
    )
    const renderMaterialRegexFooterNextButton = () => {
        const isDisabled = material.some((selectedMaterial) => {
            const _regexValue = regexValue[selectedMaterial.gitMaterialId] || {}
            return _regexValue.isInvalid
        })

        return (
            <div className="trigger-modal__trigger flex right dc__gap-16 dc__position-rel-imp dc__bottom-radius-4">
                <Button
                    variant={ButtonVariantType.secondary}
                    text="Cancel"
                    dataTestId="branch-regex-save-next-button"
                    onClick={onCloseBranchRegexModal}
                    size={ComponentSizeType.medium}
                    style={ButtonStyleType.neutral}
                />
                <Button
                    variant={ButtonVariantType.primary}
                    text={`Fetch commits ${!isChangeBranchClicked ? '& Next' : ''}`}
                    dataTestId="branch-regex-save-next-button"
                    onClick={onClickNextButton}
                    disabled={isDisabled || savingRegexValue}
                    isLoading={savingRegexValue}
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
