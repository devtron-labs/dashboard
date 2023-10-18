import { RouteComponentProps } from 'react-router'

export interface MaterialListProps extends RouteComponentProps<{ appId: string }> {
    respondOnSuccess: () => void
    isWorkflowEditorUnlocked: boolean
    toggleRepoSelectionTippy: () => void
    setRepo: React.Dispatch<React.SetStateAction<string>>
    isJobView?: boolean
}

export interface GitMaterialType {
    id?: number
    name?: string
    gitProvider: { id: number; name: string; url?: string; authMode?: string }
    url: string
    checkoutPath: string
    filterPattern?: []
    includeExcludeFilePath?: string
    active: boolean
    fetchSubmodules: boolean
    isUsedInCiConfig?: boolean
    isExcludeRepoChecked?: boolean
}

export interface MaterialListState {
    statusCode: number
    view: string
    materials: GitMaterialType[]
    providers: any[]
    configStatus: number
    material_provider: any[]
}

export interface CreateMaterialState {
    material: {
        gitProvider: { id: number; name: string }
        url: string
        checkoutPath: string
        active: boolean
        fetchSubmodules: boolean
        includeExcludeFilePath: string
        isExcludeRepoChecked: boolean
    }
    isCollapsed: boolean
    isChecked: boolean
    isLearnHowClicked: boolean
    isLoading: boolean
    isError: MaterialError
}

interface MaterialError {
    gitProvider: undefined | string
    url: undefined | string
    checkoutPath: undefined | string
}

export interface UpdateMaterialState {
    material: GitMaterialType
    isCollapsed: boolean
    isChecked: boolean
    isLearnHowClicked: boolean
    isLoading: boolean
    isError: MaterialError
}

export interface MaterialViewProps {
    isMultiGit: boolean
    isChecked: boolean
    isLearnHowClicked: boolean
    material: GitMaterialType
    isCollapsed: boolean
    isLoading: boolean
    isError: MaterialError
    providers: any[]
    handleProviderChange: (selected, url) => void
    handleCheckoutPathCheckbox: (event) => void
    handleExcludeRepoCheckbox: (event) => void
    handleLearnHowClick: (event) => void
    handleUrlChange: (event) => void
    handlePathChange: (event) => void
    handleFileChange: (event) => void
    toggleCollapse: (event) => void
    save: (event) => void
    cancel: (event) => void
    isWorkflowEditorUnlocked: boolean
    handleSubmoduleCheckbox: (event) => void
    appId?: number
    reload: () => void
    preventRepoDelete?: boolean
    toggleRepoSelectionTippy?: () => void
    setRepo?: React.Dispatch<React.SetStateAction<string>>
    isJobView?: boolean
}

export interface MaterialViewState {
    deleting: boolean
    confirmation: boolean
}
