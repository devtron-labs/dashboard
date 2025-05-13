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

import { FileReaderStatus } from './types'

export const NO_FILE_SELECTED_STATUS = {
    message: {
        data: null,
        description: 'No file selected',
    },
    status: FileReaderStatus.FAILED,
}

export const FILE_READING_FAILED_STATUS = {
    message: {
        data: null,
        description: 'File reading failed',
    },
    status: FileReaderStatus.FAILED,
}

export const ONLINE_BANNER_TIMEOUT = 3000
export const INTERNET_CONNECTIVITY_INTERVAL = 10000
