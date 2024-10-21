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

import { FormEvent, useEffect, useState } from 'react'
import { showError, useAsync } from '../../../Common'
import { getBuildInfraProfileByName, createBuildInfraProfile, updateBuildInfraProfile } from './services'
import {
    BuildInfraConfigTypes,
    BuildInfraInheritActions,
    BuildInfraMetaConfigTypes,
    BuildInfraProfileData,
    HandleProfileInputChangeType,
    ProfileInputErrorType,
    UseBuildInfraFormProps,
    UseBuildInfraFormResponseType,
    ValidateRequestLimitResponseType,
    ValidateRequestLimitType,
} from './types'
import {
    BUILD_INFRA_INPUT_CONSTRAINTS,
    BUILD_INFRA_TEXT,
    DEFAULT_PROFILE_NAME,
    PROFILE_INPUT_ERROR_FIELDS,
    CREATE_MODE_REQUIRED_INPUT_FIELDS,
} from './constants'
import {
    validateDescription,
    validateName,
    validateRequiredPositiveNumber,
    getCommonSelectStyle,
    validateRequiredPositiveInteger,
    ToastVariantType,
    ToastManager,
} from '../../../Shared'

export const validateRequestLimit = ({
    request,
    limit,
    unitsMap,
}: ValidateRequestLimitType): ValidateRequestLimitResponseType => {
    // Request <= Limit
    // Request and Limit should be numbers can be decimals
    // Request and Limit should be positive numbers
    // Request and Limit should be less than Number.MAX_SAFE_INTEGER
    // Request and Limit should can have at most BUILD_INFRA_INPUT_CONSTRAINTS.DECIMAL_PLACES
    // Both request and limit should be there
    const requestNumber = Number(request.value)
    const limitNumber = Number(limit.value)
    const requestUnit = Number(unitsMap[request.unit]?.conversionFactor)
    const limitUnit = Number(unitsMap[limit.unit]?.conversionFactor)

    const requestLimitValidationResponse: ValidateRequestLimitResponseType = {
        request: {
            isValid: true,
        },
        limit: {
            isValid: true,
        },
    }

    const requestValidationMessage = validateRequiredPositiveNumber(request.value).message
    const limitValidationMessage = validateRequiredPositiveNumber(limit.value).message

    if (requestValidationMessage) {
        requestLimitValidationResponse.request = {
            message: requestValidationMessage,
            isValid: false,
        }
    }

    if (limitValidationMessage) {
        requestLimitValidationResponse.limit = {
            message: limitValidationMessage,
            isValid: false,
        }
    }

    if (limitValidationMessage || requestValidationMessage) {
        return requestLimitValidationResponse
    }

    // only two decimal places are allowed
    const requestDecimalPlaces = String(request.value).split('.')[1]?.length ?? 0
    const limitDecimalPlaces = String(limit.value).split('.')[1]?.length ?? 0

    if (requestDecimalPlaces > BUILD_INFRA_INPUT_CONSTRAINTS.DECIMAL_PLACES) {
        requestLimitValidationResponse.request = {
            message: BUILD_INFRA_TEXT.VALIDATE_REQUEST_LIMIT.REQUEST_DECIMAL_PLACES,
            isValid: false,
        }

        return requestLimitValidationResponse
    }
    if (limitDecimalPlaces > BUILD_INFRA_INPUT_CONSTRAINTS.DECIMAL_PLACES) {
        requestLimitValidationResponse.limit = {
            message: BUILD_INFRA_TEXT.VALIDATE_REQUEST_LIMIT.LIMIT_DECIMAL_PLACES,
            isValid: false,
        }

        return requestLimitValidationResponse
    }

    // Assuming requestUnit and requestNumber are not 0
    const limitRequestUnitFactor = limitUnit / requestUnit
    const limitRequestFactor = limitNumber / requestNumber

    const isDifferenceBigNumber = limitRequestUnitFactor * limitRequestFactor <= Number.MAX_SAFE_INTEGER

    if (!isDifferenceBigNumber) {
        requestLimitValidationResponse.request = {
            message: BUILD_INFRA_TEXT.VALIDATE_REQUEST_LIMIT.CAN_NOT_COMPUTE,
            isValid: false,
        }

        return requestLimitValidationResponse
    }

    if (limitRequestUnitFactor * limitRequestFactor < 1) {
        requestLimitValidationResponse.request = {
            message: BUILD_INFRA_TEXT.VALIDATE_REQUEST_LIMIT.REQUEST_LESS_THAN_LIMIT,
            isValid: false,
        }

        return requestLimitValidationResponse
    }

    return requestLimitValidationResponse
}

const getInitialProfileInputErrors = (fromCreateView: boolean): ProfileInputErrorType => {
    if (fromCreateView) {
        const initialProfileInputErrors = { ...PROFILE_INPUT_ERROR_FIELDS }
        CREATE_MODE_REQUIRED_INPUT_FIELDS.forEach((field) => {
            initialProfileInputErrors[field] = ''
        })
        return initialProfileInputErrors
    }

    return {
        ...PROFILE_INPUT_ERROR_FIELDS,
    }
}

export const useBuildInfraForm = ({
    name,
    editProfile,
    handleSuccessRedirection,
}: UseBuildInfraFormProps): UseBuildInfraFormResponseType => {
    const fromCreateView = !name

    const [isLoading, profileResponse, responseError, reloadRequest] = useAsync(
        () =>
            getBuildInfraProfileByName({
                name: name ?? DEFAULT_PROFILE_NAME,
                fromCreateView,
            }),
        [name],
    )
    // If configuration is existing and is active then use it else use default from profileResponse
    const [profileInput, setProfileInput] = useState<BuildInfraProfileData>(null)
    const [profileInputErrors, setProfileInputErrors] = useState<ProfileInputErrorType>({
        ...PROFILE_INPUT_ERROR_FIELDS,
    })
    const [loadingActionRequest, setLoadingActionRequest] = useState<boolean>(false)

    useEffect(() => {
        if (!isLoading && profileResponse?.configurationUnits && profileResponse?.profile) {
            setProfileInput({
                ...profileResponse.profile,
            })

            setProfileInputErrors(getInitialProfileInputErrors(fromCreateView))
        }
    }, [profileResponse, isLoading])

    // NOTE: Currently sending and receiving values as string, but will parse it to number for payload
    const handleProfileInputChange = ({ action, data }: HandleProfileInputChangeType) => {
        const currentInput = { ...profileInput }
        const currentInputErrors = { ...profileInputErrors }
        const lastSavedConfiguration = profileResponse.profile.configurations
        const currentConfiguration = currentInput.configurations
        const { value, unit } = data ?? { value: null, unit: null }

        switch (action) {
            case BuildInfraMetaConfigTypes.DESCRIPTION:
                currentInput.description = value
                currentInputErrors.description = validateDescription(value).message
                break

            case BuildInfraMetaConfigTypes.NAME:
                currentInput.name = value
                currentInputErrors.name = validateName(value).message
                break

            case BuildInfraConfigTypes.CPU_LIMIT: {
                currentConfiguration[BuildInfraConfigTypes.CPU_LIMIT] = {
                    ...currentConfiguration[BuildInfraConfigTypes.CPU_LIMIT],
                    value,
                    unit,
                }
                const { request, limit } = validateRequestLimit({
                    request: {
                        value: currentConfiguration[BuildInfraConfigTypes.CPU_REQUEST].value,
                        unit: currentConfiguration[BuildInfraConfigTypes.CPU_REQUEST].unit,
                    },
                    limit: {
                        value,
                        unit,
                    },
                    unitsMap: profileResponse.configurationUnits[BuildInfraConfigTypes.CPU_LIMIT],
                })

                currentInputErrors[BuildInfraConfigTypes.CPU_LIMIT] = limit.message
                currentInputErrors[BuildInfraConfigTypes.CPU_REQUEST] = request.message
                break
            }

            case BuildInfraConfigTypes.CPU_REQUEST: {
                currentConfiguration[BuildInfraConfigTypes.CPU_REQUEST] = {
                    ...currentConfiguration[BuildInfraConfigTypes.CPU_REQUEST],
                    value,
                    unit,
                }
                const { request, limit } = validateRequestLimit({
                    request: {
                        value,
                        unit,
                    },
                    limit: {
                        value: currentConfiguration[BuildInfraConfigTypes.CPU_LIMIT].value,
                        unit: currentConfiguration[BuildInfraConfigTypes.CPU_LIMIT].unit,
                    },
                    unitsMap: profileResponse.configurationUnits[BuildInfraConfigTypes.CPU_LIMIT],
                })

                currentInputErrors[BuildInfraConfigTypes.CPU_LIMIT] = limit.message
                currentInputErrors[BuildInfraConfigTypes.CPU_REQUEST] = request.message
                break
            }

            case BuildInfraConfigTypes.MEMORY_LIMIT: {
                currentConfiguration[BuildInfraConfigTypes.MEMORY_LIMIT] = {
                    ...currentConfiguration[BuildInfraConfigTypes.MEMORY_LIMIT],
                    value,
                    unit,
                }
                const { request, limit } = validateRequestLimit({
                    request: {
                        value: currentConfiguration[BuildInfraConfigTypes.MEMORY_REQUEST].value,
                        unit: currentConfiguration[BuildInfraConfigTypes.MEMORY_REQUEST].unit,
                    },
                    limit: {
                        value,
                        unit,
                    },
                    unitsMap: profileResponse.configurationUnits[BuildInfraConfigTypes.MEMORY_LIMIT],
                })

                currentInputErrors[BuildInfraConfigTypes.MEMORY_LIMIT] = limit.message
                currentInputErrors[BuildInfraConfigTypes.MEMORY_REQUEST] = request.message
                break
            }

            case BuildInfraConfigTypes.MEMORY_REQUEST: {
                currentConfiguration[BuildInfraConfigTypes.MEMORY_REQUEST] = {
                    ...currentConfiguration[BuildInfraConfigTypes.MEMORY_REQUEST],
                    value,
                    unit,
                }
                const { request, limit } = validateRequestLimit({
                    request: {
                        value,
                        unit,
                    },
                    limit: {
                        value: currentConfiguration[BuildInfraConfigTypes.MEMORY_LIMIT].value,
                        unit: currentConfiguration[BuildInfraConfigTypes.MEMORY_LIMIT].unit,
                    },
                    unitsMap: profileResponse.configurationUnits[BuildInfraConfigTypes.MEMORY_LIMIT],
                })

                currentInputErrors[BuildInfraConfigTypes.MEMORY_LIMIT] = limit.message
                currentInputErrors[BuildInfraConfigTypes.MEMORY_REQUEST] = request.message
                break
            }

            case BuildInfraConfigTypes.BUILD_TIMEOUT: {
                currentConfiguration[BuildInfraConfigTypes.BUILD_TIMEOUT] = {
                    ...currentConfiguration[BuildInfraConfigTypes.BUILD_TIMEOUT],
                    value,
                    unit,
                }

                currentInputErrors[BuildInfraConfigTypes.BUILD_TIMEOUT] = validateRequiredPositiveInteger(value).message
                break
            }

            case BuildInfraInheritActions.ACTIVATE_CPU:
                currentConfiguration[BuildInfraConfigTypes.CPU_LIMIT] = {
                    ...lastSavedConfiguration[BuildInfraConfigTypes.CPU_LIMIT],
                    value: lastSavedConfiguration[BuildInfraConfigTypes.CPU_LIMIT].value,
                    unit: lastSavedConfiguration[BuildInfraConfigTypes.CPU_LIMIT].unit,
                    active: true,
                }
                currentConfiguration[BuildInfraConfigTypes.CPU_REQUEST] = {
                    ...lastSavedConfiguration[BuildInfraConfigTypes.CPU_REQUEST],
                    value: lastSavedConfiguration[BuildInfraConfigTypes.CPU_REQUEST].value,
                    unit: lastSavedConfiguration[BuildInfraConfigTypes.CPU_REQUEST].unit,
                    active: true,
                }

                currentInputErrors[BuildInfraConfigTypes.CPU_LIMIT] = null
                currentInputErrors[BuildInfraConfigTypes.CPU_REQUEST] = null
                break

            case BuildInfraInheritActions.ACTIVATE_MEMORY:
                currentConfiguration[BuildInfraConfigTypes.MEMORY_LIMIT] = {
                    ...lastSavedConfiguration[BuildInfraConfigTypes.MEMORY_LIMIT],
                    value: lastSavedConfiguration[BuildInfraConfigTypes.MEMORY_LIMIT].value,
                    unit: lastSavedConfiguration[BuildInfraConfigTypes.MEMORY_LIMIT].unit,
                    active: true,
                }
                currentConfiguration[BuildInfraConfigTypes.MEMORY_REQUEST] = {
                    ...lastSavedConfiguration[BuildInfraConfigTypes.MEMORY_REQUEST],
                    value: lastSavedConfiguration[BuildInfraConfigTypes.MEMORY_REQUEST].value,
                    unit: lastSavedConfiguration[BuildInfraConfigTypes.MEMORY_REQUEST].unit,
                    active: true,
                }

                currentInputErrors[BuildInfraConfigTypes.MEMORY_LIMIT] = null
                currentInputErrors[BuildInfraConfigTypes.MEMORY_REQUEST] = null
                break

            case BuildInfraInheritActions.ACTIVATE_BUILD_TIMEOUT:
                currentConfiguration[BuildInfraConfigTypes.BUILD_TIMEOUT] = {
                    ...lastSavedConfiguration[BuildInfraConfigTypes.BUILD_TIMEOUT],
                    value: lastSavedConfiguration[BuildInfraConfigTypes.BUILD_TIMEOUT].value,
                    unit: lastSavedConfiguration[BuildInfraConfigTypes.BUILD_TIMEOUT].unit,
                    active: true,
                }

                currentInputErrors[BuildInfraConfigTypes.BUILD_TIMEOUT] = null
                break

            case BuildInfraInheritActions.DE_ACTIVATE_BUILD_TIMEOUT:
                // Reverting the value and unit to defaultValues
                currentConfiguration[BuildInfraConfigTypes.BUILD_TIMEOUT] = {
                    ...currentConfiguration[BuildInfraConfigTypes.BUILD_TIMEOUT],
                    value: lastSavedConfiguration[BuildInfraConfigTypes.BUILD_TIMEOUT].defaultValue.value,
                    unit: lastSavedConfiguration[BuildInfraConfigTypes.BUILD_TIMEOUT].defaultValue.unit,
                    active: false,
                }

                currentInputErrors[BuildInfraConfigTypes.BUILD_TIMEOUT] = null
                break

            case BuildInfraInheritActions.DE_ACTIVATE_CPU:
                currentConfiguration[BuildInfraConfigTypes.CPU_LIMIT] = {
                    ...currentConfiguration[BuildInfraConfigTypes.CPU_LIMIT],
                    value: lastSavedConfiguration[BuildInfraConfigTypes.CPU_LIMIT].defaultValue.value,
                    unit: lastSavedConfiguration[BuildInfraConfigTypes.CPU_LIMIT].defaultValue.unit,
                    active: false,
                }
                currentConfiguration[BuildInfraConfigTypes.CPU_REQUEST] = {
                    ...currentConfiguration[BuildInfraConfigTypes.CPU_REQUEST],
                    value: lastSavedConfiguration[BuildInfraConfigTypes.CPU_REQUEST].defaultValue.value,
                    unit: lastSavedConfiguration[BuildInfraConfigTypes.CPU_REQUEST].defaultValue.unit,
                    active: false,
                }

                currentInputErrors[BuildInfraConfigTypes.CPU_LIMIT] = null
                currentInputErrors[BuildInfraConfigTypes.CPU_REQUEST] = null
                break

            case BuildInfraInheritActions.DE_ACTIVATE_MEMORY:
                currentConfiguration[BuildInfraConfigTypes.MEMORY_LIMIT] = {
                    ...currentConfiguration[BuildInfraConfigTypes.MEMORY_LIMIT],
                    value: lastSavedConfiguration[BuildInfraConfigTypes.MEMORY_LIMIT].defaultValue.value,
                    unit: lastSavedConfiguration[BuildInfraConfigTypes.MEMORY_LIMIT].defaultValue.unit,
                    active: false,
                }
                currentConfiguration[BuildInfraConfigTypes.MEMORY_REQUEST] = {
                    ...currentConfiguration[BuildInfraConfigTypes.MEMORY_REQUEST],
                    value: lastSavedConfiguration[BuildInfraConfigTypes.MEMORY_REQUEST].defaultValue.value,
                    unit: lastSavedConfiguration[BuildInfraConfigTypes.MEMORY_REQUEST].defaultValue.unit,
                    active: false,
                }

                currentInputErrors[BuildInfraConfigTypes.MEMORY_LIMIT] = null
                currentInputErrors[BuildInfraConfigTypes.MEMORY_REQUEST] = null
                break

            default:
                throw new Error(BUILD_INFRA_TEXT.getInvalidActionMessage(action))
        }

        setProfileInput(currentInput)
        setProfileInputErrors(currentInputErrors)
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        // Since considering '' as a valid error message
        const hasErrors =
            Object.keys(profileInputErrors).filter(
                (item) => profileInputErrors[item] !== null && profileInputErrors[item] !== undefined,
            ).length > 0

        if (hasErrors) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: BUILD_INFRA_TEXT.INVALID_FORM_MESSAGE,
            })
            return
        }

        setLoadingActionRequest(true)
        try {
            if (editProfile) {
                await updateBuildInfraProfile({ name, profileInput })
            } else {
                await createBuildInfraProfile({ profileInput })
            }
            setLoadingActionRequest(false)
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: BUILD_INFRA_TEXT.getSubmitSuccessMessage(profileInput.name, editProfile),
            })

            if (handleSuccessRedirection) {
                handleSuccessRedirection()
            } else {
                reloadRequest()
            }
        } catch (err) {
            showError(err)
            setLoadingActionRequest(false)
        }
    }

    return {
        isLoading,
        profileResponse,
        responseError,
        reloadRequest,
        profileInput,
        profileInputErrors,
        handleProfileInputChange,
        loadingActionRequest,
        handleSubmit,
    }
}

export const unitSelectorStyles = () =>
    getCommonSelectStyle({
        control: (base, state) => ({
            ...base,
            borderRadius: 0,
            backgroundColor: 'var(--N0)',
            border: state.isFocused ? '1px solid var(--B500) !important' : '1px solid var(--N200)',
            alignItems: 'center',
            cursor: 'pointer',
            borderTopRightRadius: '4px',
            borderBottomRightRadius: '4px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            outline: 'none',
            boxShadow: 'none',
            '&:hover': {
                border: '1px solid var(--N400)',
            },
        }),
        indicatorContainer: (base) => ({
            ...base,
            padding: '0px',
        }),
        dropdownIndicator: (base, state) => ({
            ...base,
            color: 'var(--N600)',
            transition: 'all .2s ease',
            transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        }),
        option: (base, state) => ({
            ...base,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            ...(state.isFocused
                ? {
                      backgroundColor: 'var(--N50)',
                  }
                : {}),
            ...(state.isSelected && {
                backgroundColor: 'var(--B100)',
                fontWeight: 600,
                color: 'var(--B500)',
            }),
            '&:active': {
                backgroundColor: 'var(--N50)',
            },
        }),
        valueContainer: (base) => ({
            ...base,
            color: 'var(--N900)',
            fontSize: '13px',
            fontWeight: '400',
            lineHeight: '20px',
        }),
        menuList: (base) => ({
            ...base,
            maxHeight: '164px',
            height: '100%',
        }),
    })
