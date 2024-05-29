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

import { validator, downloadData } from '../utils'
import {
    EMPTY_FILE_STATUS,
    FILE_NOT_SUPPORTED_STATUS,
    JSON_PARSE_ERROR_STATUS,
    YAML_PARSE_ERROR_STATUS,
} from '../constants'
import { FileReaderStatus } from '../../common/hooks/types'

describe('ScopedVariables helpers', () => {
    describe('validator', () => {
        it('should return EMPTY_FILE_STATUS when data is empty', () => {
            expect(validator({ data: null, type: 'application/json', name: 'sample-file' })).toEqual(EMPTY_FILE_STATUS)
        })

        it('should return FILE_NOT_SUPPORTED_STATUS when file type is not supported', () => {
            expect(validator({ data: 'sample-data', type: 'application/xml', name: 'sample-file' })).toEqual(
                FILE_NOT_SUPPORTED_STATUS,
            )
        })

        it('should return JSON_PARSE_ERROR_STATUS when file type is json and data is not valid', () => {
            expect(validator({ data: 'sample-data', type: 'application/json', name: 'sample-file' })).toEqual(
                JSON_PARSE_ERROR_STATUS,
            )
        })

        it('should return YAML_PARSE_ERROR_STATUS when file type is yaml and data is not valid', () => {
            expect(validator({ data: '{{', type: 'application/x-yaml', name: 'sample-file' })).toEqual(
                YAML_PARSE_ERROR_STATUS,
            )
        })

        it('should return true status when file type is json and data is valid', () => {
            expect(validator({ data: '{"a": "b"}', type: 'application/json', name: 'sample-file' })).toEqual({
                status: FileReaderStatus.SUCCESS,
                message: {
                    data: 'a: b\n',
                    description: 'File uploaded successfully',
                },
            })
        })

        it('should return true status when file type is yaml and data is valid', () => {
            expect(validator({ data: 'a: b', type: 'application/x-yaml', name: 'sample-file' })).toEqual({
                status: FileReaderStatus.SUCCESS,
                message: {
                    data: 'a: b\n',
                    description: 'File uploaded successfully',
                },
            })
        })
    })

    describe('downloadData', () => {
        it('should download data', () => {
            const data = 'sample-data'
            const filename = 'sample-file'
            const type = 'application/x-yaml'
            const blob = new Blob([data], { type })
            const url = 'sample-url'
            const a = document.createElement('a')

            window.URL.createObjectURL = jest.fn(() => url)
            document.createElement = jest.fn(() => a)
            a.click = jest.fn()
            window.URL.revokeObjectURL = jest.fn()

            downloadData(data, filename, type)

            expect(window.URL.createObjectURL).toHaveBeenCalledWith(blob)
            expect(window.URL.revokeObjectURL).toHaveBeenCalledWith(url)
            expect(a.click).toHaveBeenCalled()
        })
    })
})
