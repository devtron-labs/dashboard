import { FileReaderStatus } from '../common/hooks/types'

export const DEFAULT_TITLE = 'Scoped variables'
export const DEFAULT_DESCRIPTION =
    'Scoped variable is a key-value pair. Value can be scoped and can be used dynamically across devtron.'
export const UPLOAD_DESCRIPTION_L1 = 'Upload file to add'
export const UPLOAD_DESCRIPTION_L2 = '.JSON or .YAML'
export const DOWNLOAD_TEMPLATE = 'Download template'
export const DOWNLOAD_FILE_NAME = 'variables.yaml'
export const DOWNLOAD_TEMPLATE_NAME = 'variables-template.yaml'
export const DOWNLOAD_FILES_AS = 'application/x-yaml'
export const DROPDOWN_ITEMS = ['Download saved file', 'Download template']
export const TABLE_LIST_HEADINGS = ['VARIABLE NAME', 'DESCRIPTION', 'VALUE IS']

// File Reader error messages
export const PARSE_ERROR_STATUS = {
    message: {
        data: null,
        description: 'Parsed Data not valid',
    },
    status: FileReaderStatus.FAILED,
}
export const JSON_PARSE_ERROR_STATUS = {
    message: {
        data: null,
        description: 'Issue while parsing JSON',
    },
    status: FileReaderStatus.FAILED,
}
export const YAML_PARSE_ERROR_STATUS = {
    message: {
        data: null,
        description: 'Issue while parsing YAML',
    },
    status: FileReaderStatus.FAILED,
}
export const FILE_NOT_SUPPORTED_STATUS = {
    message: {
        data: null,
        description: 'File type is not supported',
    },
    status: FileReaderStatus.FAILED,
}
export const EMPTY_FILE_STATUS = {
    message: {
        data: null,
        description: 'File is empty',
    },
    status: FileReaderStatus.FAILED,
}

export const UPLOAD_FAILED_FALLBACK_MESSAGE = 'Upload Failed'
export const UPLOAD_FAILED_STANDARD_MESSAGE = 'Invalid file content'

export const SCOPED_VARIABLES_TEMPLATE_DATA = `apiVersion: devtron.ai/v1beta1
kind: Variable
spec:
  # Name of the variable, must be unique
- name: KAFKA 
  #Provide a short description for this variable in max 120 characters. This description will be shown in UI while using the variable.
  shortDescription: Enter a short description here
  # Mention notes that tell more about this variable. This will not be shown in UI while using the variable. No char limit.
  notes: Enter any notes for additional details 
  # Optional property. Accepts Boolean Value, default value false. Values for sensitive variables are not shown in UI while using the variable
  isSensitive: false 
  # List of values for this variable
  values: 
      #Global category can be used to define variables which are common across all applications
    - category: Global 
      value: Global`

// TOAST Messages while saving file
export const SAVE_SUCCESS_TOAST_MESSAGE = 'File saved successfully'
export const SAVE_ERROR_TOAST_MESSAGE = 'Error while saving scoped variables'
export const PARSE_ERROR_TOAST_MESSAGE = 'Error while parsing file'
export const GET_SCOPED_VARIABLES_ERROR = 'Error while fetching scoped variables'

export const NO_VARIABLES_MESSAGE = {
    TITLE: 'No matching results found',
    SUBTITLE: "We couldn't find any matching variable",
}

export const NO_DESCRIPTION_MESSAGE = 'No description'
export const SENSITIVE_VARIABLE_DESCRIPTION = 'Value is sensitive & will be hidden while using this variable'
export const IN_SENSITIVE_VARIABLE_DESCRIPTION = 'Value is not sensitive & will be visible while using this variable'
