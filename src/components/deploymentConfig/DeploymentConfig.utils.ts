import * as jsonpatch from 'fast-json-patch'
import { applyPatch, getValueByPointer } from 'fast-json-patch'
import { BASIC_FIELD_MAPPING } from './constants'

const basicFieldArray = Object.keys(BASIC_FIELD_MAPPING)
let templateFromBasicValue

export const isBasicValueChanged = (modifiedTemplate, defaultTemplate?): boolean => {
    if (!templateFromBasicValue && !defaultTemplate) return false
    const _patchData = jsonpatch.compare(defaultTemplate || templateFromBasicValue, modifiedTemplate)
    for (let index = 0; index < _patchData.length; index++) {
        const path = _patchData[index].path
        for (let index = 0; index < basicFieldArray.length; index++) {
            if (path === BASIC_FIELD_MAPPING[basicFieldArray[index]]) {
                return true
            }
        }
    }
}

export const getBasicFieldValue = (template) => {
    templateFromBasicValue = template
    const _basicFieldValues = {}
    for (let index = 0; index < basicFieldArray.length; index++) {
        const key = basicFieldArray[index]
        _basicFieldValues[key] = getValueByPointer(template, BASIC_FIELD_MAPPING[key])
    }
    return _basicFieldValues
}

export const patchBasicFieldValue = (template) => {
    const _basicFieldValues = {}
    for (let index = 0; index < basicFieldArray.length; index++) {
        const key = basicFieldArray[index]
        _basicFieldValues[key] = getValueByPointer(template, BASIC_FIELD_MAPPING[key])
    }
    return _basicFieldValues
}

export const getUpdatedStateAndData = (defaultTemplate, modifiedTemplate, yamlMode) => {
    const result = {}
    // if(yamlMode){
    //   const _isBasicViewLocked = isBasicValueChanged(defaultTemplate, modifiedTemplate)
    //   result['isBasicViewLocked'] = _isBasicViewLocked
    //   result['yamlMode'] = !_isBasicViewLocked
    // } else{
    //   result['yamlMode'] = !yamlMode
    //   patchBasicFieldValue(modifiedTemplate)
    // }
    // const _isBasicViewLocked = isBasicValueChanged(defaultTemplate, modifiedTemplate)
    // if(_isBasicViewLocked){
    //   yamlMode
    // }
}
