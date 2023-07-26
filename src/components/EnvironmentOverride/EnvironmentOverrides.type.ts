import React from 'react'
import { DOCUMENTATION, URLS } from '../../config'
import { AppEnvironment } from '../../services/service.types'
import { ConfigAppList } from '../ApplicationGroup/AppGroup.types'

export enum ComponentStates {
    loading = 'loading',
    loaded = 'loaded',
    success = 'success',
    failed = 'failed',
    reloading = 'reloading',
}

export interface SectionHeadingType {
    title: string
    subtitle: string
    learnMoreLink: string
}

export const SECTION_HEADING_INFO: Record<string, SectionHeadingType> = {
    [URLS.APP_CM_CONFIG]: {
        title: 'ConfigMaps',
        subtitle:
            'ConfigMap is used to store common configuration variables, allowing users to unify environment variables for different modules in a distributed system into one object.',
        learnMoreLink: DOCUMENTATION.APP_CREATE_CONFIG_MAP,
    },
    [URLS.APP_CS_CONFIG]: {
        title: 'Secrets',
        subtitle: 'A Secret is an object that contains sensitive data such as passwords, OAuth tokens, and SSH keys.',
        learnMoreLink: DOCUMENTATION.APP_CREATE_SECRET,
    },
}

export interface EnvironmentOverrideComponentProps {
    environments: AppEnvironment[]
    appList?: ConfigAppList[]
    setEnvironments: React.Dispatch<React.SetStateAction<AppEnvironment[]>>
    isJobView?: boolean,
    envList?: any
}

export interface CommonEnvironmentOverridesProps {
    parentState: ComponentStates
    setParentState: React.Dispatch<React.SetStateAction<ComponentStates>>
    isJobView?: boolean
}

export interface ConfigMapOverridesProps extends CommonEnvironmentOverridesProps {}

export interface SecretOverridesProps extends CommonEnvironmentOverridesProps {}

export interface DeploymentTemplateOverrideProps extends CommonEnvironmentOverridesProps {
    environments: AppEnvironment[]
    environmentName: string
}
export interface ListComponentType {
    name: string
    type: string
    label: string
    appChartRef: { id: number; version: string; name: string }
    isJobView?: boolean
}