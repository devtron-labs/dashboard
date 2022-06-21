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

function RegeneratedModal({ close, setShowRegeneratedModal, editData }: RegenerateModalType) {
    const [customDate, setCustomDate] = useState<number>(undefined)
    const [loader, setLoader] = useState(false)
    const [showGenerateModal, setShowGenerateModal] = useState(false)
    const expirationDays = editData?.expireAtInMs && moment(editData?.expireAtInMs).days()
    const [selectedExpirationDate, setSelectedExpirationDate] = useState<{ label: string; value: any }>({
        label: editData?.expireAtInMs === 0 ? 'No expiration' : expirationDays ? `${expirationDays} days` : null,
        value: editData?.expireAtInMs === 0 ? 0 : expirationDays || null,
    })
    const [tokenResponse, setTokenResponse] = useState<TokenResponseType>()
    const [regeneratedData, setRegeneratedData] = useState<{ expireAtInMs: number }>({
        expireAtInMs: editData?.expireAtInMs,
    })
    const [copied, setCopied] = useState(false)

    const onChangeSelectFormData = (selectedOption: { label: string; value: any }) => {
        const _regeneratedData = { ...regeneratedData }
        _regeneratedData['expireAtInMs'] = getDateInMilliseconds(regeneratedData.expireAtInMs)
        setRegeneratedData(regeneratedData)
        setSelectedExpirationDate(selectedOption)

        // _regeneratedExpirationTime['expireAtInMs'] = getDateInMilliseconds(selectedExpirationDate.value)
    }

    const handleDatesChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
        const _regeneratedData = { ...regeneratedData }
        setCustomDate(parseInt(event.target.value) | 0)
        setRegeneratedData(_regeneratedData)
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
            let payload = {
                description: '',
                expireAtInMs: getDateInMilliseconds(regeneratedData.expireAtInMs),
            }
            await updateGeneratedAPIToken(payload, editData?.id).then((response) => {
                toast.success('Regenerated Token successfully')
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
        setShowGenerateModal(false)
        setShowRegeneratedModal(false)
    }

    return (
        <VisibleModal className={undefined}>
            <div className="modal__body w-600 flex column p-0">
                {renderModalHeader()}
                <div className="p-20 w-100">
                    <InfoColourBar
                        message={
                            'Submitting this form will generate a new token. Be aware that any scripts or applications using the current token will need to be updated.'
                        }
                        classname={'warn'}
                        Icon={Warn}
                        iconClass=""
                    />
                    <div className="mt-20 mb-20">
                        <ExpirationDate
                            selectedExpirationDate={selectedExpirationDate}
                            onChangeSelectFormData={onChangeSelectFormData}
                            handleDatesChange={handleDatesChange}
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

            {showGenerateModal && (
                <GenerateModal
                    close={handleGenerateTokenActionButton}
                    token={tokenResponse.token}
                    copied={copied}
                    setCopied={setCopied}
                    setShowGenerateModal={setShowGenerateModal}
                    // reload={reload}
                />
            )}
        </VisibleModal>
    )
}

export default RegeneratedModal
