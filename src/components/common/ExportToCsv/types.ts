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

import { FILE_NAMES } from './constants'

export type ExportToCsvProps<ConfigValueType extends string = string> = {
    apiPromise: (selectedConfig: Record<ConfigValueType, boolean>) => Promise<unknown[]>
    fileName: FILE_NAMES
    className?: string
    disabled?: boolean
    /**
     * Configuration for the export csv
     */
    configuration?: {
        title: string
        options: {
            label: string
            value: ConfigValueType
            description?: string
        }[]
    }
    /**
     * @default false
     * If true, the export result modal will not be shown after the export is completed.
     */
    hideExportResultModal?: boolean
} & (
    | {
          /**
           * If given would replace the Button component with the button tag and the children will be rendered inside it.
           */
          triggerElementClassname: string
          /**
           * Content inside the button
           */
          children: React.ReactNode
          showOnlyIcon?: never
      }
    | {
          children?: never
          triggerElementClassname?: never
          showOnlyIcon?: boolean
      }
)

export interface ExportConfigurationProps<ConfigValueType extends string>
    extends Pick<ExportToCsvProps<ConfigValueType>, 'configuration'> {
    selectedConfig: Record<ConfigValueType, boolean>
    setSelectedConfig: React.Dispatch<React.SetStateAction<Record<ConfigValueType, boolean>>>
}
