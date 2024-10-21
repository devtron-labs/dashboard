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

import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { useFileReader } from '../FileReader'
import { FileReaderStatus, ReadFileAs } from '../types'
import { validator } from '../../../scopedVariables/utils'

describe('useFileReader', () => {
    it('should return fileData(as null), progress(as 0), status (as null), readFile and abortRead initially', () => {
        const DummyComponent = () => {
            const { fileData, progress, status, readFile, abortRead } = useFileReader()
            return (
                <div data-testid="dummy-component">
                    {!fileData && <div data-testid="file-data">File Data</div>}
                    {fileData && <div data-testid="valid-file-data">{fileData.data}</div>}
                    {!progress && <div data-testid="progress">Progress</div>}
                    {!status && <div data-testid="status">Status</div>}
                    {abortRead && (
                        <button data-testid="abort-read" onClick={abortRead}>
                            Abort Read
                        </button>
                    )}
                    <button
                        data-testid="read-file"
                        onClick={() =>
                            readFile(
                                'Some Text',
                                () => ({
                                    status: FileReaderStatus.SUCCESS,
                                    message: {
                                        data: 'a: b\n',
                                        description: 'File uploaded successfully',
                                    },
                                }),
                                ReadFileAs.TEXT,
                            )
                        }
                    >
                        Read File
                    </button>
                </div>
            )
        }
        const { getByTestId } = render(<DummyComponent />)
        expect(getByTestId('dummy-component')).toBeTruthy()
        expect(getByTestId('file-data')).toBeTruthy()
        expect(getByTestId('progress')).toBeTruthy()
        expect(getByTestId('status')).toBeTruthy()
        expect(getByTestId('abort-read')).toBeTruthy()
        fireEvent.click(getByTestId('read-file'))
        expect(getByTestId('valid-file-data')).toBeTruthy()
        // This tests the readFile function
    })

    it('should abort read when abortRead is called', () => {
        const DummyComponent = () => {
            const { fileData, progress, status, readFile, abortRead } = useFileReader()
            const mockInputFile = new File(['Some Text'], 'test.txt', {
                type: 'text/plain',
            })
            return (
                <div data-testid="dummy-component">
                    {!fileData && <div data-testid="file-data">File Data</div>}
                    {fileData && <div data-testid="valid-file-data">{fileData.data}</div>}
                    {!progress && <div data-testid="progress">Progress</div>}
                    {progress && <div data-testid="valid-progress">{progress}</div>}
                    {!status && <div data-testid="status">Status</div>}
                    {abortRead && (
                        <button data-testid="abort-read" onClick={abortRead}>
                            Abort Read
                        </button>
                    )}
                    <button data-testid="read-file" onClick={() => readFile(mockInputFile, validator, ReadFileAs.TEXT)}>
                        Read File
                    </button>
                </div>
            )
        }
        const { getByTestId } = render(<DummyComponent />)
        expect(getByTestId('dummy-component')).toBeTruthy()
        expect(getByTestId('file-data')).toBeTruthy()
        expect(getByTestId('progress')).toBeTruthy()
        expect(getByTestId('status')).toBeTruthy()
        expect(getByTestId('abort-read')).toBeTruthy()
        fireEvent.click(getByTestId('read-file'))
        expect(getByTestId('valid-file-data')).toBeTruthy()
        fireEvent.click(getByTestId('abort-read'))
        expect(getByTestId('file-data')).toBeTruthy()
    })
})
