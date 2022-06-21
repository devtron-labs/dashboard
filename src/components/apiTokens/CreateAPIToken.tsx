import React, { useContext, useState } from 'react'
import { showError } from '../common'
import { ReactComponent as Warn } from '../../assets/icons/ic-warning.svg'
import { FormType, GenerateTokenType } from './authorization.type'
import InfoColourBar from '../common/infocolourBar/InfoColourbar'
import { createGeneratedAPIToken } from './service'
import GenerateModal from './GenerateModal'
import { createUserPermissionPayload, getDateInMilliseconds, PermissionType } from './authorization.utils'
import GenerateActionButton from './GenerateActionButton'
import { ValidationRules } from './validationRules'
import { ReactComponent as Error } from '../../assets/icons/ic-warning.svg'
import { saveUser } from '../userGroups/userGroup.service'
import {
    ActionTypes,
    ChartGroupPermissionsFilter,
    DirectPermissionsRoleFilter,
    EntityTypes,
    OptionType,
} from '../userGroups/userGroups.types'
import { useHistory, useRouteMatch } from 'react-router-dom'
import GroupPermission from './GroupPermission'
import { RadioGroup, RadioGroupItem } from '../common/formFields/RadioGroup'
import { mainContext } from '../common/navigation/NavigationRoutes'
import ExpirationDate from './ExpirationDate'

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
    const history = useHistory()
    const match = useRouteMatch()
    const { serverMode } = useContext(mainContext)
    const [loader, setLoader] = useState(false)
    const [adminPermission, setAdminPermission] = useState('SUPERADMIN')
    const [formData, setFormData] = useState<FormType>({
        name: '',
        description: '',
        expireAtInMs: selectedExpirationDate ? getDateInMilliseconds(selectedExpirationDate.value) : undefined,
    })
    const [showErrors, setshowErrors] = useState(false)
    const [formDataErrorObj, setFormDataErrorObj] = useState<FormType>()
    const validationRules = new ValidationRules()
    const [isValid, setIsValid] = useState({
        name: false,
        expireAtInMs: false,
    })
    const [userGroups, setUserGroups] = useState<OptionType[]>([])
    const [directPermission, setDirectPermission] = useState<DirectPermissionsRoleFilter[]>([])
    const [chartPermission, setChartPermission] = useState<ChartGroupPermissionsFilter>({
        entity: EntityTypes.CHART_GROUP,
        action: ActionTypes.VIEW,
        entityName: [],
    })

    const onChangeFormData = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, key): void => {
        const _formData = { ...formData }
        _formData[key] = event.target.value || ''
        setFormData(_formData)

        const _formErrorObject = { ...formDataErrorObj }
        _formErrorObject[key] = validationRules.requiredField(event.target.value).isValid
        setFormDataErrorObj(_formErrorObject)

        if (key === 'customDate') {
            setCustomDate(parseInt(event.target.value) | 0)
        }
    }

    const redirectToTokenList = () => {
        let url = match.path.split('create')[0]
        history.push(`${url}list`)
    }

    const validateToken = (): boolean => {
        return
    }

    function isFormComplete(): boolean {
        let isComplete: boolean = true
        const tempPermissions = directPermission.reduce((agg, curr) => {
            if (curr.team && curr.entityName.length === 0) {
                isComplete = false
                curr.entityNameError = 'Applications are mandatory'
            }
            if (curr.team && curr.environment.length === 0) {
                isComplete = false
                curr.environmentError = 'Environments are mandatory'
            }
            agg.push(curr)
            return agg
        }, [])

        if (!isComplete) {
            setDirectPermission(tempPermissions)
        }

        return isComplete
    }

    const onChangeSelectFormData = (selectedOption: { label: string; value: number }) => {
        const _formData = { ...formData }
        setSelectedExpirationDate(selectedOption)

        _formData['expireAtInMs'] = selectedOption.value === 0 ? 0 : getDateInMilliseconds(selectedOption.value)
        setFormData(_formData)
    }

    const handleGenerateAPIToken = async (e) => {
        if (!isFormComplete()) {
            return
        }

        setshowErrors(true)
        setLoader(true)

        try {
            const payload = {
                name: formData.name,
                description: formData.description,
                expireAtInMs: formData.expireAtInMs,
            }

            const { result } = await createGeneratedAPIToken(payload)

            if (result) {
                const userPermissionPayload = createUserPermissionPayload(
                    result.userId,
                    result.userIdentifier,
                    serverMode,
                    userGroups,
                    directPermission,
                    chartPermission,
                    adminPermission === 'SUPERADMIN',
                )

                const { result: userPermissionResponse } = await saveUser(userPermissionPayload)
                if (userPermissionResponse) {
                    setTokenResponse(result)
                    setShowGenerateModal(true)
                    setshowErrors(false)
                    reload()
                    history.push('/global-config/auth/api-token/list')
                }
            }
        } catch (error) {
            showError(error)
        } finally {
            setLoader(false)
        }
    }

    const handlePermissionType = (e) => {
        setAdminPermission(e.target.value)
    }

    const handleDatesChange = (e) => {
        onChangeFormData(e, 'customDate')
    }

    const errorObject = validationRules.name(formData.name)

    return (
        <>
            <div className="cn-9 fw-6 fs-16">
                <span className="cb-5 cursor" onClick={redirectToTokenList}>
                    API tokens
                </span>{' '}
                / New API token
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
                            {showErrors && !isValid.name && (
                                <span className="form__error">
                                    <Error className="form__icon form__icon--error" />
                                    {errorObject.message} <br />
                                </span>
                            )}
                        </label>
                        <label className="form__row">
                            <span className="form__label">Description</span>
                            <textarea
                                tabIndex={1}
                                placeholder="Enter a description to remember where you have used this token"
                                className="form__textarea"
                                value={formData.description}
                                onChange={(e) => onChangeFormData(e, 'description')}
                            />
                        </label>

                        <label className="form__row">
                            <div className="flex left">
                                <ExpirationDate
                                    selectedExpirationDate={selectedExpirationDate}
                                    onChangeSelectFormData={onChangeSelectFormData}
                                    handleDatesChange={handleDatesChange}
                                />
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

                        <div className="flex left">
                            <RadioGroup
                                className="permission-type__radio-group"
                                value={adminPermission}
                                name="permission-type"
                                onChange={handlePermissionType}
                            >
                                {PermissionType.map(({ label, value }) => (
                                    <RadioGroupItem value={value}> {label} </RadioGroupItem>
                                ))}
                            </RadioGroup>
                        </div>
                        {adminPermission === 'SPECIFIC' && (
                            <GroupPermission
                                userData={null}
                                userGroups={userGroups}
                                setUserGroups={setUserGroups}
                                directPermission={directPermission}
                                setDirectPermission={setDirectPermission}
                                chartPermission={chartPermission}
                                setChartPermission={setChartPermission}
                            />
                        )}
                    </div>
                </div>
                <hr className="modal__divider mt-20 mb-0" />
                <GenerateActionButton
                    loader={loader}
                    onCancel={() => {
                        setShowGenerateModal(false)
                        redirectToTokenList()
                    }}
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
