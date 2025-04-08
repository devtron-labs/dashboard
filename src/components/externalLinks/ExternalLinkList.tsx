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

import { Fragment } from 'react'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    GenericFilterEmptyState,
    SortableTableHeaderCell,
    useUrlFilters,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as Edit } from '@Icons/ic-pencil.svg'
import { Trash } from '@Components/common'
import { InteractiveCellText } from '@Components/common/helpers/InteractiveCellText/InteractiveCellText'

import {
    ExternalLink,
    ExternalLinkListProps,
    ExternalLinkMapListSortableKeys,
    ExternalListUrlFiltersType,
    parseSearchParams,
} from './ExternalLinks.type'
import { getMonitoringToolIcon, getScopeLabel, onImageLoadError } from './ExternalLinks.utils'

export const ExternalLinkList = ({
    filteredExternalLinks,
    isAppConfigView,
    setSelectedLink,
    setShowDeleteDialog,
    setShowAddLinkDialog,
    monitoringTools,
}: ExternalLinkListProps) => {
    const urlFilters = useUrlFilters<ExternalLinkMapListSortableKeys, ExternalListUrlFiltersType>({
        initialSortKey: ExternalLinkMapListSortableKeys.linkName,
        parseSearchParams,
    })

    const { clusters, apps, clearFilters, searchKey, sortBy, sortOrder, handleSorting } = urlFilters

    const onClickEditLink = (link: ExternalLink): void => {
        setSelectedLink(link)
        setShowAddLinkDialog(true)
    }

    const onClickDeleteLink = (link: ExternalLink): void => {
        setSelectedLink(link)
        setShowDeleteDialog(true)
    }

    const handleAppNameSorting = () => {
        handleSorting(ExternalLinkMapListSortableKeys.linkName)
    }

    const renderExternalLinksHeader = (): JSX.Element => (
        <div
            className={` dc__align-items-center h-40 fs-12 fw-6 dc__uppercase px-20 py-6 dc__gap-16 dc__border-bottom dc__position-sticky dc__top-0 cn-7 bg__primary ${
                isAppConfigView ? 'app-config-view external-link-list__row__app-config' : 'external-link-list__row'
            }`}
        >
            <span className="icon-dim-24" />
            <span className="lh-20">
                <SortableTableHeaderCell
                    title="Name"
                    isSorted={sortBy === ExternalLinkMapListSortableKeys.linkName}
                    sortOrder={sortOrder}
                    triggerSorting={handleAppNameSorting}
                    disabled={false}
                />
            </span>
            <span className="lh-20">Description</span>
            {!isAppConfigView && <span className="lh-20">Scope</span>}
            <span className="lh-20">Url Template</span>
        </div>
    )

    const renderActionButton = (link: ExternalLink) => (
        <div className="flex dc__visible-hover--child">
            <div className="flex dc__gap-4">
                <Button
                    icon={<Edit />}
                    variant={ButtonVariantType.borderLess}
                    style={ButtonStyleType.neutral}
                    size={ComponentSizeType.xs}
                    ariaLabel="Edit"
                    data-link={link}
                    dataTestId={`external-link-edit-button-${link.name}`}
                    onClick={() => onClickEditLink(link)}
                />
                <Button
                    icon={<Trash />}
                    variant={ButtonVariantType.borderLess}
                    style={ButtonStyleType.negativeGrey}
                    size={ComponentSizeType.xs}
                    ariaLabel="Delete"
                    dataTestId={`external-link-delete-button-${link.name}`}
                    onClick={() => onClickDeleteLink(link)}
                />
            </div>
        </div>
    )

    const renderExternalListContent = () => (
        <div className="dc__overflow-auto">
            {filteredExternalLinks.map((link, idx) => (
                <Fragment key={`external-link-${link.name}-${link.id}`}>
                    <div
                        className={`dc__align-items-center dc__gap-16 dc__visible-hover dc__visible-hover--parent dc__hover-n50 cn-9 fs-13 px-20 py-10 ${isAppConfigView ? 'app-config-view external-link-list__row__app-config' : 'external-link-list__row'} ${idx !== filteredExternalLinks.length - 1 ? 'border__secondary--bottom' : ''}`}
                    >
                        <div className="p-2 flex">
                            <img
                                src={getMonitoringToolIcon(monitoringTools, link.monitoringToolId)}
                                className="flex icon-dim-20 dc__no-shrink"
                                onError={onImageLoadError}
                                alt="external-link-icon"
                            />
                        </div>
                        <InteractiveCellText text={link.name} data-testid={`external-link-name-${link.name}`} />
                        <InteractiveCellText
                            text={link.description || '-'}
                            data-testid={`external-link-description-${link.name}`}
                        />

                        {!isAppConfigView && (
                            <div className=" dc__ellipsis-right" data-testid={`external-link-scope-${link.name}`}>
                                {getScopeLabel(link)}
                            </div>
                        )}
                        <InteractiveCellText text={link.url} data-testid={`external-link-url-${link.name}`} />
                        {renderActionButton(link)}
                    </div>
                </Fragment>
            ))}
        </div>
    )

    const renderClearFilterButton = () => (
        <div className="dc__align-center dc__gap-16 dc__mt-24">
            <Button
                size={ComponentSizeType.medium}
                variant={ButtonVariantType.primary}
                style={ButtonStyleType.default}
                onClick={clearFilters}
                dataTestId="clear-filter-button"
                text="Clear Filters"
            />
        </div>
    )

    if ((clusters.length || apps.length || searchKey) && filteredExternalLinks.length === 0) {
        return (
            <div className="flex flex-grow-1">
                <GenericFilterEmptyState isButtonAvailable renderButton={renderClearFilterButton} />
            </div>
        )
    }

    return (
        <div className="external-links bg__primary">
            {renderExternalLinksHeader()}
            {renderExternalListContent()}
        </div>
    )
}
