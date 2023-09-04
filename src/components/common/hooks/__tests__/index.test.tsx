import React, { useRef } from 'react'
import { fireEvent, render } from '@testing-library/react'
import { useFileReader, useClickOutside } from '../'
import { ReadFileAs } from '../types'
import { validator } from '../../../scopedVariables/utils'

describe('hooks', () => {
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
                                    (fileData) => ({
                                        status: true,
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
                        <button
                            data-testid="read-file"
                            onClick={() => readFile(mockInputFile, validator, ReadFileAs.TEXT)}
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
            fireEvent.click(getByTestId('abort-read'))
            expect(getByTestId('file-data')).toBeTruthy()
        })
    })

    describe('useClickOutside', () => {
        it('should call the callback when clicked outside', () => {
            const mockCallback = jest.fn()
            const DummyComponent = () => {
                const ref = useRef(null)
                useClickOutside(ref, mockCallback)
                return <div ref={ref}></div>
            }
            render(<DummyComponent />)
            fireEvent.click(document)
            expect(mockCallback).toHaveBeenCalled()
        })

        it('should not call the callback when clicked inside', () => {
            const mockCallback = jest.fn()
            const DummyComponent = () => {
                const ref = useRef(null)
                useClickOutside(ref, mockCallback)
                return (
                    <>
                        <div ref={ref}>
                            <button className="test-class" />
                        </div>
                    </>
                )
            }
            const { container } = render(<DummyComponent />)
            const button = container.querySelector('.test-class')
            if (button) fireEvent.click(button)
            expect(mockCallback).not.toHaveBeenCalled()
        })
    })
})
