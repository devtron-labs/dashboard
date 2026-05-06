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

/*
 * Copyright (c) 2024. Devtron Inc.
 */
import { useEffect, useRef, useState } from 'react'

import { getIsRequestAborted, showError, useAsync } from '@devtron-labs/devtron-fe-common-lib'

import { APP_TYPE } from '@Config/constants'

import { fetchDevtronCloneList } from '../service'
import { DevtronAppCloneListProps } from './types'

export const useDevtronCloneList = ({ handleCloneAppClick, isJobView, searchKey }: DevtronAppCloneListProps) => {
    const cloneListAbortControllerRef = useRef(new AbortController())
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [hasError, setHasError] = useState(false)

    useEffect(
        () => () => {
            cloneListAbortControllerRef.current.abort()
        },
        [],
    )

    const [isListLoading, listResponse, listError, reloadList, setListResponse] = useAsync(
        () =>
            fetchDevtronCloneList({
                isJobView,
                searchKey,
                cloneListAbortControllerRef,
                handleCloneAppClick,
            }),
        isJobView ? [searchKey] : [], // Since job list is paginated, we want to refetch the list on searchKey change
    )

    const loadMoreData = async () => {
        if (isLoadingMore || !listResponse) return

        setIsLoadingMore(true)
        try {
            if (listResponse.type === APP_TYPE.JOB) {
                const currentList = listResponse.list

                const response = await fetchDevtronCloneList({
                    isJobView,
                    searchKey,
                    offset: currentList.length,
                    cloneListAbortControllerRef,
                    handleCloneAppClick,
                })

                setListResponse({
                    ...response,
                    list: [...currentList, ...response.list],
                })
            }
        } catch (error) {
            setHasError(true)
            showError(error)
        } finally {
            setIsLoadingMore(false)
        }
    }

    return {
        isListLoading: isListLoading || getIsRequestAborted(listError),
        list: listResponse?.list ?? [],
        listError,
        reloadList,
        totalCount: listResponse?.totalCount ?? 0,
        loadMoreData,
        hasMoreData: listResponse?.type === APP_TYPE.JOB && (listResponse.list?.length ?? 0) < listResponse.totalCount,
        hasError,
        isLoadingMore,
    }
}
