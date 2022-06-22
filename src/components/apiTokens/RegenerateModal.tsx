import React, { useState } from 'react'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import InfoColourBar from '../common/infocolourBar/InfoColourbar'
import { ReactComponent as Warn } from '../../assets/icons/ic-warning.svg'
import { Progressing, showError, VisibleModal } from '../common'
import GenerateActionButton from './GenerateActionButton'
import { getDateInMilliseconds, getOptions } from './authorization.utils'
import { RegenerateModalType, TokenResponseType } from './authorization.type'
import { updateGeneratedAPIToken } from './service'
import { toast } from 'react-toastify'
import GenerateModal from './GenerateModal'
import ExpirationDate from './ExpirationDate'
import moment from 'moment'

function RegeneratedModal({
    close,
    setShowRegeneratedModal,
    editData,
    customDate,
    setCustomDate,
    reload,
    redirectToTokenList,
}: RegenerateModalType) {
    const [loader, setLoader] = useState(false)
    const [showGenerateModal, setShowGenerateModal] = useState(false)
    const [selectedExpirationDate, setSelectedExpirationDate] = useState<{ label: string; value: any }>({
        label: '30 days',
        value: 30,
    })
    const [tokenResponse, setTokenResponse] = useState<TokenResponseType>()
    const [regeneratedExpireAtInMs, setRegeneratedExpireAtInMs] = useState<number>(
        getDateInMilliseconds(selectedExpirationDate.value),
    )
    const [copied, setCopied] = useState(false)

    const onChangeSelectFormData = (selectedOption: { label: string; value: any }) => {
        setRegeneratedExpireAtInMs(getDateInMilliseconds(selectedOption.value))
        setSelectedExpirationDate(selectedOption)
    }

    const handleDatesChange = (event): void => {
        setCustomDate(event)
        setRegeneratedExpireAtInMs(event.valueOf())
    }

    const renderModalHeader = () => {
        return (
            <div className="modal__header p-16 border-bottom w-100 mb-0">
                <h1 className="modal__title fs-16 flex content-space w-100">
                    <span>Regenerate API token</span>
                    <button type="button" className=" transparent" onClick={close}>
                        <Close className="icon-dim-24" />
                    </button>
                </h1>
            </div>
        )
    }

    const handleRegenrateToken = async () => {
        setLoader(true)
        try {
            const payload = {
                description: '',
                expireAtInMs: regeneratedExpireAtInMs,
            }
            await updateGeneratedAPIToken(payload, editData?.id).then((response) => {
                setTokenResponse(response.result)
                setShowGenerateModal(true)
            })
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
            copied={copied}
            setCopied={setCopied}
            setShowGenerateModal={setShowGenerateModal}
            reload={reload}
            redirectToTokenList={redirectToTokenList}
        />
    ) : (
        <VisibleModal className="">
            <div className="modal__body w-600 flex column p-0">
                {renderModalHeader()}
                <div className="p-20 w-100">
                    <InfoColourBar
                        message="Submitting this form will generate a new token. Be aware that any scripts or applications using the current token will need to be updated."
                        classname="warn"
                        Icon={Warn}
                        iconClass="warning-icon"
                    />
                    <div className="mt-20 mb-20">
                        <ExpirationDate
                            selectedExpirationDate={selectedExpirationDate}
                            onChangeSelectFormData={onChangeSelectFormData}
                            handleDatesChange={handleDatesChange}
                            customDate={customDate}
                        />
                    </div>
                </div>
                <GenerateActionButton
                    loader={false}
                    onCancel={() => setShowRegeneratedModal(false)}
                    onSave={handleRegenrateToken}
                    buttonText="Regenerate Token"
                />
            </div>
        </VisibleModal>
    )
}

export default RegeneratedModal
