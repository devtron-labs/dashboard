export enum ModuleInstallationStates {
    NONE = 'NONE',
    NOT_INSTALLED = 'NOT_INSTALLED',
    INSTALLING = 'INSTALLING',
    INSTALLED = 'INSTALLED',
    INSTALLATION_FAILED = 'INSTALLATION_FAILED',
}

export interface ModuleDetails {
    name: string
    info: string
    icon: string
    installationState: ModuleInstallationStates
}

export interface ModuleDetailsCardType {
    moduleDetails: ModuleDetails
    className?: string
}
