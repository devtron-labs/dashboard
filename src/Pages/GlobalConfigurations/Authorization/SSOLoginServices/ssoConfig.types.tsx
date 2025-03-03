/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { RouteComponentProps } from 'react-router-dom'
import { SSOProvider } from './constants'
import { GlobalConfiguration } from '../../../../components/globalConfigurations/types'

export interface SSOConfigDTO {
    active: boolean
    id: number
    globalAuthConfigType: string
    name: string
    url: string
}

export interface SSOLogin extends Pick<SSOConfigDTO, 'active' | 'name' | 'id'> {}

export interface SSOConfigType extends Partial<Pick<SSOConfigDTO, 'active' | 'name' | 'id' | 'url'>> {
    config: {
        type: string
        id: string
        name: string
        config: string // YAML string
    }
}

export interface SSOLoginState {
    view: string
    statusCode: number
    saveLoading: boolean
    sso: string // lowercase
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

export interface SSOLoginProps extends RouteComponentProps<unknown> {
    globalConfiguration: GlobalConfiguration
}

export interface SSOLoginTabType {
    handleSSOClick: (e) => void
    checked: boolean
    lastActiveSSO: undefined | SSOLogin
    value: SSOProvider
    SSOName: string
}

export const OIDCType = 'oidc'
