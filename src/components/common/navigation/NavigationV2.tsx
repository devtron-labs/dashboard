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

import { customEnv, IconsProps, URLS as CommonURLS } from '@devtron-labs/devtron-fe-common-lib'

import { URLS } from '@Config/routes'

export type NavigationItemType = {
    title: string
    dataTestId: string
    icon: IconsProps['name']
    isAvailableInEA?: boolean
    markOnlyForSuperAdmin?: boolean
    forceHideEnvKey?: keyof customEnv
    hideNav?: boolean
    markAsBeta?: boolean
    isAvailableInDesktop?: boolean
    moduleName?: string
    moduleNameTrivy?: string
} & (
    | {
          href?: (typeof URLS)[keyof typeof URLS] | (typeof CommonURLS)[keyof typeof CommonURLS]
          subItems?: never
      }
    | {
          href?: never
          subItems?: NavigationItemType[]
      }
)

export interface NavigationGroupType {
    id: string
    title: string
    items: NavigationItemType[]
}

export const NAVIGATION_LIST: NavigationGroupType[] = [
    {
        id: 'application-management',
        title: 'Application Management',
        items: [
            {
                title: 'Applications',
                dataTestId: 'click-on-application',
                icon: 'ic-grid-view',
                href: URLS.APP,
                isAvailableInEA: true,
            },
        ],
    },
]

export const NavigationV2 = () => <div>NavigationV2</div>
