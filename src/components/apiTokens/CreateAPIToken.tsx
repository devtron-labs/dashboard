import React, { useEffect, useState } from 'react'
import ReactSelect from 'react-select'
import { multiSelectStyles, showError } from '../common'
import { DropdownIndicator } from '../security/security.util'
import AppPermissions from '../userGroups/AppPermissions'
import { ReactComponent as Warn } from '../../assets/icons/ic-warning.svg'
import { FormType, GenerateTokenType } from './authorization.type'
import InfoColourBar from '../common/infocolourBar/InfoColourbar'
import { createGeneratedAPIToken } from './service'
import { toast } from 'react-toastify'
import GenerateModal from './GenerateModal'
import { getDateInMilliseconds, getOptions, PermissionType } from './authorization.utils'
import GenerateActionButton from './GenerateActionButton'
import moment from 'moment'
import { Moment12HourFormat } from '../../config'
import { ValidationRules } from './validationRules'
import { ReactComponent as Error } from '../../assets/icons/ic-warning.svg'

function CreateAPIToken({
    setShowGenerateModal,
    showGenerateModal,
    handleGenerateTokenActionButton,
    setSelectedExpirationDate,
    selectedExpirationDate,
    tokenResponse,
    setTokenResponse,
    customDate,
    setCustomDate,
    setCopied,
    copied,
    reload,
}: GenerateTokenType) {
    const [loader, setLoader] = useState(false)
    const [adminPermission, setAdminPermission] = useState('SUPERADMIN')
    const [formData, setFormData] = useState<FormType>({
        name: '',
        description: '',
        expireAtInMs: undefined,
    })
    const [showErrors, setshowErrors] = useState(false)
    const [formDataErrorObj, setFormDataErrorObj] = useState<FormType>({
        name: '',
        description: '',
        expireAtInMs: undefined,
    })

    const validationRules = new ValidationRules()

    const onChangeFormData = (event: React.ChangeEvent<HTMLInputElement>, key): void => {
        const _formData = { ...formData }
        _formData[key] = event.target.value || ''

        setFormData(_formData)

        const _formErrorObject = { ...formDataErrorObj }
        _formErrorObject[key] = validationRules.requiredField(event.target.value).isValid
        setFormDataErrorObj(_formErrorObject)

        if (key === 'customDate') {
            setCustomDate(parseInt(event.target.value))
        }
    }

    const validateToken = (): boolean => {
        return
    }

    const onChangeSelectFormData = (selectedOption: { label: string; value: number }) => {
        const _formData = { ...formData }
        setSelectedExpirationDate(selectedOption)
        const _formErrorObject = { ...formDataErrorObj }
        // _formErrorObject = validationRules.requiredField(selectedOption.value.toString())

        _formData['expireAtInMs'] = getDateInMilliseconds(selectedExpirationDate.value)
        setFormData(_formData)
    }

    const handleGenerateAPIToken = () => {
        setshowErrors(true)
        setLoader(true)
        let payload = {
            name: formData.name,
            description: formData.description,
            expireAtInMs: formData.expireAtInMs,
        }

        createGeneratedAPIToken(payload)
            .then((response) => {
                toast.success('Changes saved')
                setTokenResponse(response.result)
                setShowGenerateModal(true)
                setshowErrors(false)
            })
            .catch((error) => {
                showError(error)
            })
            .finally(() => {
                setLoader(false)
            })
    }

    const errorObject = [validationRules.name(formData.name)]
    return (
        <>
            <div className="cn-9 fw-6 fs-16">
                <span className="cb-5">API tokens</span> / New API token
            </div>
            <p className="fs-13 fw-4">
                API tokens function like ordinary OAuth access tokens. They can be used instead of a password for Git
                over HTTPS, or can be used to authenticate to the API over Basic Authentication.
            </p>

            <div className="bcn-0 br-8 en-2 bw-1">
                <div className="p-20">
                    <div>
                        <label className="form__row w-400">
                            <span className="form__label">
                                Name <span className="cr-5">*</span>
                            </span>
                            <input
                                tabIndex={1}
                                placeholder="Name"
                                className="form__input"
                                value={formData.name}
                                onChange={(e) => onChangeFormData(e, 'name')}
                            />
                            <span className="form__error">
                                {showErrors && !formDataErrorObj.name ? (
                                    <>
                                        <Error className="form__icon form__icon--error" />
                                        {errorObject[0].message} <br />
                                    </>
                                ) : null}
                            </span>
                        </label>
                        <label className="form__row">
                            <span className="form__label">Description</span>
                            <input
                                tabIndex={1}
                                placeholder="Enter a description to remember where you have used this token"
                                className="form__input"
                                value={formData.description}
                                onChange={(e) => onChangeFormData(e, 'description')}
                            />
                        </label>

                        <label className="form__row">
                            <span className="form__label">
                                Expiration <span className="cr-5"> *</span>
                            </span>
                            <div className="flex left">
                                <ReactSelect
                                    value={selectedExpirationDate}
                                    options={getOptions(customDate)}
                                    className="select-width w-200"
                                    onChange={(e) => onChangeSelectFormData(e)}
                                    components={{
                                        IndicatorSeparator: null,
                                        DropdownIndicator,
                                    }}
                                    styles={{
                                        ...multiSelectStyles,
                                    }}
                                />
                                <span className="ml-16 fw-4">
                                    This token will expire on
                                    {moment(getDateInMilliseconds(selectedExpirationDate.value)).format(
                                        Moment12HourFormat,
                                    )}
                                </span>
                                {selectedExpirationDate.label === 'Custom...' && (
                                    <input
                                        tabIndex={1}
                                        placeholder="Custom Dtaer"
                                        className="form__input"
                                        value={customDate}
                                        onChange={(e) => onChangeFormData(e, 'customDate')}
                                    />
                                )}
                            </div>
                        </label>
                        {selectedExpirationDate.label === 'No expiration' && (
                            <div className="mb-20">
                                <InfoColourBar
                                    classname={'warn'}
                                    Icon={Warn}
                                    message={
                                        'Devtron strongly recommends that you set an expiration date for your token to help keep your information secure.'
                                    }
                                    iconClass="scy-9"
                                />
                            </div>
                        )}

                        <div className="pointer flex form__permission">
                            {PermissionType.map(({ label: Lable, value }, index) => (
                                <div
                                    className="flex left"
                                    key={`generate_token_${index}`}
                                    onChange={() => setAdminPermission(value)}
                                >
                                    <label key={value} className=" flex left">
                                        <input
                                            type="radio"
                                            name="auth"
                                            value={value}
                                            checked={value === adminPermission}
                                        />
                                        <span className="ml-8 mt-4">{Lable}</span>
                                    </label>
                                </div>
                            ))}
                        </div>
                        {adminPermission === 'SUPERADMIN' && (
                            <div>
                                {/* <AppPermissions
                        data={userData}
                        directPermission={directPermission}
                        setDirectPermission={setDirectPermission}
                        chartPermission={chartPermission}
                        setChartPermission={setChartPermission}
                    />  */}
                            </div>
                        )}
                    </div>
                </div>
                <hr className="modal__divider mt-20 mb-0" />
                <GenerateActionButton
                    loader={false}
                    onCancel={() => setShowGenerateModal(false)}
                    onSave={handleGenerateAPIToken}
                    buttonText="Generate token"
                />
            </div>
            {showGenerateModal && (
                <GenerateModal
                    close={handleGenerateTokenActionButton}
                    token={tokenResponse.token}
                    copied={copied}
                    setCopied={setCopied}
                    setShowGenerateModal={setShowGenerateModal}
                    reload={reload}
                />
            )}
        </>
    )
}

export default CreateAPIToken
