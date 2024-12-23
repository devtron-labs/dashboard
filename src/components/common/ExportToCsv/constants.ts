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

import { importComponentFromFELibrary } from '../helpers/Helpers'

const showStatus = !!importComponentFromFELibrary('StatusHeaderCell', null, 'function')

export enum FILE_NAMES {
    Apps = 'Devtron Apps',
    Users = 'Devtron Apps Users Data',
    Groups = 'Devtron Apps Permission Groups',
    Jobs = 'Devtron Jobs Data',
}

export const APPLIST_EXPORT_HEADERS = [
    { label: 'App Name', key: 'appName' },
    { label: 'App ID', key: 'appId' },
    { label: 'Project Name', key: 'projectName' },
    { label: 'Project ID', key: 'projectId' },
    { label: 'Application Status', key: 'status' },
    { label: 'Environment Name', key: 'environmentName' },
    { label: 'Environment ID', key: 'environmentId' },
    { label: 'Cluster Name', key: 'clusterName' },
    { label: 'Cluster ID', key: 'clusterId' },
    { label: 'Namespace Name', key: 'namespace' },
    { label: 'Namespace ID', key: 'namespaceId' },
    { label: 'Last Deployed', key: 'lastDeployedTime' },
]

export const USER_EXPORT_HEADERS = [
    { label: 'Email address', key: 'emailId' },
    { label: 'User ID', key: 'userId' },
    ...(showStatus ? [{ label: 'User status', key: 'status' }] : []),
    { label: 'Last login time', key: 'lastLoginTime' },
    { label: 'Super admin', key: 'superAdmin' },
    { label: 'Group permissions', key: 'group' },
    { label: 'Project', key: 'project' },
    { label: 'Environment', key: 'environment' },
    { label: 'Application', key: 'application' },
    { label: 'Role', key: 'role' },
    ...(showStatus
        ? [
              { label: 'Permission Status', key: 'permissionStatus' },
              { label: 'Added on', key: 'createdOn' },
              { label: 'Updated on', key: 'updatedOn' },
              { label: 'Deleted on', key: 'deletedOn' },
          ]
        : []),
]

export const USER_EXPORT_HEADER_ROW = {
    emailId: 'Email address',
    userId: 'User ID',
    ...(showStatus
        ? {
              status: 'User status',
          }
        : {}),
    lastLoginTime: 'Last login time',
    superAdmin: 'Super admin',
    group: 'Group permissions',
    project: 'Project',
    environment: 'Environment',
    application: 'Application',
    role: 'Role',
    ...(showStatus
        ? {
              permissionStatus: 'Permission Status',
              createdOn: 'Added on',
              updatedOn: 'Updated on',
              deletedOn: 'Deleted on',
          }
        : {}),
}

export const GROUP_EXPORT_HEADERS = [
    { label: 'Group Name', key: 'groupName' },
    { label: 'Group ID', key: 'groupId' },
    { label: 'Description', key: 'description' },
    { label: 'Super admin', key: 'superAdmin' },
    { label: 'Project', key: 'project' },
    { label: 'Environment', key: 'environment' },
    { label: 'Application', key: 'application' },
    { label: 'Role', key: 'role' },
]

export const GROUP_EXPORT_HEADER_ROW = {
    groupName: 'Group Name',
    groupId: 'Group ID',
    description: 'Description',
    superAdmin: 'Super admin',
    project: 'Project',
    environment: 'Environment',
    application: 'Application',
    role: 'Role',
}

export const JOBLIST_EXPORT_HEADERS = [
    { label: 'Job Name', key: 'jobName' },
    { label: 'Job ID', key: 'jobId' },
    { label: 'Description', key: 'description' },
    { label: 'Job Pipeline ID', key: 'ciPipelineId' },
    { label: 'Job Pipeline Name', key: 'ciPipelineName' },
    { label: 'Last Run Status', key: 'status' },
    { label: 'Last Run At', key: 'lastRunAt' },
    { label: 'Last Success At', key: 'lastSuccessAt' },
]

export const CSV_HEADERS = {
    [FILE_NAMES.Apps]: APPLIST_EXPORT_HEADERS,
    [FILE_NAMES.Users]: USER_EXPORT_HEADERS,
    [FILE_NAMES.Groups]: GROUP_EXPORT_HEADERS,
    [FILE_NAMES.Jobs]: JOBLIST_EXPORT_HEADERS,
}
