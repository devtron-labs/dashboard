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

import { UserGroupDTO, UserGroupType, UserRoleGroup, UserStatus } from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '../../../components/common'
import { User, UserCreateOrUpdateParamsType, UserCreateOrUpdatePayloadType } from './types'

// Adding here to avoid circular import dependency
// These are being reused across with default values

export const getDefaultUserStatusAndTimeout: () => Pick<User, 'userStatus' | 'timeToLive'> =
    importComponentFromFELibrary('getDefaultUserStatusAndTimeout', () => ({}), 'function')

export const getDefaultStatusAndTimeout: () => Pick<UserRoleGroup, 'status' | 'timeToLive'> =
    importComponentFromFELibrary('getDefaultStatusAndTimeout', () => ({}), 'function')

export const getFormattedTimeToLive: (timeToLive: string) => string = importComponentFromFELibrary(
    'getFormattedTimeToLive',
    () => ({}),
    'function',
)

export const getIsStatusDropdownDisabled: (status: UserStatus) => boolean = importComponentFromFELibrary(
    'getIsStatusDropdownDisabled',
    () => false,
    'function',
)

export const getParsedUserGroupList: (userGroupListData: UserGroupDTO[]) => UserGroupType[] =
    importComponentFromFELibrary('getParsedUserGroupList', () => [], 'function')

export const getUserGroupsPayload: (
    userGroups: UserCreateOrUpdateParamsType['userGroups'],
) => UserCreateOrUpdatePayloadType['userGroups'] = importComponentFromFELibrary(
    'getUserGroupsPayload',
    () => [],
    'function',
)
