import React, { useContext, useState } from 'react'
import { showError } from '../common'
import { FormType, GenerateTokenType } from './authorization.type'
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
import { Moment } from 'moment'
import { toast } from 'react-toastify'

function CreateAPIToken({
    setShowGenerateModal,
    showGenerateModal,
    handleGenerateTokenActionButton,
    setSelectedExpirationDate,
    selectedExpirationDate,
    tokenResponse,
    setTokenResponse,
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
    const [formDataErrorObj, setFormDataErrorObj] = useState<{
        invalidName: boolean
        invalidaNameMessage: string
        invalidCustomDate: boolean
    }>({
        invalidName: false,
        invalidaNameMessage: '',
        invalidCustomDate: false,
    })
    const [userGroups, setUserGroups] = useState<OptionType[]>([])
    const [directPermission, setDirectPermission] = useState<DirectPermissionsRoleFilter[]>([])
    const [chartPermission, setChartPermission] = useState<ChartGroupPermissionsFilter>({
        entity: EntityTypes.CHART_GROUP,
        action: ActionTypes.VIEW,
        entityName: [],
    })
    const [customDate, setCustomDate] = useState<Moment>(null)
    const validationRules = new ValidationRules()

    const onChangeFormData = (event, key): void => {
        if (key === 'customDate') {
            setCustomDate(event)
            setFormData({
                ...formData,
                expireAtInMs: event.valueOf(),
                dateType: 'Custom',
            })

            if (formDataErrorObj.invalidCustomDate) {
                setFormDataErrorObj({
                    ...formDataErrorObj,
                    invalidCustomDate: false,
                })
            }
        } else if (key === 'name') {
            setFormData({
                ...formData,
                name: event.target.value,
            })

            const nameValidation = validationRules.name(event.target.value)
            setFormDataErrorObj({
                ...formDataErrorObj,
                invalidName: !nameValidation.isValid,
                invalidaNameMessage: nameValidation.message,
            })
        } else {
            setFormData({
                ...formData,
                [key]: event.target.value,
            })
        }
    }

    const redirectToTokenList = () => {
        history.push(`${match.path.split('create')[0]}list`)
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
        setSelectedExpirationDate(selectedOption)
        setFormData({
            ...formData,
            expireAtInMs: selectedOption.value === 0 ? 0 : getDateInMilliseconds(selectedOption.value),
            dateType: selectedOption.label,
        })
    }

    const handleGenerateAPIToken = async (e) => {
        if (!isFormComplete()) {
            toast.error('Some required fields are missing')
            return
        }

        const nameValidation = validationRules.name(formData.name)
        const noCustomDate = formData.dateType === 'Custom' && !customDate
        if (!nameValidation.isValid || noCustomDate) {
            toast.error('Some required fields are missing')
            setFormDataErrorObj({
                invalidName: !nameValidation.isValid,
                invalidaNameMessage: nameValidation.message,
                invalidCustomDate: noCustomDate,
            })
            return
        }

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
                            {formDataErrorObj.invalidName && (
                                <span className="form__error">
                                    <Error className="form__icon form__icon--error" />
                                    {formDataErrorObj.invalidaNameMessage}
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
                                    customDate={customDate}
                                />
                            </div>
                            {formData.dateType === 'Custom' && formDataErrorObj.invalidCustomDate && (
                                <span className="form__error">
                                    <Error className="form__icon form__icon--error" />
                                    Custom expiration can't be blank. Please select a date.
                                </span>
                            )}
                        </label>
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
                    redirectToTokenList={redirectToTokenList}
                />
            )}
        </>
    )
}

export default CreateAPIToken
