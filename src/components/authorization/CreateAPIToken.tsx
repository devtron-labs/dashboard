import React, { useState } from 'react'
import ReactSelect from 'react-select'
import { ConfirmationDialog, multiSelectStyles, Progressing, showError, VisibleModal } from '../common'
import { DropdownIndicator } from '../security/security.util'
import AppPermissions from '../userGroups/AppPermissions'
import { ReactComponent as Warn } from '../../assets/icons/ic-warning.svg'
import { FormType, GenerateTokenType } from './authorization.type'
import InfoColourBar from '../common/infocolourBar/InfoColourbar'
import { createGeneratedAPIToken } from './service'
import { toast } from 'react-toastify'
import RegeneratedModal from './RegeneratedModal'

function CreateAPIToken({ setShowGenerateToken }: GenerateTokenType) {
    const [selectedExpirationDate, setSelectedExpirationDate] = useState({ label: '30 days', value: '30Days' })
    const [loader, setLoader] = useState(false)
    const [adminPermission, setAdminPermission] = useState('SUPERADMIN')
    const [tokenGeneratedModal, setTokenGeneratedModal] = useState(false)

    const [formData, setFormData] = useState<FormType>({
        name: '',
        description: '',
        expireAtInMs: '',
    })

    const PermissionType = [
        { value: 'SPECIFIC', label: 'Specific permissions' },
        { value: 'SUPERADMIN', label: 'Superadmin permission' },
    ]

    const options = [
        { value: '7Days', label: '7 days' },
        { value: '30Days', label: '30 days' },
        { value: '60Days', label: '60 days' },
        { value: '90Days', label: '90 days' },
        { value: 'Custom', label: 'Custom...' },
        { value: 'NoExpiration', label: 'NO expiration' },
    ]

    const saveToken = (): void => {}

    const onChangeFormData = (event: React.ChangeEvent<HTMLInputElement>, key): void => {
        let str = event.target.value || ''
        str = str.toLowerCase()

        setFormData({
            ...formData,
        })
    }

    const handleGenerateAPIToken = () => {
        setLoader(true)
        let payload = {
            name: formData.name,
            description: formData.description,
            expireAtInMs: formData.expireAtInMs,
        }

        createGeneratedAPIToken(payload)
            .then((response) => {
                toast.success('Changes saved')
            })
            .catch((error) => {
                showError(error)
            })
            .finally(() => {
                setLoader(false)
            })

        setTokenGeneratedModal(true)
    }

    return (
        <div className="api-token__container" style={{ minHeight: 'calc(100vh - 235px)' }}>
            <div className="cn-9 fw-6 fs-16">
                <span className="cb-5">API tokens</span> / New API oken
            </div>
            <p className="fs-13 fw-4">
                API tokens function like ordinary OAuth access tokens. They can be used instead of a password for Git
                over HTTPS, or can be used to authenticate to the API over Basic Authentication.
            </p>

            <div className="bcn-0 br-8 en-2 bw-1">
                <form
                    onSubmit={(e) => {
                        saveToken()
                    }}
                    className="p-20"
                >
                    <div>
                        <label className="form__row">
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
                            {/* {this.state.showError && !this.state.isValid.name ? (
                                <span className="form__error">
                                    <Error className="form__icon form__icon--error" />
                                    This is a required field
                                </span>
                            ) : null} */}
                        </label>
                        <label className="form__row">
                            <span className="form__label">Description</span>
                            <input
                                tabIndex={1}
                                placeholder="Enter a description to remember where you have used this token"
                                className="form__input"
                                value={formData.name}
                                onChange={(e) => onChangeFormData(e, 'name')}
                            />
                        </label>

                        <label className="form__row">
                            <span className="form__label">
                                Expiration <span className="cr-5"> *</span>
                            </span>
                            <div className="flex left">
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
                            </div>
                        </label>
                        <div className="mb-20">
                            <InfoColourBar
                                classname={'warn ey-2'}
                                Icon={Warn}
                                message={
                                    'Devtron strongly recommends that you set an expiration date for your token to help keep your information secure.'
                                }
                                iconClass="scy-9"
                            />
                        </div>
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
                    /> */}
                            </div>
                        )}
                    </div>
                </form>
                <hr className="modal__divider mt-20 mb-0" />
                <div className="modal__buttons m-16 flex right">
                    <button className="cta cancel mr-16" type="button" onClick={(e) => setShowGenerateToken(false)}>
                        Cancel
                    </button>
                    {/* <GenerateActionButton handleGenerateRowActionButton={handleGenerateAPIToken} /> */}
                    <button className="cta" onClick={handleGenerateAPIToken}>
                        {loader ? <Progressing /> : 'Generate token'}
                    </button>
                </div>
            </div>

            {tokenGeneratedModal && <RegeneratedModal />}
        </div>
    )
}

export default CreateAPIToken
