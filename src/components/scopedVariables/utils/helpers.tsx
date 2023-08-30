import yaml from 'js-yaml'
import { get, post } from '@devtron-labs/devtron-fe-common-lib'
import { ScopedVariablesDataI, ValidatorT } from '../types'
import {
    EMPTY_FILE_STATUS,
    FILE_NOT_SUPPORTED_STATUS,
    PARSE_ERROR_STATUS,
    JSON_PARSE_ERROR_STATUS,
    YAML_PARSE_ERROR_STATUS,
    ROUTES,
} from '../constants'

export const validator: ValidatorT = ({ data, type }) => {
    if (!data) {
        return EMPTY_FILE_STATUS
    }
    switch (type) {
        case 'application/json':
            try {
                const parsedData = JSON.parse(data)
                if (parsedData && typeof parsedData === 'object') {
                    return {
                        status: true,
                        message: {
                            data: yaml.safeDump(parsedData),
                            description: 'File uploaded successfully',
                        },
                    }
                }
                return PARSE_ERROR_STATUS
            } catch (e) {
                return JSON_PARSE_ERROR_STATUS
            }
        case 'application/x-yaml':
        case 'application/yaml':
        case 'text/yaml':
        case 'text/x-yaml':
            try {
                const parsedData = yaml.safeLoad(data)
                if (parsedData && typeof parsedData === 'object') {
                    return {
                        status: true,
                        message: {
                            data: yaml.safeDump(parsedData),
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

export const parseIntoYAMLString = (data: any) => {
    return yaml.safeDump(data)
}

export const parseYAMLStringToObj = (data: string) => {
    return yaml.safeLoad(data)
}

export const sortVariables = (variablesObj: ScopedVariablesDataI): ScopedVariablesDataI => {
    /*
        Approach:
        Sorting is going to happen on multiple levels:
        1) First we are going to sort the spec array based on the name of the variable
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

// Services
export const getScopedVariablesJSON = () => {
    return get(ROUTES.GET_SCOPED_VARIABLES_JSON)
}

export const postScopedVariables = (data: any) => {
    const payload = {
        manifest: data,
    }
    return post(ROUTES.SCOPED_VARIABLES, payload)
}
