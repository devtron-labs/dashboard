import { FileReaderStatusType, FileDataType, ReadFileAs, ValidatorType } from '../common/hooks/types'

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

export interface SavedVariablesViewProps {
    scopedVariablesData: ScopedVariablesDataType
    jsonSchema: object
    reloadScopedVariables: () => void
    setScopedVariables: React.Dispatch<React.SetStateAction<ScopedVariablesDataType>>
}

export interface LoadScopedVariablesProps {
    status: FileReaderStatusType
    progress: number
    fileData: FileDataType
    abortRead: () => void
}

export interface ScopedVariablesEditorProps {
    variablesData: string
    name: string
    jsonSchema: object
    abortRead: () => void
    setShowEditView?: React.Dispatch<React.SetStateAction<boolean>>
    reloadScopedVariables: () => void
    setScopedVariables: React.Dispatch<React.SetStateAction<ScopedVariablesDataType>>
}

export interface UploadScopedVariablesProps {
    reloadScopedVariables: () => void
    jsonSchema: object
    setScopedVariables: React.Dispatch<React.SetStateAction<ScopedVariablesDataType>>
}

export interface DescriptorProps {
    children?: React.ReactNode
    showUploadButton?: boolean
    readFile?: (file: File, validator: ValidatorType, readAs: ReadFileAs) => void
    onSearch?: (query: string) => void
}

export interface VariableType {
    name: string
    description: string
    isSensitive: boolean
}
export interface ScopedVariablesProps {
    isSuperAdmin: boolean
}

export interface ScopedVariablesDataType {
    apiVersion: 'devtron.ai/v1beta1'
    kind: 'Variable'
    spec: VariableSpecType[]
}

export interface VariableSpecType {
    notes?: string
    shortDescription?: string
    name: string
    isSensitive: boolean
    values: ValueType[]
}

export interface ValueType {
    category: VariableCategories
    value: any
    selectors?: object
}

export interface VariablesListItemProps {
    data: string
    classes: string
    tooltip?: boolean
}

export interface SearchBarProps {
    onSearch: (query: string) => void
    placeholder?: string
    inputClass?: string
    containerClass?: string
    children?: React.ReactNode
    Icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
    iconClass?: string
}
