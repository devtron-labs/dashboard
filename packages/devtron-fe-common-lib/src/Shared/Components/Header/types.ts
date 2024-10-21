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

import { ModuleStatus } from '@Shared/types'
import { ResponseType, TippyCustomizedProps } from '../../../Common'

export enum InstallationType {
    OSS_KUBECTL = 'oss_kubectl',
    OSS_HELM = 'oss_helm',
    ENTERPRISE = 'enterprise',
}

export interface PageHeaderType {
    headerName?: string
    showTabs?: boolean
    additionalHeaderInfo?: () => JSX.Element
    renderHeaderTabs?: () => JSX.Element
    isBreadcrumbs?: boolean
    breadCrumbs?: () => JSX.Element
    renderActionButtons?: () => JSX.Element
    showCloseButton?: boolean
    onClose?: () => void
    markAsBeta?: boolean
    showAnnouncementHeader?: boolean
    tippyProps?: Pick<TippyCustomizedProps, 'additionalContent'> & {
        isTippyCustomized?: boolean
        tippyRedirectLink?: string
        TippyIcon?: React.FunctionComponent<any>
        tippyMessage?: string
        onClickTippyButton?: () => void
    }
}

export interface ServerInfo {
    currentVersion: string
    status: ModuleStatus
    releaseName: string
    installationType: InstallationType
}

export interface ServerInfoResponse extends ResponseType {
    result?: ServerInfo
}

export interface HelpNavType {
    className: string
    setShowHelpCard: React.Dispatch<React.SetStateAction<boolean>>
    serverInfo: ServerInfo
    fetchingServerInfo: boolean
    setGettingStartedClicked: (isClicked: boolean) => void
    showHelpCard: boolean
}

export interface HelpOptionType {
    name: string
    link: string
    icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
    showSeparator?: boolean
}
