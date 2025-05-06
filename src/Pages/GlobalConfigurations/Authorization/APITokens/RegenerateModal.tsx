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

import { InfoBlock, Progressing, showError, VisibleModal } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg'
import { ReactComponent as Warn } from '../../../../assets/icons/ic-warning.svg'
import { RegenerateModalType, TokenResponseType } from './apiToken.type'
import { getDateInMilliseconds } from './apiToken.utils'
import ExpirationDate from './ExpirationDate'
import GenerateActionButton from './GenerateActionButton'
import GenerateModal from './GenerateModal'
import { updateGeneratedAPIToken } from './service'

const RegeneratedModal = ({
    close,
    setShowRegeneratedModal,
    editData,
    customDate,
    setCustomDate,
    reload,
    redirectToTokenList,
}: RegenerateModalType) => {
    const [loader, setLoader] = useState(false)
    const [showGenerateModal, setShowGenerateModal] = useState(false)
    const [selectedExpirationDate, setSelectedExpirationDate] = useState<{ label: string; value: number }>({
        label: '30 days',
        value: 30,
    })
    const [tokenResponse, setTokenResponse] = useState<TokenResponseType>()
    const [regeneratedExpireAtInMs, setRegeneratedExpireAtInMs] = useState<number>(
        getDateInMilliseconds(selectedExpirationDate.value),
    )
    const [invalidCustomDate, setInvalidCustomDate] = useState(false)

    const onChangeSelectFormData = (selectedOption: { label: string; value: number }) => {
        setRegeneratedExpireAtInMs(selectedOption.value === 0 ? 0 : getDateInMilliseconds(selectedOption.value))
        setSelectedExpirationDate(selectedOption)

        if (selectedOption.label === 'Custom' && invalidCustomDate) {
            setInvalidCustomDate(false)
        }
    }

    const handleDatesChange = (event): void => {
        setCustomDate(event)
        setRegeneratedExpireAtInMs(event.valueOf())

        if (invalidCustomDate) {
            setInvalidCustomDate(false)
        }
    }

    const renderModalHeader = () => (
        <div className="modal__header p-16 dc__border-bottom w-100 mb-0">
            <h2 className="modal__title fs-16 flex dc__content-space w-100">
                <span>Regenerate API token</span>
                <button type="button" className=" dc__transparent" onClick={close} aria-label="Close modal">
                    <Close className="icon-dim-24" />
                </button>
            </h2>
        </div>
    )

    const handleRegenrateToken = async () => {
        if (selectedExpirationDate.label === 'Custom' && !customDate) {
            setInvalidCustomDate(true)
            return
        }

        setLoader(true)
        try {
            const payload = {
                description: editData.description,
                expireAtInMs: regeneratedExpireAtInMs,
            }

            const { result } = await updateGeneratedAPIToken(payload, editData.id)
            setTokenResponse(result)
            setShowGenerateModal(true)
        } catch (err) {
            showError(err)
        } finally {
            setLoader(false)
        }
    }

    if (loader) {
        return <Progressing pageLoader />
    }

    const handleGenerateTokenActionButton = () => {
        setShowRegeneratedModal(false)
        setShowGenerateModal(false)
    }

    return showGenerateModal ? (
        <GenerateModal
            close={handleGenerateTokenActionButton}
            token={tokenResponse.token}
            reload={reload}
            redirectToTokenList={redirectToTokenList}
            isRegenerationModal
        />
    ) : (
        <VisibleModal className="regenerate-token-modal">
            <div className="modal__body w-600 flex column pt-0 pr-0 pl-0 pb-16">
                {renderModalHeader()}
                <div className="p-20 w-100">
                    <InfoBlock
                        variant="warning"
                        description="Submitting this form will generate a new token. Be aware that any scripts or applications using the current token will need to be updated."
                    />
                    <div className="mt-20 mb-20">
                        <ExpirationDate
                            selectedExpirationDate={selectedExpirationDate}
                            onChangeSelectFormData={onChangeSelectFormData}
                            handleDatesChange={handleDatesChange}
                            customDate={customDate}
                        />
                    </div>
                    {selectedExpirationDate.label === 'Custom' && invalidCustomDate && (
                        <span className="form__error flexbox-imp flex-align-center">
                            <Warn className="form__icon--error icon-dim-16 mr-4" />
                            {/* eslint-disable-next-line react/no-unescaped-entities */}
                            Custom expiration can't be blank. Please select a date.
                        </span>
                    )}
                </div>
                <GenerateActionButton
                    loader={loader}
                    onCancel={() => setShowRegeneratedModal(false)}
                    onSave={handleRegenrateToken}
                    buttonText="Regenerate Token"
                    regenerateButton
                    disabled={false}
                />
            </div>
        </VisibleModal>
    )
}

export default RegeneratedModal
