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

export const validScopedVariablesData = {
    code: 200,
    status: 'OK',
    result: {
        manifest: {
            apiVersion: 'devtron.ai/v1beta1',
            kind: 'Variable',
            spec: [
                {
                    notes: 'KAFKA',
                    shortDescription: '',
                    isSensitive: false,
                    name: 'KAFKA',
                    values: [
                        {
                            category: 'Global',
                            value: "'",
                        },
                    ],
                },
                {
                    notes: 'Microservices',
                    shortDescription: 'Short Description',
                    isSensitive: true,
                    name: 'Microservices',
                    values: [],
                },
            ],
        },
        jsonSchema: `{}`,
    },
}

export const noScopedVariablesData = {
    result: {
        manifest: null,
        jsonSchema: '{}',
    },
    code: 200,
}

export const validVariablesList = [
    {
        name: 'newVariable',
        description: 'newVariableDescription',
        isSensitive: false,
    },
    {
        name: 'newVariable1',
        description: 'newVariable1Description',
        isSensitive: true,
    },
]
