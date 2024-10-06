import YAML from 'yaml'

import {
    CMSecretExternalType,
    UseFormValidation,
    UseFormValidations,
    YAMLStringify,
} from '@devtron-labs/devtron-fe-common-lib'

import { PATTERNS } from '@Config/constants'
import { ValidationRules } from '@Components/cdPipeline/validationRules'

import { CONFIG_MAP_SECRET_NO_DATA_ERROR, CONFIG_MAP_SECRET_YAML_PARSE_ERROR, SECRET_TOAST_INFO } from './constants'
import { getESOSecretDataFromYAML, hasESO } from './utils'
import { ConfigMapSecretUseFormProps } from './types'

/**
 * Validates a YAML string for proper structure and specific key/value constraints.
 *
 * @param yaml - The YAML string to be validated.
 * @returns Use Form Custom Validation
 */
const validateYaml = (yaml: string): UseFormValidation['custom'] => {
    try {
        // Check if the YAML string is empty or undefined, if so, throw a no-data error.
        if (!yaml) {
            throw new Error(CONFIG_MAP_SECRET_NO_DATA_ERROR)
        }

        // Parse the YAML string into a JSON object.
        const json = YAML.parse(yaml)

        // Ensure the parsed object is of type 'object', otherwise throw an error.
        if (typeof json === 'object') {
            // Regular expression pattern to validate ConfigMap and Secret keys.
            const keyPattern = new RegExp(PATTERNS.CONFIG_MAP_AND_SECRET_KEY)
            const errorKeys = [] // To store keys that do not match the key pattern.
            const errorValues = [] // To store values that are boolean or numeric, which should be quoted.

            // Iterate through the object keys and validate each key-value pair.
            Object.keys(json).forEach((k) => {
                // If a key or its corresponding value is empty, throw a no-data error.
                if (!k && !json[k]) {
                    throw new Error(CONFIG_MAP_SECRET_NO_DATA_ERROR)
                }

                // Convert the value to a string for easier validation, handle nested objects using YAMLStringify.
                const v = json[k] && typeof json[k] === 'object' ? YAMLStringify(json[k]) : json[k].toString()

                // Check if the key matches the pattern, if not, add it to the errorKeys list.
                if (!(k && keyPattern.test(k))) {
                    errorKeys.push(k)
                }

                // If the value is a boolean or number, add it to the errorValues list for improper quoting.
                if (v && (typeof json[k] === 'boolean' || typeof json[k] === 'number')) {
                    errorValues.push(v)
                }
            })

            let updatedError = ''

            // If there are invalid keys, append a message listing the problematic keys.
            if (errorKeys.length > 0) {
                updatedError = `Error: Keys can contain: (Alphanumeric) (-) (_) (.) | Invalid key(s): ${errorKeys
                    .map((e) => `"${e}"`)
                    .join(', ')}`
            }

            // If there are boolean or numeric values not wrapped in quotes, append another error message.
            if (errorValues.length > 0) {
                if (updatedError !== '') {
                    updatedError += '\n' // Separate key and value error messages by a new line.
                }
                updatedError += `Error: Boolean and numeric values must be wrapped in double quotes Eg. ${errorValues
                    .map((e) => `"${e}"`)
                    .join(', ')}`
            }

            // Return the validation result
            return {
                isValid: () => !updatedError, // Validation is valid if no error messages are present.
                message: updatedError, // The generated error message (if any).
            }
        }

        // If the parsed result is not an object, throw a yaml parse error.
        throw new Error(CONFIG_MAP_SECRET_YAML_PARSE_ERROR)
    } catch (err) {
        // Catch any errors, and return an invalid result with a relevant message.
        return {
            isValid: () => false, // Always return false when an error occurs.
            message: err.message.replace(/[\s]+/g, ' '), // Display a parsing error if applicable.
        }
    }
}

/**
 * Validates a YAML string representing an External Secret Operator (ESO) secret configuration.
 *
 * @param esoSecretYaml - The YAML string to be validated.
 * @returns Use Form Validation
 */
const validateEsoSecretYaml = (esoSecretYaml: string): UseFormValidation => {
    try {
        // Check if the provided YAML string is empty or undefined, and throw a no-data error.
        if (!esoSecretYaml) {
            throw new Error(CONFIG_MAP_SECRET_NO_DATA_ERROR)
        }

        // Parse the YAML string into a JSON object.
        const json = getESOSecretDataFromYAML(esoSecretYaml)

        // Ensure the parsed result is non-null before proceeding with further validation.
        if (json) {
            // Validation logic:
            // 1. Ensure only one of 'esoData' or 'esoDataFrom' is provided, not both.
            // 2. Either 'esoData' or 'esoDataFrom' must be provided (at least one is required).
            // 3. Ensure that exactly one of 'secretStore' or 'secretStoreRef' is provided (not both or neither).
            let isValid =
                !(json.esoData && json.esoDataFrom) && // Rule 1: Only one of 'esoData' or 'esoDataFrom'
                (json.esoData || json.esoDataFrom) && // Rule 2: At least one must be present
                !json.secretStore !== !json.secretStoreRef // Rule 3: Exactly one of 'secretStore' or 'secretStoreRef'
            let errorMessage = ''

            // Validation logic for 'esoData' array:
            // 1. Check if 'esoData' exists and the previous validation ('isValid') passed.
            // 2. For each entry in 'esoData', ensure both 'secretKey' and 'key' are present and truthy.
            //    If any entry is missing either 'secretKey' or 'key', set 'isValid' to false.
            if (json.esoData && isValid) {
                isValid = json.esoData?.reduce(
                    (_isValid, s) =>
                        // Rule: Both 'secretKey' and 'key' must exist and be truthy for each entry.
                        _isValid && !!s?.secretKey && !!s.key,
                    isValid, // Keep track of overall validity
                )
            }

            // Set error messages based on the provided 'secretStore', 'secretStoreRef', and 'esoData'/'esoDataFrom':
            if (json.esoDataFrom && json.esoData) {
                // Error: Both 'esoData' and 'esoDataFrom' are provided, which is invalid.
                errorMessage = SECRET_TOAST_INFO.BOTH_ESO_DATA_AND_DATA_FROM_AVAILABLE
            } else if (!json.esoDataFrom && !json.esoData) {
                // Error: Neither 'esoData' nor 'esoDataFrom' is provided, at least one is required.
                errorMessage = SECRET_TOAST_INFO.BOTH_ESO_DATA_AND_DATA_FROM_UNAVAILABLE
            } else if (json.secretStore && json.secretStoreRef) {
                // Error: Both 'secretStore' and 'secretStoreRef' are provided, only one should be.
                errorMessage = SECRET_TOAST_INFO.BOTH_STORE_AVAILABLE
            } else if (json.secretStore || json.secretStoreRef) {
                // Valid: One of 'secretStore' or 'secretStoreRef' is provided, but ensure the keys are correct.
                errorMessage = SECRET_TOAST_INFO.CHECK_KEY_SECRET_KEY
            } else {
                // Error: Neither 'secretStore' nor 'secretStoreRef' is provided, one is required.
                errorMessage = SECRET_TOAST_INFO.BOTH_STORE_UNAVAILABLE
            }

            // Return the validation result with a custom validator and the corresponding error message.
            return {
                custom: {
                    isValid: () => isValid, // Validation is successful if all checks pass.
                    message: errorMessage, // Error message based on the validation logic.
                },
            }
        }

        // If the parsed result is not an object, throw a yaml parse error.
        throw new Error(CONFIG_MAP_SECRET_YAML_PARSE_ERROR)
    } catch (err) {
        // Catch any errors and return an invalid result with an appropriate error message.
        return {
            custom: {
                isValid: () => false, // Always return false when an error occurs.
                message: err.message.replace(/[\s]+/g, ' '), // Display a parsing error message if applicable.
            },
        }
    }
}

export const getConfigMapSecretFormValidations: UseFormValidations<ConfigMapSecretUseFormProps> = ({
    isSecret,
    external,
    externalType,
    selectedType,
    isFilePermissionChecked,
    volumeMountPath,
    isSubPathChecked,
    yaml,
    yamlMode,
    esoSecretYaml,
}) => {
    const mountExistingExternal =
        external && externalType === (isSecret ? CMSecretExternalType.KubernetesSecret : CMSecretExternalType.Internal)
    const isESO = isSecret && hasESO(externalType)

    const rules = new ValidationRules()

    return {
        name: {
            required: true,
            pattern: {
                value: PATTERNS.CONFIGMAP_AND_SECRET_NAME,
                message:
                    "Name must start and end with an alphanumeric character. It can contain only lowercase alphanumeric characters, '-' or '.'",
            },
            custom: {
                isValid: (value) => value.length <= 253,
                message: 'More than 253 characters are not allowed',
            },
        },
        ...(selectedType === 'volume'
            ? {
                  volumeMountPath: {
                      required: true,
                      custom: {
                          isValid: (value) => !rules.cmVolumeMountPath(value).isValid,
                          message: rules.cmVolumeMountPath(volumeMountPath).message,
                      },
                  },
                  ...(isFilePermissionChecked
                      ? {
                            filePermission: {
                                required: true,
                                pattern: {
                                    value: PATTERNS.ALL_DIGITS_BETWEEN_0_AND_7,
                                    message: 'This is octal number, use numbers between 0 to 7',
                                },
                                custom: [
                                    {
                                        isValid: (value) => value.length <= 4,
                                        message: 'More than 4 characters are not allowed',
                                    },
                                    {
                                        isValid: (value) => value.startsWith('0'),
                                        message:
                                            '4 characters are allowed in octal format only, first character should be 0',
                                    },
                                    {
                                        isValid: (value) => value.length >= 3,
                                        message: 'Atleast 3 character are required',
                                    },
                                ],
                            },
                        }
                      : {}),
                  ...(isSubPathChecked && ((isSecret && externalType === 'KubernetesSecret') || (!isSecret && external))
                      ? {
                            externalSubpathValues: {
                                required: true,
                                pattern: {
                                    value: PATTERNS.CONFIG_MAP_AND_SECRET_MULTPLS_KEYS,
                                    message: 'Use (a-z), (0-9), (-), (_),(.); Use (,) to separate multiple keys',
                                },
                            },
                        }
                      : {}),
              }
            : {}),
        ...(!isESO && !mountExistingExternal
            ? {
                  ...(yamlMode
                      ? {
                            yaml: {
                                custom: validateYaml(yaml),
                            },
                        }
                      : {
                            hasCurrentDataErr: {
                                custom: {
                                    isValid: (value) => !value,
                                    message: 'Please resolve the errors before saving',
                                },
                            },
                            currentData: {
                                custom: {
                                    isValid: (value) => external || (value.length && !!value[0].k),
                                    message: CONFIG_MAP_SECRET_NO_DATA_ERROR,
                                },
                            },
                        }),
              }
            : {}),
        ...(isSecret && isESO
            ? {
                  esoSecretYaml: validateEsoSecretYaml(esoSecretYaml),
              }
            : {}),
    }
}
