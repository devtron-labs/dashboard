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

import { DeploymentChartVersionType, GUIViewError } from '@devtron-labs/devtron-fe-common-lib'

import { DeploymentTemplateFormProps } from '../types'

export interface GUIViewProps
    extends Pick<
        DeploymentTemplateFormProps,
        | 'editorOnChange'
        | 'lockedConfigKeysWithLockType'
        | 'hideLockedKeys'
        | 'uneditedDocument'
        | 'editedDocument'
        | 'mergeStrategy'
    > {
    value: string
    readOnly: boolean
    isUnSet: boolean
    handleChangeToYAMLMode: () => void
    guiSchema: string
    selectedChart: DeploymentChartVersionType
}

export type GUIViewState =
    | {
          guiSchema: object
          uiSchema: object
          error?: never
      }
    | {
          guiSchema?: never
          uiSchema?: never
          error: GUIViewError
      }
