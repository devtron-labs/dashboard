import * as jsonpatch from 'fast-json-patch'
import { getValueByPointer, applyPatch } from 'fast-json-patch'
import { BASIC_FIELDS, BASIC_FIELD_MAPPING, BASIC_FIELD_PARENT_PATH } from './constants'
import { BasicFieldErrorObj, DeploymentConfigStateAction, DeploymentConfigStateActionTypes } from './types'
import { ValidationRules } from './validationRules'
import { ServerErrors, showError } from '@devtron-labs/devtron-fe-common-lib'

const basicFieldArray = Object.keys(BASIC_FIELD_MAPPING)
let templateFromBasicValue
const validationRules = new ValidationRules()

export const updateTemplateFromBasicValue = (template): void => {
    templateFromBasicValue = template
}

export const isBasicValueChanged = (modifiedTemplate, defaultTemplate?): boolean => {
    if (templateFromBasicValue || defaultTemplate) {
        const _patchData = jsonpatch.compare(defaultTemplate || templateFromBasicValue, modifiedTemplate)
        for (let index = 0; index < _patchData.length; index++) {
            const path = _patchData[index].path
            for (let index = 0; index < basicFieldArray.length; index++) {
                if (
                    (path.indexOf(BASIC_FIELD_MAPPING[basicFieldArray[index]]) === 0 && !path.includes('pathType')) ||
                    path === BASIC_FIELD_PARENT_PATH[BASIC_FIELDS.INGRESS] ||
                    path === BASIC_FIELD_PARENT_PATH[BASIC_FIELDS.CONTAINER_PORT]
                ) {
                    return true
                }
            }
        }
    }
    return false
}

export const getBasicFieldValue = (template) => {
    templateFromBasicValue = { ...template }
    const _basicFieldValues: Record<string, any> = {}
    for (let index = 0; index < basicFieldArray.length; index++) {
        const key = basicFieldArray[index]
        try {
            if (key === BASIC_FIELDS.RESOURCES) {
                const resources = getValueByPointer(template, BASIC_FIELD_MAPPING[BASIC_FIELDS.RESOURCES])
                _basicFieldValues[BASIC_FIELDS.RESOURCES] = {
                    [BASIC_FIELDS.LIMITS]: resources[BASIC_FIELDS.LIMITS],
                    [BASIC_FIELDS.REQUESTS]: resources[BASIC_FIELDS.LIMITS],
                }
            }
            _basicFieldValues[key] = getValueByPointer(template, BASIC_FIELD_MAPPING[key])
        } catch (error) {}
    }
    _basicFieldValues[BASIC_FIELDS.HOSTS] = _basicFieldValues[BASIC_FIELDS.HOSTS]
        ? [_basicFieldValues[BASIC_FIELDS.HOSTS][0]]
        : []
    return _basicFieldValues
}

export const validateBasicView = (basicFieldValues: Record<string, any>): BasicFieldErrorObj => {
    const _portValidation = validationRules.port(Number(basicFieldValues[BASIC_FIELDS.PORT]))
    const _cpuValidation = validationRules.port(
        basicFieldValues[BASIC_FIELDS.RESOURCES]?.[BASIC_FIELDS.LIMITS]?.[BASIC_FIELDS.CPU],
    )
    const _memoryValidation = validationRules.port(
        basicFieldValues[BASIC_FIELDS.RESOURCES]?.[BASIC_FIELDS.LIMITS]?.[BASIC_FIELDS.MEMORY],
    )
    const _basicFieldErrorObj = {
        isValid: _portValidation.isValid && _cpuValidation.isValid && _memoryValidation.isValid,
        port: _portValidation,
        cpu: _cpuValidation,
        memory: _memoryValidation,
        envVariables: [],
    }
    for (let index = 0; index < basicFieldValues[BASIC_FIELDS.ENV_VARIABLES]?.length; index++) {
        const element = basicFieldValues[BASIC_FIELDS.ENV_VARIABLES][index]
        const _envVariableValidation = validationRules.envVariable(element)
        _basicFieldErrorObj.envVariables.push(_envVariableValidation)
        _basicFieldErrorObj.isValid = _basicFieldErrorObj.isValid && _envVariableValidation.isValid
    }
    return _basicFieldErrorObj
}

export const patchBasicData = (_template, basicFieldValues: Record<string, any>) => {
    const basicFieldPatchData = []
    const basicFieldValuesKey = Object.keys(basicFieldValues)
    for (let index = 0; index < basicFieldValuesKey.length; index++) {
        const key = basicFieldArray[index]
        basicFieldPatchData.push({
            op: 'replace',
            path: BASIC_FIELD_MAPPING[key],
            value: basicFieldValues[key],
        })
    }
    return applyPatch(_template, basicFieldPatchData).newDocument
}

export const handleConfigProtectionError = (
    action: number,
    err: any,
    dispatch: (value: DeploymentConfigStateAction) => void,
    reloadEnvironments: () => void,
): void => {
    if (err instanceof ServerErrors && Array.isArray(err.errors)) {
        for (const error of err.errors) {
            if (error.code === 423) {
                if (action === 3) {
                    dispatch({ type: DeploymentConfigStateActionTypes.toggleDeleteOverrideDraftModal })
                } else {
                    dispatch({ type: DeploymentConfigStateActionTypes.toggleSaveChangesModal })
                }
                reloadEnvironments()
                return
            }
        }
    } else {
        showError(err)
    }
}
