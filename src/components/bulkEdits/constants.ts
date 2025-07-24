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

import { BulkEditVersion } from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'

const BULK_EDIT_README_OPTIONS = importComponentFromFELibrary('BULK_EDIT_README_OPTIONS', [], 'function')

export enum OutputObjectTabs {
    OUTPUT = 'Output',
    IMPACTED_OBJECTS = 'Impacted objects',
}

export const STATUS = {
    ERROR: "Please check the apiVersion and kind, apiVersion and kind provided by you don't exist",
    EMPTY_IMPACTED: 'We could not find any matching devtron applications.',
}

export const OutputDivider = '-----------------------------------------------------------------'

export const BULK_EDIT_RESIZE_HANDLE_CLASS = 'bulk-edit__resize-handle'

export const ReadmeVersionOptions = [
    ...BULK_EDIT_README_OPTIONS,
    {
        label: 'v1beta1/application',
        value: BulkEditVersion.v1,
    },
]

export const INITIAL_OUTPUT_PANEL_HEIGHT_PERCENTAGE = 50
