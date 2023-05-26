import React, { useContext, useEffect, useState } from 'react'
import { FormType, GenerateTokenType } from './authorization.type'
import { createGeneratedAPIToken } from './service'
import GenerateModal from './GenerateModal'
import {
    createUserPermissionPayload,
    getDateInMilliseconds,
    isFormComplete,
    PermissionType,
} from './authorization.utils'
import GenerateActionButton from './GenerateActionButton'
import { ValidationRules } from './validationRules'
import { ReactComponent as Error } from '../../assets/icons/ic-warning.svg'
import { ReactComponent as QuestionFilled } from '../../assets/icons/ic-help.svg'
import { ReactComponent as Question } from '../../assets/icons/ic-help-outline.svg'
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
import { mainContext } from '../common/navigation/NavigationRoutes'
import ExpirationDate from './ExpirationDate'
import { Moment } from 'moment'
import { toast } from 'react-toastify'
import { ServerErrors, showError, RadioGroup, RadioGroupItem, TippyCustomized, TippyTheme } from '@devtron-labs/devtron-fe-common-lib'
import { DOCUMENTATION } from '../../config'
import { API_COMPONENTS } from '../../config/constantMessaging'

export const renderQuestionwithTippy = () => {
    return (
        <TippyCustomized
            theme={TippyTheme.white}
            className="w-300 h-100 fcv-5"
            placement="right"
            Icon={QuestionFilled}
            heading={API_COMPONENTS.TITLE}
            infoText={API_COMPONENTS.QUESTION_ICON_INFO}
            showCloseButton={true}
            trigger="click"
            interactive = {true}
            documentationLink={DOCUMENTATION.WEBHOOK_API_TOKEN}
            documentationLinkText="View Documentation"
        >
            <div className="icon-dim-20 fcn-9 ml-8 cursor">
                <Question />
            </div>

        </TippyCustomized>
    )
}

function CreateAPIToken({
    setShowGenerateModal,
    showGenerateModal,
    handleGenerateTokenActionButton,
    setSelectedExpirationDate,
    selectedExpirationDate,
    tokenResponse,
    setTokenResponse,
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
        invalidDescription: boolean
        invalidDescriptionMessage: string
    }>({
        invalidName: false,
        invalidaNameMessage: '',
        invalidCustomDate: false,
        invalidDescription: false,
        invalidDescriptionMessage: '',
    })
    const [userGroups, setUserGroups] = useState<OptionType[]>([])
    const [directPermission, setDirectPermission] = useState<DirectPermissionsRoleFilter[]>([])
    const [chartPermission, setChartPermission] = useState<ChartGroupPermissionsFilter>({
        entity: EntityTypes.CHART_GROUP,
        action: ActionTypes.VIEW,
        entityName: [],
    })
    const [k8sPermission, setK8sPermission] = useState<any[]>([]);
    const [customDate, setCustomDate] = useState<Moment>(null)
    const validationRules = new ValidationRules()

    // Reset selected expiration date to 30 days on unmount
    useEffect(() => {
        return (): void => {
            setSelectedExpirationDate({
                label: '30 days',
                value: 30,
            })
        }
    }, [])

    const onChangeHandler = (event): void => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        })

        if (event.target.name === 'name') {
            const nameValidation = validationRules.name(event.target.value)
            setFormDataErrorObj({
                ...formDataErrorObj,
                invalidName: !nameValidation.isValid,
                invalidaNameMessage: nameValidation.message,
            })
        } else if (event.target.name === 'description') {
            const descriptionValidation = validationRules.description(event.target.value)
            setFormDataErrorObj({
                ...formDataErrorObj,
                invalidDescription: !descriptionValidation.isValid,
                invalidDescriptionMessage: descriptionValidation.message,
            })
        }
    }

    const onCustomDateChange = (event) => {
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
    }

    const redirectToTokenList = () => {
        history.push(`${match.path.split('create')[0]}list`)
    }

    const onChangeSelectFormData = (selectedOption: { label: string; value: number }) => {
        setSelectedExpirationDate(selectedOption)
        setFormData({
            ...formData,
            expireAtInMs: selectedOption.value === 0 ? 0 : getDateInMilliseconds(selectedOption.value),
            dateType: selectedOption.label,
        })
    }

    const handleGenerateAPIToken = async () => {
        if (!isFormComplete(directPermission, setDirectPermission)) {
            toast.error('Some required fields are missing')
            return
        }

        const nameValidation = validationRules.name(formData.name)
        const descriptionValidation = validationRules.description(formData.description)
        const noCustomDate = formData.dateType === 'Custom' && !customDate
        if (!nameValidation.isValid || noCustomDate || !descriptionValidation.isValid) {
            setFormDataErrorObj({
                invalidName: !nameValidation.isValid,
                invalidaNameMessage: nameValidation.message,
                invalidCustomDate: noCustomDate,
                invalidDescription: !descriptionValidation.isValid,
                invalidDescriptionMessage: descriptionValidation.message,
            })
            toast.error('Some required fields are missing')

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
                    k8sPermission,
                    adminPermission === 'SUPERADMIN',
                )

                const { result: userPermissionResponse } = await saveUser(userPermissionPayload)
                if (userPermissionResponse) {
                    setTokenResponse(result)
                    setShowGenerateModal(true)
                }
            }
        } catch (err) {
            showError(err)
            if (err instanceof ServerErrors && Array.isArray(err.errors)) {
                const _invalidNameErr = err.errors[0]
                if (_invalidNameErr.userMessage.includes('please use another name')) {
                    setFormDataErrorObj({
                        ...formDataErrorObj,
                        invalidName: true,
                        invalidaNameMessage: _invalidNameErr.userMessage,
                    })
                }
            }
        } finally {
            setLoader(false)
        }
    }

    const handlePermissionType = (e) => {
        setAdminPermission(e.target.value)
    }

    return (
        <div className="bcn-0 api__token">
            <div className="flex dc__content-space pt-16 pb-16 dc__gap-8">
                <div className="flex row ml-0 h-32">
                    <div className="cn-9 fw-6 fs-16">
                        <span className="cb-5 cursor" onClick={redirectToTokenList}>
                            {API_COMPONENTS.TITLE}
                        </span>
                        {API_COMPONENTS.NEW_API_TITLE}
                    </div>
                    {renderQuestionwithTippy()}
                </div>
            </div>

            <div className="bcn-0">
                <div className="pb-20">
                    <div>
                        <label className="form__row w-400">
                            <span className="form__label dc__required-field">Name</span>
                            <input
                                tabIndex={1}
                                placeholder="Name"
                                data-testid="api-token-name-textbox"
                                className="form__input"
                                name="name"
                                value={formData.name}
                                onChange={onChangeHandler}
                                autoFocus
                                autoComplete="off"
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
                                data-testid="api-token-description-textbox"
                                className="form__textarea"
                                value={formData.description}
                                name="description"
                                onChange={onChangeHandler}
                            />
                            {formDataErrorObj.invalidDescription && (
                                <span className="form__error">
                                    <Error className="form__icon form__icon--error" />
                                    {formDataErrorObj.invalidDescriptionMessage}
                                </span>
                            )}
                        </label>
                        <label className="form__row">
                            <div className="flex left">
                                <ExpirationDate
                                    selectedExpirationDate={selectedExpirationDate}
                                    onChangeSelectFormData={onChangeSelectFormData}
                                    handleDatesChange={onCustomDateChange}
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
                        <hr className="modal__divider mt-20 mb-12" />
                        <div className="flex left">
                            <RadioGroup
                                className="permission-type__radio-group"
                                value={adminPermission}
                                name="permission-type"
                                onChange={handlePermissionType}
                            >
                                {PermissionType.map(({ label, value }) => (
                                    <RadioGroupItem
                                        dataTestId={`${
                                            value === 'SPECIFIC' ? 'specific-user' : 'super-admin'
                                        }-permission-radio-button`}
                                        value={value}
                                    >
                                        <span
                                            className={`dc__no-text-transform ${
                                                adminPermission === value ? 'fw-6' : 'fw-4'
                                            }`}
                                        >
                                            {label}
                                        </span>
                                    </RadioGroupItem>
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
                                setK8sPermission={setK8sPermission}
                                k8sPermission={k8sPermission}
                            />
                        )}
                    </div>
                </div>
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
                    reload={reload}
                    redirectToTokenList={redirectToTokenList}
                />
            )}
        </div>
    )
}

export default CreateAPIToken
