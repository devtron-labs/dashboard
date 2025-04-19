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

import { DefaultUserKey } from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '../../../../components/common'
import { User } from '../types'
import { UserListFilter } from './List/types'

const getStatusFromSearchParams = importComponentFromFELibrary('getStatusFromSearchParams', null, 'function')

export const getIsAdminOrSystemUser = (userEmail: User['emailId']): boolean =>
    userEmail === DefaultUserKey.admin || userEmail === DefaultUserKey.system

export const parseSearchParams = (searchParams: URLSearchParams): UserListFilter => ({
    status: getStatusFromSearchParams ? getStatusFromSearchParams(searchParams) : [],
})
