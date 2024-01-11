import { RouteComponentProps } from 'react-router-dom'
import { SSOProvider } from './constants'
import { GlobalConfiguration } from '../globalConfigurations/types'

export interface SSOLogin {
    id: number
    name: string
    active: boolean
}

export interface SSOLoginState {
    view: string
    statusCode: number
    saveLoading: boolean
    sso: string //lowercase
    lastActiveSSO: undefined | SSOLogin
    configMap: string
    showToggling: boolean
    ssoConfig: SSOConfigType
    isError: {
        url: string
    }
    invalidYaml: boolean
    /**
     * Auto assign the permissions from the SSO provider, if true
     */
    shouldAutoAssignPermissions: boolean
    /**
     * If true, the confirmation modal for auto-assign permissions will be shown
     *
     * Note: The modal is meant to be shown only when the toggle is changed to true
     */
    showAutoAssignConfirmationModal: boolean
}

export interface SSOConfigType {
    name?: string
    id?: number
    url?: string
    config: {
        type: string
        id: string
        name: string
        config: string //YAML string
    }
    active?: boolean
}

export interface SSOLoginProps extends RouteComponentProps<{}> {
    globalConfiguration: GlobalConfiguration
}

export interface SSOLoginTabType {
    handleSSOClick: (e) => void
    checked: boolean
    lastActiveSSO: undefined | SSOLogin
    value: SSOProvider
    SSOName: string
}

export const OIDCType: string = 'oidc'
