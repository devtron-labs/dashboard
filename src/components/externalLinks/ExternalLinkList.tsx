import { Trash } from '@Components/common'
import {
    Button,
    ButtonVariantType,
    ButtonStyleType,
    ComponentSizeType,
    GenericFilterEmptyState,
    useUrlFilters,
} from '@devtron-labs/devtron-fe-common-lib'
import { Fragment } from 'react'
import { ReactComponent as Edit } from '@Icons/ic-pencil.svg'
import { InteractiveCellText } from '@Components/common/helpers/InteractiveCellText/InteractiveCellText'
import { getMonitoringToolIcon, getScopeLabel, onImageLoadError } from './ExternalLinks.utils'
import {
    ExternalLink,
    ExternalLinkListProps,
    ExternalLinkMapListSortableKeys,
    ExternalListUrlFiltersType,
    parseSearchParams,
} from './ExternalLinks.type'

export const ExternalLinkList = ({
    filteredLinksLen,
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

    const { clusters, apps, clearFilters, searchKey } = urlFilters

    const onClickEditLink = (link: ExternalLink): void => {
        setSelectedLink(link)
        setShowAddLinkDialog(true)
    }

    const onClickDeleteLink = (link: ExternalLink): void => {
        setSelectedLink(link)
        setShowDeleteDialog(true)
    }

    const renderExternalLinksHeader = (): JSX.Element => (
        <div
            className={`external-link-list__row dc__align-items-center h-40 fs-12 fw-6 dc__uppercase px-20 py-6 dc__gap-16 dc__border-bottom dc__position-sticky dc__top-0 cn-7 ${
                isAppConfigView ? 'app-config-view' : ''
            }`}
        >
            <span className="icon-dim-24" />
            <span className="lh-20">Name</span>
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
                <Fragment key={`external-link-${link.name}`}>
                    <div
                        className={`external-link-list__row dc__align-items-center dc__gap-16 dc__visible-hover dc__visible-hover--parent dc__hover-n50 cn-9 fs-13 px-20 py-10 ${isAppConfigView ? 'app-config-view' : ''}`}
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
                            text={link.description}
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
                    {idx !== filteredLinksLen - 1 && <div className="external-link__divider w-100 bcn-1" />}
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

    if ((clusters.length || apps.length || searchKey) && filteredLinksLen === 0) {
        return (
            <GenericFilterEmptyState
                classname="dc__align-reload-center"
                isButtonAvailable
                renderButton={renderClearFilterButton}
            />
        )
    }

    return (
        <div className={`external-links bg__primary ${isAppConfigView ? 'app-config-view__listing' : ''}`}>
            {renderExternalLinksHeader()}
            {renderExternalListContent()}
        </div>
    )
}
