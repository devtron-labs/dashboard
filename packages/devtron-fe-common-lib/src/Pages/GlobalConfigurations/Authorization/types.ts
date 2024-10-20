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

import { BaseFilterQueryParams } from '../../../Shared'
import { UserListSortableKeys, UserStatus } from './constants'

export type UserListFilterParams = BaseFilterQueryParams<UserListSortableKeys> & {
    /**
     * Selected statuses (if any)
     */
    status: UserStatus[]
}

export interface UserMinType {
    id: number
    emailId: string
}

export interface UserRoleGroup {
    /**
     * Id of the permission group
     */
    id: number
    /**
     * Name of the permission group
     */
    name: string
    /**
     * Associated description for the group
     *
     * @default '-'
     */
    description?: string
    /**
     * Status of the role group
     */
    status: UserStatus
    /**
     * Timeout for the role group
     */
    timeToLive: string
}

export interface UserGroupDTO {
    /**
     * Unique display name of the user group
     */
    name: string
    /**
     * Unique id of the user group
     *
     * Follows the validation for app name
     */
    identifier: string
    /**
     * Associated description
     *
     * @default ''
     */
    description?: string
    /**
     * Number of users assigned to the group
     *
     * @default 0
     */
    usersCount?: number
}

export interface UserGroupType
    extends Required<Pick<UserGroupDTO, 'description' | 'name' | 'usersCount' | 'identifier'>> {
    /**
     * Unique id of the user group
     *
     * Follows the validation for app name
     */
    userGroupId: string
}
