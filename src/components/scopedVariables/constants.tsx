export const DEFAULT_TITLE = 'Scoped variables'
export const DEFAULT_DESCRIPTION =
    'Scoped variable is a key-value pair. Value can be scoped and can be used dynamically across devtron.'
export const UPLOAD_DESCRIPTION_L1 = 'Upload file to add'
export const UPLOAD_DESCRIPTION_L2 = '.JSON or .YAML'
export const DOWNLOAD_TEMPLATE = 'Download template'
export const DOWNLOAD_FILE_NAME = 'variables.yaml'
export const DOWNLOAD_TEMPLATE_NAME = 'variables-template.yaml'
export const DROPDOWN_ITEMS = ['Download saved file', 'Download template']
export const TABLE_LIST_HEADINGS = ['VARIABLE NAMES', 'DESCRIPTION']

// File Reader error messages
export const FILE_READING_FAILED_STATUS = {
    message: {
        data: null,
        description: 'File reading failed',
    },
    status: false,
}
export const NO_FILE_SELECTED_STATUS = {
    message: {
        data: null,
        description: 'No file selected',
    },
    status: false,
}
export const PARSE_ERROR_STATUS = {
    message: {
        data: null,
        description: 'Parsed Data not valid',
    },
    status: false,
}
export const JSON_PARSE_ERROR_STATUS = {
    message: {
        data: null,
        description: 'Issue while parsing JSON',
    },
    status: false,
}
export const YAML_PARSE_ERROR_STATUS = {
    message: {
        data: null,
        description: 'Issue while parsing YAML',
    },
    status: false,
}
export const FILE_NOT_SUPPORTED_STATUS = {
    message: {
        data: null,
        description: 'File type is not supported',
    },
    status: false,
}
export const EMPTY_FILE_STATUS = {
    message: {
        data: null,
        description: 'File is empty',
    },
    status: false,
}

export const VARIABLES_TEMPLATE = `# Example:
# variables:
#   - definition:
#       varName: variable1
#       dataType: primitive
#       varType: private
#       description: This is variable 1
#     attributeValue:
#       - variableValue:
#           value: value1
#         attributeType: ApplicationEnv
#         attributeParams:
#           ApplicationName: app1
#           EnvName: dev
#       - variableValue:
#           value: value1
#         attributeType: Env
#         attributeParams:
#           EnvName: prod
#   - definition:
#       varName: variable2
#       dataType: primitive
#       varType: public
#       description: This is variable 2
#     attributeValue:
#       - variableValue:
#           value: value2
#         attributeType: Application
#         attributeParams:
#           ApplicationName: app2
variables:
  - definition:
      varName: 
      dataType: 
      varType: 
      description: 
    attributeValue:
      - variableValue:
          value: 
        attributeType: 
        attributeParams:
          ApplicationName: 
          EnvName: 
      - variableValue:
          value: 
        attributeType: 
        attributeParams:
          EnvName: 
`

export const ROUTES = {
    GET_SCOPED_VARIABLES_JSON: 'global/variables/detail',
    SCOPED_VARIABLES: 'global/variables',
}

// TOAST Messages while saving file
export const SAVE_SUCCESS_TOAST_MESSAGE = 'File saved successfully'
export const SAVE_ERROR_TOAST_MESSAGE = 'Error while saving scoped variables'
export const PARSE_ERROR_TOAST_MESSAGE = 'Error while parsing file'
