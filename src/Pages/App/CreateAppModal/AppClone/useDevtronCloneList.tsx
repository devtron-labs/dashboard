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

    const [isListLoading, listResponse, listError, reloadList, setListResponse] = useAsync(() =>
        fetchDevtronCloneList({
            isJobView,
            searchKey,
            cloneListAbortControllerRef,
            handleCloneAppClick,
        }),
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
