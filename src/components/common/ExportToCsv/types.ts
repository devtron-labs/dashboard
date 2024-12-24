import { FILE_NAMES } from './constants'

export interface ExportToCsvProps<ConfigValueType extends string = string> {
    apiPromise: (selectedConfig: Record<ConfigValueType, boolean>) => Promise<unknown[]>
    fileName: FILE_NAMES
    className?: string
    disabled?: boolean
    showOnlyIcon?: boolean
    /**
     * Configuration for the export csv
     */
    configuration?: {
        title: string
        options: {
            label: string
            value: ConfigValueType
            description?: string
        }[]
    }
}

export interface ExportConfigurationProps<ConfigValueType extends string>
    extends Pick<ExportToCsvProps<ConfigValueType>, 'configuration'> {
    selectedConfig: Record<ConfigValueType, boolean>
    setSelectedConfig: React.Dispatch<React.SetStateAction<Record<ConfigValueType, boolean>>>
}
