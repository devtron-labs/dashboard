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

import { showError } from '@Common/Helper'
import { useState } from 'react'
import { API_STATUS_CODES } from '@Common/Constants'
import { ServerErrors } from '@Common/ServerError'
import { getFileNameFromHeaders } from '@Shared/Helpers'
import { ToastManager, ToastVariantType } from '@Shared/Services'
import { getDownloadResponse } from './service'
import { HandleDownloadProps } from './types'

const useDownload = () => {
    const [isDownloading, setIsDownloading] = useState<boolean>(false)

    /**
     * @param downloadUrl - API url for downloading file
     * @param filterType - Show toast 'Preparing file for download'
     * @param fileName - fileName of the downloaded file
     * @param showSuccessfulToast - show toast on successful download
     * @param downloadSuccessToastContent - Content to show in toast on successful download
     */
    const handleDownload = async ({
        downloadUrl,
        showFilePreparingToast = false,
        fileName,
        showSuccessfulToast = true,
        downloadSuccessToastContent = 'Downloaded Successfully',
    }: HandleDownloadProps): Promise<Error | ServerErrors> => {
        setIsDownloading(true)
        try {
            const response = await getDownloadResponse(downloadUrl)
            if (response.status === API_STATUS_CODES.OK) {
                if (showFilePreparingToast) {
                    ToastManager.showToast({
                        variant: ToastVariantType.info,
                        title: 'Preparing file for download',
                        description: 'File will be downloaded when it is available.',
                    })
                }
                const data = await (response as any).blob()

                // Create a new URL object
                const blobUrl = URL.createObjectURL(data)

                // Create a link element
                const a = document.createElement('a')
                a.href = blobUrl

                a.download = fileName || getFileNameFromHeaders(response.headers) || 'file.tgz'

                // Append the link element to the DOM
                document.body.appendChild(a)

                // Programmatically click the link to start the download
                a.click()

                // Clean up the URL object after the download is complete
                setTimeout(() => {
                    URL.revokeObjectURL(blobUrl)
                    document.body.removeChild(a)
                }, 0)

                if (showSuccessfulToast) {
                    ToastManager.showToast({
                        variant: ToastVariantType.success,
                        description: downloadSuccessToastContent,
                    })
                }
            } else if (response.status === API_STATUS_CODES.NO_CONTENT) {
                throw new Error('No content to download')
            } else {
                const jsonResponseError: ServerErrors = await response?.json()
                throw new ServerErrors(jsonResponseError)
            }
        } catch (error) {
            setIsDownloading(false)
            showError(error)
            return error
        }
        setIsDownloading(false)
        return null
    }

    return { handleDownload, isDownloading }
}

export default useDownload
