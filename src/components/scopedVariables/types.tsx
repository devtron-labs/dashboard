export enum ReadFileAs {
    TEXT = 'text',
    DATA_URL = 'dataUrl',
    BINARY_STRING = 'binaryString',
    ARRAY_BUFFER = 'arrayBuffer',
}

export enum FileView {
    YAML = 'yaml',
    SAVED = 'saved',
}

export enum VariableCategories {
    APPLICATION_ENV = 'ApplicationEnv',
    APPLICATION = 'Application',
    ENVIRONMENT = 'Env',
    CLUSTER = 'Cluster',
    GLOBAL = 'Global',
}

export interface SavedVariablesViewInterface {
    scopedVariablesData: ScopedVariablesDataInterface
    jsonSchema: object
    reloadScopedVariables: () => void
    setScopedVariables: React.Dispatch<React.SetStateAction<ScopedVariablesDataInterface>>
}

export interface FileReaderStatusInterface {
    status: boolean | 'loading'
    message: {
        data: any
        description: string
    }
}

export interface FileDataInterface {
    data: any
    type: string
    name: string
}

export interface LoadScopedVariablesInterface {
    status: FileReaderStatusInterface
    progress: number
    fileData: FileDataInterface
    abortRead: () => void
}

export interface ScopedVariablesInputInterface {
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
    children?: React.ReactNode
}

export interface ScopedVariablesEditorInterface {
    variablesData: string
    name: string
    jsonSchema: object
    abortRead: () => void
    setShowEditView?: React.Dispatch<React.SetStateAction<boolean>>
    reloadScopedVariables: () => void
    setScopedVariables: React.Dispatch<React.SetStateAction<ScopedVariablesDataInterface>>
}

export interface UploadScopedVariablesInterface {
    reloadScopedVariables: () => void
    jsonSchema: object
    setScopedVariables: React.Dispatch<React.SetStateAction<ScopedVariablesDataInterface>>
}

export interface DescriptorInterface {
    children?: React.ReactNode
    showUploadButton?: boolean
    readFile?: (file: File, validator: ValidatorType, readAs: ReadFileAs) => void
    onSearch?: (query: string) => void
}

export interface VariablesListInterface {
    name: string
    description: string
}
export interface ScopedVariablesInterface {
    isSuperAdmin: boolean
}

export interface ScopedVariablesDataInterface {
    apiVersion: 'devtron.ai/v1beta1'
    kind: 'Variable'
    spec: VariableSpecInterface[]
}

export interface VariableSpecInterface {
    description?: string
    name: string
    values: ValueInterface[]
}

export interface ValueInterface {
    category: 'ApplicationEnv' | 'Application' | 'Env' | 'Cluster' | 'Global'
    value: any
    selectors?: object
}

export interface GridInterface {
    container?: boolean
    spacing?: number
    item?: boolean
    xs?: number
    containerClass?: string
    itemClass?: string
    children: React.ReactNode
}

export interface VariablesListItemInterface {
    data: string
    classes: string
    tooltip?: boolean
}

export interface SearchBarInterface {
    onSearch: (query: string) => void
    icon?: string
    placeholder?: string
    inputClass?: string
    containerClass?: string
    iconClass?: string
    children?: React.ReactNode
}

export type ValidatorType = (fileData: FileDataInterface) => FileReaderStatusInterface
