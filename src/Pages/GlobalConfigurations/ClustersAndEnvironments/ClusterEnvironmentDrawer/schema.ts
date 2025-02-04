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

import { UseFormValidations } from '@devtron-labs/devtron-fe-common-lib'

import { ClusterEnvironmentDrawerFormProps } from './types'

export const clusterEnvironmentDrawerFormValidationSchema = ({
    isNamespaceMandatory,
}: {
    isNamespaceMandatory: boolean
}): UseFormValidations<ClusterEnvironmentDrawerFormProps> => ({
    environmentName: {
        required: true,
        pattern: [
            { message: 'Environment name is required', value: /^.*$/ },
            { message: "Use only lowercase alphanumeric characters or '-'", value: /^[a-z0-9-]+$/ },
            { message: "Cannot start/end with '-'", value: /^(?![-]).*[^-]$/ },
            { message: 'Minimum 1 and Maximum 16 characters required', value: /^.{1,16}$/ },
        ],
    },
    namespace: {
        required: isNamespaceMandatory,
        pattern: [
            { message: 'Namespace is required', value: /^.*$/ },
            { message: "Use only lowercase alphanumeric characters or '-'", value: /^[a-z0-9-]+$/ },
            { message: "Cannot start/end with '-'", value: /^(?![-]).*[^-]$/ },
            { message: 'Maximum 63 characters required', value: /^.{1,63}$/ },
        ],
    },
    isProduction: {
        required: true,
        pattern: { message: 'token is required', value: /[^]+/ },
    },
    description: {
        pattern: [{ message: 'Maximum 40 characters required', value: /^.{0,40}$/ }],
    },
})
