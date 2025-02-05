import { Trash } from '@Components/common'
import { Button, ButtonVariantType, ButtonStyleType, ComponentSizeType } from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import { Fragment } from 'react'
import { ReactComponent as Edit } from '@Icons/ic-pencil.svg'
import { getMonitoringToolIcon, getScopeLabel, onImageLoadError } from './ExternalLinks.utils'
import { ExternalLink, ExternalLinkListProps } from './ExternalLinks.type'

export const ExternalLinkList = ({
    filteredLinksLen,
    filteredExternalLinks,
    isAppConfigView,
    setSelectedLink,
    setShowDeleteDialog,
    setShowAddLinkDialog,
    monitoringTools,
}: ExternalLinkListProps) => {
    const onClickEditLink = (link: ExternalLink): void => {
        setSelectedLink(link)
        setShowAddLinkDialog(true)
    }

    const onClickDeleteLink = (link: ExternalLink): void => {
        setSelectedLink(link)
        setShowDeleteDialog(true)
    }

    return (
        <div className="external-links__list dc__overflow-auto">
            {filteredExternalLinks.map((link, idx) => (
                <Fragment key={`external-link-${link.name}`}>
                    <div
                        className={`dc__visible-hover dc__visible-hover--parent external-link dc__hover-n50 ${isAppConfigView ? 'app-config-view' : ''}`}
                    >
                        <div className="external-links__cell--icon">
                            <img
                                src={getMonitoringToolIcon(monitoringTools, link.monitoringToolId)}
                                className="icon-dim-24"
                                onError={onImageLoadError}
                                alt="external-link-icon"
                            />
                        </div>
                        <div
                            className="external-links__cell--tool__name cn-9 fs-13 dc__ellipsis-right"
                            data-testid={`external-link-name-${link.name}`}
                        >
                            {link.name}
                        </div>
                        <div className="external-links__cell--tool__name cn-9 fs-13 dc__ellipsis-right">
                            {link.description ? (
                                <Tippy
                                    className="default-tt dc__mxw-300 dc__word-break"
                                    arrow={false}
                                    placement="top-start"
                                    content={link.description}
                                >
                                    <span data-testid={`external-link-description-${link.name}`}>
                                        {link.description}
                                    </span>
                                </Tippy>
                            ) : (
                                '-'
                            )}
                        </div>
                        {!isAppConfigView && (
                            <div
                                className="external-links__cell--scope cn-9 fs-13 dc__ellipsis-right"
                                data-testid={`external-link-scope-${link.name}`}
                            >
                                {getScopeLabel(link)}
                            </div>
                        )}
                        <div className="external-links__cell--url__template cn-9 fs-13 dc__ellipsis-right">
                            <Tippy
                                className="default-tt dc__mxw-300 dc__word-break"
                                arrow={false}
                                placement="top-start"
                                content={link.url}
                            >
                                <span data-testid={`external-link-url-${link.name}`}>{link.url}</span>
                            </Tippy>
                        </div>
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
                    </div>
                    {idx !== filteredLinksLen - 1 && <div className="external-link__divider w-100 bcn-1" />}
                </Fragment>
            ))}
        </div>
    )
}
