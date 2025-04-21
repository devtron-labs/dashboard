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

import React, { useEffect, useRef, useState } from 'react'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    CustomInput,
    Drawer,
    InfoBlock,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as Close } from '../../../../assets/icons/ic-cross.svg'
import SourceUpdateResponseModal from './SourceUpdateResponseModal'
import { BulkSourceChangeProps } from './types'

const BulkSourceChange = ({
    closePopup,
    responseList,
    changeBranch,
    loading,
    selectedAppCount,
}: BulkSourceChangeProps) => {
    const sourceChangeDetailRef = useRef<HTMLDivElement>(null)

    const [showResponseModal, setShowResponseModal] = useState(false)
    const [inputError, setInputError] = useState('')
    const [branchName, setBranchName] = useState('')

    const closeBulkCIModal = (evt) => {
        closePopup(evt)
    }

    const escKeyPressHandler = (evt): void => {
        if (evt && evt.key === 'Escape' && typeof closePopup === 'function') {
            evt.preventDefault()
            closeBulkCIModal(evt)
        }
    }
    const outsideClickHandler = (evt): void => {
        if (
            sourceChangeDetailRef.current &&
            !sourceChangeDetailRef.current.contains(evt.target) &&
            typeof closePopup === 'function'
        ) {
            closeBulkCIModal(evt)
        }
    }

    useEffect(() => {
        document.addEventListener('keydown', escKeyPressHandler)
        return (): void => {
            document.removeEventListener('keydown', escKeyPressHandler)
        }
    }, [escKeyPressHandler])

    useEffect(() => {
        document.addEventListener('click', outsideClickHandler)
        return (): void => {
            document.removeEventListener('click', outsideClickHandler)
        }
    }, [outsideClickHandler])

    useEffect(() => {
        setShowResponseModal(responseList.length > 0)
    }, [responseList])

    const updateBranch = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (branchName.length === 0) {
            setInputError('This is required')
            return
        }
        changeBranch(branchName)
    }

    const renderHeaderSection = (): JSX.Element | null => (
        <div className="flex flex-justify dc__border-bottom px-20 py-16">
            <h2 className="fs-16 fw-6 lh-1-43 m-0">Change branch for {selectedAppCount} applications</h2>
            <button
                type="button"
                className="dc__transparent flex icon-dim-24"
                disabled={loading}
                onClick={closeBulkCIModal}
                aria-label="close"
            >
                <Close className="icon-dim-24" />
            </button>
        </div>
    )

    const renderInfoBar = (): JSX.Element => (
        <InfoBlock
            variant="warning"
            borderRadiusConfig={{ top: false }}
            borderConfig={{ top: false, left: false, right: false }}
            description="Branch will be changed only for build pipelines with source type as ‘Branch Fixed’ or ‘Branch Regex’."
        />
    )

    const checkInput = (): boolean => branchName === ''

    const handleInputChange = (e): void => {
        setBranchName(e.target.value)
        setInputError('')
    }

    const renderForm = (): JSX.Element => {
        const isDisabled = checkInput()

        return (
            <div className="p-20">
                <div className="form__row">
                    <CustomInput
                        required
                        name="branch_name"
                        disabled={false}
                        value={branchName}
                        error={inputError}
                        onChange={handleInputChange}
                        label="Change to branch"
                        placeholder="Enter branch name"
                    />
                </div>
                <div className="flexbox dc__gap-12">
                    <Button
                        dataTestId="cancel_button"
                        onClick={closeBulkCIModal}
                        text="Cancel"
                        style={ButtonStyleType.neutral}
                        variant={ButtonVariantType.secondary}
                    />
                    <Button
                        dataTestId="bulk-update-branch"
                        onClick={updateBranch}
                        text="Update branch"
                        style={ButtonStyleType.neutral}
                        variant={ButtonVariantType.secondary}
                        disabled={isDisabled}
                        isLoading={loading}
                    />
                </div>
            </div>
        )
    }

    // ASK: Why there is no retry button for failed request?
    const renderFooterSection = (): JSX.Element => (
        <div className="dc__border-top flex bg__primary px-20 py-16 right">
            <Button
                dataTestId="close-popup"
                onClick={closePopup}
                text="Close"
                variant={ButtonVariantType.secondary}
                style={ButtonStyleType.neutral}
            />
        </div>
    )

    return (
        <Drawer
            position="right"
            width="75%"
            minWidth={showResponseModal ? '1024px' : '600px'}
            maxWidth={showResponseModal ? '1200px' : '600px'}
        >
            <div className="bg__primary bulk-ci-trigger-container" ref={sourceChangeDetailRef}>
                <div className="flexbox-col flex-grow-1 dc__overflow-hidden">
                    {renderHeaderSection()}
                    {showResponseModal ? (
                        <SourceUpdateResponseModal isLoading={loading} responseList={responseList} />
                    ) : (
                        <>
                            {renderInfoBar()}
                            {renderForm()}
                        </>
                    )}
                </div>
                {showResponseModal && renderFooterSection()}
            </div>
        </Drawer>
    )
}

export default BulkSourceChange
