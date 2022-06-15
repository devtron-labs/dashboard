import React from 'react'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import InfoColourBar from '../common/infocolourBar/InfoColourbar'
import { ReactComponent as Warn } from '../../assets/icons/ic-warning.svg'
import ReactSelect from 'react-select'
import { multiSelectStyles, Progressing, showError, VisibleModal } from '../common'
import { DropdownIndicator } from '../security/security.util'
import GenerateActionButton from './GenerateActionButton'
import { getOptions } from './authorization.utils'
import { RegenerateModalType } from './authorization.type'

function RegeneratedModal({
    close,
    selectedExpirationDate,
    setSelectedExpirationDate,
    setShowRegeneratedModal,
}: RegenerateModalType) {
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

    const renderExpirationLabel = () => {
        return (
            <label className="form__row">
                <span className="form__label">
                    Expiration <span className="cr-5"> *</span>
                </span>
                <div className="flex left">
                    <ReactSelect
                        value={selectedExpirationDate}
                        options={getOptions(selectedExpirationDate.value)}
                        className="select-width w-200"
                        onChange={() => setSelectedExpirationDate(selectedExpirationDate)}
                        components={{
                            IndicatorSeparator: null,
                            DropdownIndicator,
                        }}
                        styles={{
                            ...multiSelectStyles,
                        }}
                    />
                    <span className="ml-16 fw-4">This token will expire on </span>
                </div>
            </label>
        )
    }

    const handleRegenrateToken = () => {}

    return (
        <VisibleModal className={undefined}>
            <form className="modal__body w-600 flex column p-0">
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
                    <div className="mt-20 mb-20">{renderExpirationLabel()}</div>
                </div>
                <GenerateActionButton
                    loader={false}
                    onCancel={() => setShowRegeneratedModal(false)}
                    onSave={handleRegenrateToken}
                    buttonText="Regenerate Token"
                />
            </form>
        </VisibleModal>
    )
}

export default RegeneratedModal
