import * as jsonpatch from 'fast-json-patch'
import { getValueByPointer, applyPatch } from 'fast-json-patch'
import { BASIC_FIELDS, BASIC_FIELD_MAPPING, BASIC_FIELD_PARENT_PATH } from './constants'
import { BasicFieldErrorObj, DeploymentConfigStateAction, DeploymentConfigStateActionTypes } from './types'
import { ValidationRules } from './validationRules'
import { ServerErrors, showError } from '@devtron-labs/devtron-fe-common-lib'
import moment from 'moment'

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
    if (err?.code === 423) {
        if (action === 3) {
            dispatch({ type: DeploymentConfigStateActionTypes.toggleDeleteOverrideDraftModal })
        } else {
            dispatch({ type: DeploymentConfigStateActionTypes.toggleSaveChangesModal })
        }
        reloadEnvironments()
        return
    }
    showError(err)
}

export function groupDataByType(data) {
    // Create a Map to store grouped objects by type
    const groupedData = new Map()

    // Iterate through the data and group objects by type
    data.forEach((item) => {
        const type = item.type

        if (!groupedData.has(type)) {
            groupedData.set(type, [])
        }

        groupedData.get(type).push(item)
    })

    // Convert the grouped data into an array of arrays
    return [...groupedData.values()]
}

export function formatTimestamp(jsonTimestamp) {
    // Parse the JSON timestamp using Moment.js
    const timestamp = moment(jsonTimestamp)

    // Define the desired output format
    return timestamp.format('ddd, MMM YYYY, hh:mm A')
}

export function textDecider(option, charts) {
    let text

    switch (option.type) {
        case 1:
            text = `v${option.chartVersion} (Default)`
            break

        case 2:
        case 4:
            const c = charts.find((chart) => chart.value === option.chartRefId)
            text = `${option.environmentName ? option.environmentName : ''} ${
                option.chartVersion ? `(v${option.chartVersion})` : `(${c?.label.split(' ')[0]})`
            }`
            break

        case 3:
            const c3 = charts.find((chart) => chart.value === option.chartRefId)
            text = `${formatTimestamp(option.finishedOn)} ${
                option.chartVersion ? `(v${option.chartVersion})` : `(${c3?.label.split(' ')[0]})`
            }`
            break

        default:
            text = ''
            break
    }
    return text
}

export const getPosition = (isValues: boolean, isEnv: boolean, type: number) => {
    if (isValues && isEnv) {
        if (type === 3) return 1
        if (type === 2) return 2
        if (type === 1) return 3
    } else if (isValues) {
        if (type === 2) return 1
        if (type === 1) return 2
    } else if (isEnv) {
        if (type === 3) return 1
        if (type === 4) return 2
        if (type === 2) return 3
    } else {
        if (type === 4) return 1
        if (type === 2) return 2
    }
}
