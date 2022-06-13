import React from 'react'
import InfoColourBar from '../common/infocolourBar/InfoColourbar'
import { ReactComponent as InfoIcon } from '../../assets/icons/info-filled.svg'
import RegeneratedModal from './RegenerateModal'

function EditAPIToken({
    setShowRegeneratedModal,
    showRegeneratedModal,
    handleRegenerateActionButton,
    selectedExpirationDate,
    setSelectedExpirationDate,
}) {
    const renderActionButton = () => {
        return (
            <span className="cr-5 cursor" onClick={() => setShowRegeneratedModal(true)}>
                Regenerate token
            </span>
        )
    }

    const renderRegenrateInfoBar = () => {
        return (
            <InfoColourBar
                message={
                    'If you’ve lost or forgotten this token, you can regenerate it. Any scripts or applications using this token will need to be updated.'
                }
                classname={'info m-20'}
                Icon={InfoIcon}
                iconClass={'icon-dim-20'}
                renderActionButton={renderActionButton}
            />
        )
    }
    return (
        <div className="api-token__container" style={{ minHeight: 'calc(100vh - 235px)' }}>
            <div className="cn-9 fw-6 fs-16">
                <span className="cb-5">API tokens</span> / Edit API token
            </div>
            <p className="fs-13 fw-4">
                API tokens function like ordinary OAuth access tokens. They can be used instead of a password for Git
                over HTTPS, or can be used to authenticate to the API over Basic Authentication.
            </p>

            <div className="bcn-0 br-8 en-2 bw-1">
                {renderRegenrateInfoBar()}
                <form
                    onSubmit={(e) => {
                        // saveToken()
                    }}
                    className="p-20"
                >
                    <div>
                        <label className="form__row">
                            <span className="form__label">
                                Name <span className="cr-5">*</span>
                            </span>
                            {/*  <input
                        tabIndex={1}
                        placeholder="Name"
                        className="form__input"
                        value={formData.name}
                        onChange={(e) => onChangeFormData(e, 'name')}
                    /> */}
                            {/* {this.state.showError && !this.state.isValid.name ? (
                        <span className="form__error">
                            <Error className="form__icon form__icon--error" />
                            This is a required field
                        </span>
                    ) : null} */}
                        </label>
                        {/* <label className="form__row">
                    <span className="form__label">Description</span>
                    <input
                        tabIndex={1}
                        placeholder="Enter a description to remember where you have used this token"
                        className="form__input"
                        value={formData.name}
                        onChange={(e) => onChangeFormData(e, 'name')}
                    />
                </label> */}

                        <label className="form__row">
                            <span className="form__label">
                                Expiration <span className="cr-5"> *</span>
                            </span>
                            {/* <div className="flex left">
                        <ReactSelect
                            value={selectedExpirationDate}
                            options={options}
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
                        <span className="ml-16">This token will expire on </span>
                    </div> */}
                        </label>
                        {/* <div className="mb-20">
                    <InfoColourBar
                        classname={'warn ey-2'}
                        Icon={Warn}
                        message={
                            'Devtron strongly recommends that you set an expiration date for your token to help keep your information secure.'
                        }
                        iconClass="scy-9"
                    />
                </div> */}

                        {/* {adminPermission === 'SUPERADMIN' && ( */}
                        {/* <div> */}
                        {/* <AppPermissions
                data={userData}
                directPermission={directPermission}
                setDirectPermission={setDirectPermission}
                chartPermission={chartPermission}
                setChartPermission={setChartPermission}
            /> */}
                        {/* </div> */}
                        {/* )} */}
                    </div>
                </form>
                <hr className="modal__divider mt-20 mb-0" />
                <div className="modal__buttons m-16 flex right">
                    <button
                        className="cta cancel mr-16"
                        type="button"
                        //  onClick={(e) => setShowGenerateToken(false)}
                    >
                        Cancel
                    </button>
                    {/* <GenerateActionButton handleGenerateRowActionButton={handleGenerateAPIToken} /> */}
                    {/* <button className="cta" onClick={handleGenerateAPIToken}>
                {loader ? <Progressing /> : 'Generate token'}
            </button> */}
                </div>
            </div>
            {showRegeneratedModal && (
                <RegeneratedModal
                    close={handleRegenerateActionButton}
                    selectedExpirationDate={selectedExpirationDate}
                    setSelectedExpirationDate={undefined}
                    setShowRegeneratedModal={setShowRegeneratedModal}
                />
            )}
        </div>
    )
}

export default EditAPIToken
