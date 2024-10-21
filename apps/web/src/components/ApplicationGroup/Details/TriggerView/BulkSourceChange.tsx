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

import { CustomInput, Drawer, InfoColourBar, Progressing } from '@devtron-labs/devtron-fe-common-lib'
import React, { useEffect, useRef, useState } from 'react'
import { ReactComponent as Close } from '../../../../assets/icons/ic-cross.svg'
import { ReactComponent as Warn } from '../../../../assets/icons/ic-warning.svg'
import SourceUpdateResponseModal from './SourceUpdateResponseModal'
import { BulkSourceChangeProps } from './types'

export default function BulkSourceChange({
    closePopup,
    responseList,
    changeBranch,
    loading,
    selectedAppCount,
}: BulkSourceChangeProps) {
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

    const renderHeaderSection = (): JSX.Element | null => {
        return (
            <div className="flex flex-align-center flex-justify dc__border-bottom bcn-0 pt-16 pr-20 pb-16 pl-20">
                <h2 className="fs-16 fw-6 lh-1-43 m-0">Change branch for {selectedAppCount} applications</h2>
                <button
                    type="button"
                    className="dc__transparent flex icon-dim-24"
                    disabled={loading}
                    onClick={closeBulkCIModal}
                >
                    <Close className="icon-dim-24" />
                </button>
            </div>
        )
    }

    const renderInfoBar = (): JSX.Element => {
        return (
            <InfoColourBar
                message="Branch will be changed only for build pipelines with source type as ‘Branch Fixed’ or ‘Branch Regex’."
                classname="warn dc__no-border-radius dc__no-top-border dc__no-left-border dc__no-right-border"
                Icon={Warn}
                iconClass="warning-icon"
            />
        )
    }

    const checkInput = (): boolean => {
        return branchName === ''
    }

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
                        labelClassName="dc__required-field"
                        name="branch_name"
                        disabled={false}
                        value={branchName}
                        error={inputError}
                        onChange={handleInputChange}
                        label="Change to branch"
                        placeholder="Enter branch name"
                    />
                </div>
                <div className="flexbox">
                    <button
                        data-testid="cancel_button"
                        className="cta cancel h-36 lh-36"
                        type="button"
                        onClick={closeBulkCIModal}
                    >
                        Cancel
                    </button>
                    <button
                        data-testid="save_cluster_after_entering_cluster_details"
                        className="cta ml-12 h-36 lh-36"
                        onClick={updateBranch}
                        disabled={isDisabled}
                    >
                        {loading ? <Progressing /> : 'Update branch'}
                    </button>
                </div>
            </div>
        )
    }
    return (
        <Drawer
            position="right"
            width="75%"
            minWidth={showResponseModal ? '1024px' : '600px'}
            maxWidth={showResponseModal ? '1200px' : '600px'}
        >
            <div className="dc__window-bg h-100 bcn-0 bulk-ci-trigger-container" ref={sourceChangeDetailRef}>
                {renderHeaderSection()}
                {showResponseModal ? (
                    <SourceUpdateResponseModal
                        closePopup={closePopup}
                        isLoading={loading}
                        responseList={responseList}
                    />
                ) : (
                    <>
                        {renderInfoBar()}
                        {renderForm()}
                    </>
                )}
            </div>
        </Drawer>
    )
}
