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

export enum ReadFileAs {
    TEXT = 'text',
    DATA_URL = 'dataUrl',
    BINARY_STRING = 'binaryString',
    ARRAY_BUFFER = 'arrayBuffer',
}

export enum FileReaderStatus {
    LOADING = 'loading',
    SUCCESS = 'success',
    FAILED = 'failed',
}

export interface FileReaderStatusType {
    status: FileReaderStatus
    message: {
        data: any
        description: string
    }
}

export interface FileDataType {
    data: any
    type: string
    name: string
}

export type ValidatorType = (fileData: FileDataType) => FileReaderStatusType
