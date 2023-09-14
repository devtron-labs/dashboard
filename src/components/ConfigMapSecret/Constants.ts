import { ValidatorType, FileReaderStatus } from "../common/hooks/types"
import { EMPTY_FILE_STATUS, PARSE_ERROR_STATUS, JSON_PARSE_ERROR_STATUS, YAML_PARSE_ERROR_STATUS, FILE_NOT_SUPPORTED_STATUS } from "../scopedVariables/constants"
import yaml from 'js-yaml'

export const EXTERNAL_INFO_TEXT = {
    secret: {
        title: 'Mount Existing Kubernetes Secret',
        infoText:
            'Secret will not be created by system. However, they will be used inside the pod. Please make sure that secret with the same name is present in the environment.',
    },
    configmap: {
        title: 'Using External Configmaps',
        infoText:
            'Configmap will not be created by system. However, they will be used inside the pod. Please make sure that configmap with the same name is present in the environment',
    },
}

export const ConfigMapSecretUsageMap = {
    environment: { title: 'Environment Variable', value: 'environment' },
    volume: { title: 'Data Volume', value: 'volume' },
}

export enum CM_SECRET_STATE {
    BASE = '',
    INHERITED = 'Inheriting',
    OVERRIDDEN = 'Overridden',
    ENV = 'Env',
    UNPUBLISHED = 'UNPUBLISHED',
}

export const SECRET_TOAST_INFO = {
  BOTH_STORE_AVAILABLE: 'Please use either secretStore or secretStoreRef',
  CHECK_KEY_SECRET_KEY: 'Please check key and secretKey',
  BOTH_STORE_UNAVAILABLE: 'Please provide secretStore or secretStoreRef',
  CHECK_KEY_NAME: 'Please check key and name'
}

export const importConfigSecretImportFileMessaging = [
    {
        title: '--from',
        description: 'Use file name as key and file content as value (supports multi-line data)',
        isFileNameAsKey: true,
    },
    {
        title: '--from-env-file',
        description: 'Create secret from an env-file. Uses file content as key:value',
        isFileNameAsKey: false,
    },
]

export const configMapsSecretImportFileValidator: ValidatorType = ({ data, type, name }) => {
    if (!data) {
        return EMPTY_FILE_STATUS
    }
    switch (type) {
        case 'application/json':
            try {
                const parsedData = JSON.parse(data)
                if (parsedData && typeof parsedData === 'object') {
                    return {
                        status: FileReaderStatus.SUCCESS,
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
                        status: FileReaderStatus.SUCCESS,
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