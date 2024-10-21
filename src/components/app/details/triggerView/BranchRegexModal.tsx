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

import { useContext } from 'react'
import {
    CustomInput,
    ButtonWithLoader,
    VisibleModal,
    stopPropagation,
    InfoColourBar,
    SourceTypeMap,
} from '@devtron-labs/devtron-fe-common-lib'
import { getGitProviderIcon } from '@Components/common'
import { ReactComponent as Close } from '@Icons/ic-close.svg'
import { ReactComponent as LeftIcon } from '@Icons/ic-arrow-backward.svg'
import { ReactComponent as Info } from '@Icons/info-filled.svg'
import { BranchRegexModalProps } from './types'
import { TriggerViewContext } from './config'
import { BRANCH_REGEX_MODAL_MESSAGING } from './Constants'
import { REQUIRED_FIELD_MSG } from '../../../../config/constantMessaging'

const BranchRegexModal = ({
    material,
    selectedCIPipeline,
    showWebhookModal,
    title,
    isChangeBranchClicked,
    onClickNextButton,
    handleRegexInputValue,
    regexValue,
    onCloseBranchRegexModal,
    hideHeaderFooter,
    savingRegexValue,
}: BranchRegexModalProps) => {
    const triggerViewContext = useContext(TriggerViewContext)

    const getBranchRegexName = (gitMaterialId: number): string => {
        const ciMaterial = selectedCIPipeline?.ciMaterial?.find(
            (_ciMaterial) =>
                _ciMaterial.gitMaterialId === gitMaterialId && _ciMaterial.source?.type === SourceTypeMap.BranchRegex,
        )
        return ciMaterial?.source?.regex || ''
    }

    const _closeCIModal = () => {
        triggerViewContext.closeCIModal()
    }

    const onClickBackArrow = (): void => {
        onCloseBranchRegexModal()
    }

    const renderBranchRegexMaterialHeader = () => {
        if (hideHeaderFooter) {
            return null
        }
        return (
            <div className="flex dc__content-space py-16 px-20 dc__border-bottom">
                <h1 className="modal__title flex left dc__gap-12 fs-16 fw-6">
                    {isChangeBranchClicked && (
                        <button
                            type="button"
                            aria-label="back"
                            onClick={onClickBackArrow}
                            className="dc__unset-button-styles flex"
                        >
                            <LeftIcon className="rotate icon-dim-16 cursor" />
                        </button>
                    )}
                    {title}
                </h1>
                <button type="button" className="dc__transparent" onClick={_closeCIModal} aria-label="close-button">
                    <Close />
                </button>
            </div>
        )
    }

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
        <div className="ci-trigger__branch-regex-wrapper px-20 fs-13 dc__overflow-scroll mxh-400">
            {material?.map((mat, index) => {
                const _regexValue = regexValue[mat.gitMaterialId] || {}
                return (
                    mat.regex && (
                        <div className="dc__border-bottom py-20" key={`regex_${mat.id}`}>
                            <div className="flex left dc__gap-14">
                                {getGitProviderIcon(mat.gitMaterialUrl, 'icon-dim-24')}
                                <span>
                                    <div className="fw-6 fs-14">{mat.gitMaterialName}</div>
                                    <div className="pb-12">
                                        {BRANCH_REGEX_MODAL_MESSAGING.MatchingBranchName}&nbsp;
                                        <span className="fw-6">
                                            {getBranchRegexName(mat.gitMaterialId) || mat.regex}
                                        </span>
                                    </div>
                                </span>
                            </div>
                            <div className="ml-36-imp">
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
        let _isDisabled = true

        for (let index = 0; index < material.length; index++) {
            const selectedMaterial = material[index]
            const _regexValue = regexValue[selectedMaterial.gitMaterialId] || {}
            _isDisabled = _regexValue.isInvalid
            if (_isDisabled) {
                break
            }
        }

        return (
            <div className="trigger-modal__trigger flex right">
                <ButtonWithLoader
                    dataTestId="branch-regex-save-next-button"
                    rootClassName="cta flex"
                    onClick={onClickNextButton}
                    disabled={_isDisabled || savingRegexValue}
                    isLoading={savingRegexValue}
                >
                    Fetch commits {!isChangeBranchClicked && '& Next'}
                    {!isChangeBranchClicked && (
                        <LeftIcon
                            style={{ ['--rotateBy' as any]: '180deg' }}
                            className={`rotate icon-dim-16 ml-8 ${_isDisabled ? 'scn-4' : 'scn-0'} transform`}
                        />
                    )}
                </ButtonWithLoader>
            </div>
        )
    }

    return (
        <VisibleModal className="visible-modal__body">
            <div onClick={stopPropagation} className="ci-trigger__branch-regex-wrapper modal__body w-600 p-0 fs-13">
                {renderBranchRegexMaterialHeader()}
                {renderRegexInfo()}
                {renderBranchRegexContent()}
                {!showWebhookModal && !hideHeaderFooter && renderMaterialRegexFooterNextButton()}
            </div>
        </VisibleModal>
    )
}

export default BranchRegexModal
