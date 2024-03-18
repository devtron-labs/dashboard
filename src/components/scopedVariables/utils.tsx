// @ts-nocheck
import yaml from 'yaml'
import { ScopedVariablesDataType } from './types'
import { FileReaderStatus, ValidatorType, FileDataType } from '../common/hooks/types'
import { MIME_TYPE, FILE_EXTENSION } from '../common/helpers/types'
import {
    EMPTY_FILE_STATUS,
    FILE_NOT_SUPPORTED_STATUS,
    PARSE_ERROR_STATUS,
    JSON_PARSE_ERROR_STATUS,
    YAML_PARSE_ERROR_STATUS,
} from './constants'

export const getFileMimeType = (fileDataName: string): MIME_TYPE => {
    const fileType = fileDataName.split('.').pop()
    switch (fileType) {
        case FILE_EXTENSION.YAML:
        case FILE_EXTENSION.YML:
            return MIME_TYPE.TEXT_YAML
        case FILE_EXTENSION.JSON:
            return MIME_TYPE.APPLICATION_JSON
        default:
            return MIME_TYPE.PLAIN_TEXT
    }
}

export const validator: ValidatorType = ({ data, type }) => {
    if (!data) {
        return EMPTY_FILE_STATUS
    }
    switch (type) {
        case MIME_TYPE.APPLICATION_JSON:
            try {
                const parsedData = JSON.parse(data)
                if (parsedData && typeof parsedData === 'object') {
                    return {
                        status: FileReaderStatus.SUCCESS,
                        message: {
                            data: yaml.stringify(parsedData, { simpleKeys: true }),
                            description: 'File uploaded successfully',
                        },
                    }
                }
                return PARSE_ERROR_STATUS
            } catch (e) {
                return JSON_PARSE_ERROR_STATUS
            }
        case MIME_TYPE.APPLICATION_X_YAML:
        case MIME_TYPE.APPLICATION_YAML:
        case MIME_TYPE.TEXT_YAML:
        case MIME_TYPE.TEXT_X_YAML:
            try {
                const parsedData = yaml.parse(data)
                if (parsedData && typeof parsedData === 'object') {
                    return {
                        status: FileReaderStatus.SUCCESS,
                        message: {
                            data: yaml.stringify(parsedData, { simpleKeys: true }),
                            description: 'File uploaded successfully',
                        },
                    }
                }
                return PARSE_ERROR_STATUS
            } catch (e) {
                return YAML_PARSE_ERROR_STATUS
            }
        default:
            return FILE_NOT_SUPPORTED_STATUS
    }
}

export const downloadData = (data: string, filename: string, type: string) => {
    const blob = new Blob([data], { type })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
}

export const parseIntoYAMLString = (data: any) => yaml.stringify(data, { simpleKeys: true })

export const parseYAMLStringToObj = (data: string) => yaml.parse(data)

export const sortVariables = (variablesObj: ScopedVariablesDataType): ScopedVariablesDataType => {
    /*
        Approach:
        Sorting is going to happen on multiple levels:
        1) First we are going to sort the spec array based on the name of the variable, the order is ensured to be unique since the name is unique
        2) Then we are going to sort based on the values array based on the category of the variable, The precendence is as follows:
            i) ApplicationEnv
            ii) Application
            iii) Env
            iv) Cluster
            v) Global
           If the values array has multiple values with the same category, then we are going to sort them based on the attributeSelectors key
           In case of Global there are no selectors but that won't be trouble since only one global will be there
    */
    const mutatedVariablesObj = JSON.parse(JSON.stringify(variablesObj))

    // Sorting on the basis of name
    mutatedVariablesObj.spec.sort((a, b) => {
        if (a.name < b.name) {
            return -1
        }
        if (a.name > b.name) {
            return 1
        }
        return 0
    })

    // Soring on the basis of category
    const precedingOrder = ['ApplicationEnv', 'Application', 'Env', 'Cluster', 'Global']
    mutatedVariablesObj.spec.forEach((variablesObj) => {
        variablesObj.values.sort((a, b) => {
            if (precedingOrder.indexOf(a.category) < precedingOrder.indexOf(b.category)) {
                return -1
            }
            if (precedingOrder.indexOf(a.category) > precedingOrder.indexOf(b.category)) {
                return 1
            }
            if (a.category === b.category) {
                if (a.selectors.attributeSelectors && b.selectors.attributeSelectors) {
                    const keys = Object.keys(a.selectors.attributeSelectors)
                    let flag = 0
                    keys.forEach((key) => {
                        if (a.selectors.attributeSelectors[key] < b.selectors.attributeSelectors[key]) {
                            flag = -1
                        }
                        if (a.selectors.attributeSelectors[key] > b.selectors.attributeSelectors[key]) {
                            flag = 1
                        }
                    })
                    return flag
                }
            }
            return 0
        })
    })

    return mutatedVariablesObj
}
