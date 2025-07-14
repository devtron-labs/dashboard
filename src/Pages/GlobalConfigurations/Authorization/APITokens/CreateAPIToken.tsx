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

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { useEffect, useState } from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { Moment } from 'moment'

import {
    CustomInput,
    InfoIconTippy,
    ServerErrors,
    showError,
    Textarea,
    ToastManager,
    ToastVariantType,
    useMainContext,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as Error } from '../../../../assets/icons/ic-warning.svg'
import { importComponentFromFELibrary } from '../../../../components/common'
import { REQUIRED_FIELDS_MISSING } from '../../../../config'
import { API_COMPONENTS } from '../../../../config/constantMessaging'
import { createOrUpdateUser } from '../authorization.service'
import { getDefaultUserStatusAndTimeout } from '../libUtils'
import {
    PermissionConfigurationForm,
    PermissionConfigurationFormProvider,
    usePermissionConfiguration,
} from '../Shared/components/PermissionConfigurationForm'
import { createUserPermissionPayload, validateDirectPermissionForm } from '../utils'
import { FormType, GenerateTokenType } from './apiToken.type'
import { getDateInMilliseconds } from './apiToken.utils'
import ExpirationDate from './ExpirationDate'
import GenerateActionButton from './GenerateActionButton'
import GenerateModal from './GenerateModal'
import { createGeneratedAPIToken } from './service'
import { ValidationRules } from './validationRules'

const showStatus = !!importComponentFromFELibrary('StatusHeaderCell', null, 'function')

export const renderQuestionwithTippy = () => (
    <InfoIconTippy
        heading={API_COMPONENTS.TITLE}
        infoText={API_COMPONENTS.QUESTION_ICON_INFO}
        documentationLink="GLOBAL_CONFIG_API_TOKEN"
        documentationLinkText="View Documentation"
        iconClassName="icon-dim-20 fcn-9 ml-4"
    />
)

const CreateAPIToken = ({
    setShowGenerateModal,
    showGenerateModal,
    handleGenerateTokenActionButton,
    setSelectedExpirationDate,
    selectedExpirationDate,
    tokenResponse,
    setTokenResponse,
    reload,
}: GenerateTokenType) => {
    const history = useHistory()
    const match = useRouteMatch()
    const { serverMode } = useMainContext()
    const [loader, setLoader] = useState(false)
    const [formData, setFormData] = useState<FormType>({
        name: '',
        description: '',
        expireAtInMs: selectedExpirationDate ? getDateInMilliseconds(selectedExpirationDate.value) : undefined,
    })
    const [formDataErrorObj, setFormDataErrorObj] = useState<{
        invalidName: boolean
        invalidNameMessage: string
        invalidCustomDate: boolean
        invalidDescription: boolean
        invalidDescriptionMessage: string
    }>({
        invalidName: false,
        invalidNameMessage: '',
        invalidCustomDate: false,
        invalidDescription: false,
        invalidDescriptionMessage: '',
    })
    const {
        permissionType,
        directPermission,
        setDirectPermission,
        chartPermission,
        k8sPermission,
        userRoleGroups,
        isSaveDisabled,
        allowManageAllAccess,
    } = usePermissionConfiguration()
    const [customDate, setCustomDate] = useState<Moment>(null)
    const validationRules = new ValidationRules()

    // Reset selected expiration date to 30 days on unmount
    useEffect(
        () => (): void => {
            setSelectedExpirationDate({
                label: '30 days',
                value: 30,
            })
        },
        [],
    )

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
                invalidNameMessage: nameValidation.message,
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
        if (!validateDirectPermissionForm(directPermission, setDirectPermission, allowManageAllAccess).isValid) {
            return
        }

        const nameValidation = validationRules.name(formData.name)
        const descriptionValidation = validationRules.description(formData.description)
        const noCustomDate = formData.dateType === 'Custom' && !customDate
        if (!nameValidation.isValid || noCustomDate || !descriptionValidation.isValid) {
            setFormDataErrorObj({
                invalidName: !nameValidation.isValid,
                invalidNameMessage: nameValidation.message,
                invalidCustomDate: noCustomDate,
                invalidDescription: !descriptionValidation.isValid,
                invalidDescriptionMessage: descriptionValidation.message,
            })
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: REQUIRED_FIELDS_MISSING,
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
                const userPermissionPayload = createUserPermissionPayload({
                    id: result.userId,
                    userIdentifier: result.userIdentifier,
                    userRoleGroups,
                    serverMode,
                    directPermission,
                    chartPermission,
                    k8sPermission,
                    permissionType,
                    userGroups: [],
                    canManageAllAccess: allowManageAllAccess,
                    ...getDefaultUserStatusAndTimeout(),
                })

                const { result: userPermissionResponse } = await createOrUpdateUser(userPermissionPayload)
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
                        invalidNameMessage: _invalidNameErr.userMessage,
                    })
                }
            }
        } finally {
            setLoader(false)
        }
    }

    return (
        <div className="w-100 flexbox-col flex-grow-1 dc__content-space pb-16">
            <div className="px-20 pb-20">
                <div className="flex dc__content-space py-16 dc__gap-8">
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
                <div className="flexbox-col dc__gap-16">
                    <CustomInput
                        placeholder="Name"
                        data-testid="api-token-name-textbox"
                        name="name"
                        value={formData.name}
                        onChange={onChangeHandler}
                        error={formDataErrorObj.invalidName && formDataErrorObj.invalidNameMessage}
                        label="Name"
                        required
                    />
                    <Textarea
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={onChangeHandler}
                        placeholder="Enter a description to remember where you have used this token"
                        error={formDataErrorObj.invalidDescription && formDataErrorObj.invalidDescriptionMessage}
                    />
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
                                {/* eslint-disable-next-line react/no-unescaped-entities */}
                                Custom expiration can't be blank. Please select a date.
                            </span>
                        )}
                    </label>
                    <div className="dc__border-top" />
                    <PermissionConfigurationForm showUserPermissionGroupSelector isAddMode />
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
                disabled={isSaveDisabled}
            />

            <GenerateModal
                close={handleGenerateTokenActionButton}
                token={tokenResponse.token}
                reload={reload}
                redirectToTokenList={redirectToTokenList}
                open={showGenerateModal}
            />
        </div>
    )
}

const CreateAPITokenContainer = (props: GenerateTokenType) => (
    <PermissionConfigurationFormProvider data={null} showStatus={showStatus}>
        <CreateAPIToken {...props} />
    </PermissionConfigurationFormProvider>
)

export default CreateAPITokenContainer
