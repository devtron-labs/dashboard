/*
 * Copyright (c) 2024. Devtron Inc.
 */

import { useMemo } from 'react'

import {
    ErrorScreenManager,
    GenericEmptyState,
    GenericFilterEmptyState,
    GenericInfoCard,
} from '@devtron-labs/devtron-fe-common-lib'

import { GenericInfoCardListingProps } from './types'

export const GenericInfoCardListing = ({
    isLoading,
    error,
    list,
    searchKey,
    reloadList,
    borderVariant,
    handleClearFilters,
    emptyStateConfig,
}: GenericInfoCardListingProps) => {
    const filteredList = useMemo(() => {
        if (!searchKey || error) {
            return list
        }

        const loweredSearchKey = searchKey.toLowerCase()
        return list.filter(({ title }) => title.toLowerCase().includes(loweredSearchKey))
    }, [searchKey, list, error])

    if (isLoading) {
        return (
            <>
                <GenericInfoCard isLoading borderVariant={borderVariant} />
                <GenericInfoCard isLoading borderVariant={borderVariant} />
                <GenericInfoCard isLoading borderVariant={borderVariant} />
            </>
        )
    }

    if (error) {
        return <ErrorScreenManager code={error?.code as number} reload={reloadList} />
    }

    if (filteredList.length === 0) {
        if (searchKey) {
            return <GenericFilterEmptyState handleClearFilters={handleClearFilters} />
        }

        return <GenericEmptyState {...emptyStateConfig} />
    }

    return (
        <>
            {filteredList.map(({ id, title, description, author, Icon, onClick, linkProps }) => (
                <GenericInfoCard
                    key={id}
                    title={title}
                    description={description}
                    author={author}
                    borderVariant={borderVariant}
                    Icon={Icon}
                    {...(onClick ? { onClick } : { linkProps })}
                />
            ))}
        </>
    )
}
