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

export interface ExportToCsvProps<ConfigValueType extends string = string> {
    apiPromise: (selectedConfig: Record<ConfigValueType, boolean>) => Promise<unknown[]>
    fileName: FILE_NAMES
    className?: string
    disabled?: boolean
    showOnlyIcon?: boolean
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
}

export interface ExportConfigurationProps<ConfigValueType extends string>
    extends Pick<ExportToCsvProps<ConfigValueType>, 'configuration'> {
    selectedConfig: Record<ConfigValueType, boolean>
    setSelectedConfig: React.Dispatch<React.SetStateAction<Record<ConfigValueType, boolean>>>
}
