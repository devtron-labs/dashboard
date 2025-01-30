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

import { ReactComponent as GitHub } from '@Icons/git/github.svg'
import { ReactComponent as Microsoft } from '@Icons/ic-microsoft.svg'
import { ReactComponent as LDAP } from '@Icons/ic-ldap.svg'
import { ReactComponent as OIDC } from '@Icons/ic-oidc.svg'
import { ReactComponent as Openshift } from '@Icons/ic-openshift.svg'
import { ReactComponent as GitLab } from '@Icons/git/gitlab.svg'
import { ReactComponent as Google } from '@Icons/ic-google.svg'
import { SSOTabIconsTypes } from './ssoConfig.types'
import { SSOProvider } from './constants'

export const SSOTabIcons = ({ provider }: SSOTabIconsTypes) => {
    switch (provider) {
        case SSOProvider.google:
            return <Google />
        case SSOProvider.github:
            return <GitHub className="fcn-8" />
        case SSOProvider.gitlab:
            return <GitLab />
        case SSOProvider.microsoft:
            return <Microsoft />
        case SSOProvider.ldap:
            return <LDAP />
        case SSOProvider.oidc:
            return <OIDC />
        case SSOProvider.openshift:
            return <Openshift />
        default:
            return null
    }
}
