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

import React, { Fragment, useEffect, useState } from 'react'
import { components } from 'react-select'
import Tippy from '@tippyjs/react'
import EmptyExternalLinks from '../../assets/img/empty-externallinks@2x.png'
import { ReactComponent as LinkIcon } from '../../assets/icons/ic-link.svg'
import { ReactComponent as InfoIcon } from '../../assets/icons/info-filled.svg'
import { DOCUMENTATION, URLS } from '../../config'
import {
    AppLevelExternalLinksType,
    ExpandedExternalLink,
    ExternalLink,
    ExternalLinkChipProps,
    ExternalLinkFallbackImageProps,
    NodeLevelExternalLinksType,
    NoExternalLinkViewProps,
    OptionTypeWithIcon,
    RoleBasedInfoNoteProps,
} from './ExternalLinks.type'
import { getMonitoringToolIcon, getParsedURL, MONITORING_TOOL_ICONS, onImageLoadError } from './ExternalLinks.utils'
import {
    TippyCustomized,
    TippyTheme,
    GenericEmptyState,
    ConditionalWrap,
    GenericFilterEmptyState,
    SelectPicker,
    SelectPickerVariantType,
    getHandleOpenURL,
    EMPTY_STATE_STATUS,
    VisibleModal2,
    stopPropagation,
    Button,
    ButtonVariantType,
    ComponentSizeType,
    ButtonComponentType,
    ButtonStyleType,
    ImageWithFallback,
    InfoBlock,
} from '@devtron-labs/devtron-fe-common-lib'
import './externalLinks.component.scss'
import { UserRoleType } from '../../Pages/GlobalConfigurations/Authorization/constants'
import { ReactComponent as ICArrowOut } from '@Icons/ic-arrow-square-out.svg'
import { ReactComponent as ICClose } from '@Icons/ic-close.svg'
import ICWebpage from '@Icons/tools/ic-link-webpage.png'
import { AddLinkButton } from './AddLinkButton'
import { Link } from 'react-router-dom'

export const ExternalLinksLearnMore = (): JSX.Element => {
    return (
        <a href={DOCUMENTATION.EXTERNAL_LINKS} target="_blank" rel="noreferrer noopener">
            Learn more
        </a>
    )
}

export const NoExternalLinksView = ({
    handleAddLinkClick,
    isAppConfigView,
    userRole,
}: NoExternalLinkViewProps): JSX.Element => {
    const handleButton = () => {
        return <AddLinkButton handleOnClick={handleAddLinkClick} />
    }
    return (
        <GenericEmptyState
            image={EmptyExternalLinks}
            title={EMPTY_STATE_STATUS.EXTERNAL_LINK_COMPONENT.TITLE}
            subTitle={
                <>
                    {`Add frequently visited links (eg. Monitoring dashboards, documents, specs etc.) for
                    ${isAppConfigView ? ' this ' : ' any '}application. Links will be available on the app details
                    page. `}
                    <ExternalLinksLearnMore />
                </>
            }
            isButtonAvailable
            renderButton={handleButton}
            children={isAppConfigView && <RoleBasedInfoNote userRole={userRole} />}
        />
    )
}

const redirectToGlobalConfig = (linkText) => {
    return <Link
        to={URLS.GLOBAL_CONFIG_EXTERNAL_LINKS}
        data-testid="info-bar-internal-link"
        className="cursor dc__link dc__underline-onhover mr-5 dc__no-decor"
    >
        {linkText}
    </Link>
}

const renderInfoDescription = (userRole) => {
    if (userRole === UserRoleType.SuperAdmin) {
        return (
            <span>
                Only links editable by application admins are shown here. To check all configured links,&nbsp;
                {redirectToGlobalConfig('Go to Global configuration')}
            </span>
        )
    }
    return (
        <span>
            Only links editable by application admins are shown here. All configured links are available to super admins
            in&nbsp;{redirectToGlobalConfig('Global Configurations')}
        </span>
    )
}

export const RoleBasedInfoNote = ({ userRole, listingView }: RoleBasedInfoNoteProps) => {
    return (
        <div className="flexbox-col px-20">
            <InfoBlock
                description={renderInfoDescription(userRole)}
            />
        </div>
    )
}

export const NoMatchingResults = (): JSX.Element => {
    return <GenericFilterEmptyState />
}

const ExternalLinkFallbackImage = ({ dimension, src, alt }: ExternalLinkFallbackImageProps) => (
    <ImageWithFallback
        imageProps={{
            className: `dc__no-shrink icon-dim-${dimension}`,
            height: dimension,
            width: dimension,
            src: src,
            alt: alt,
        }}
        fallbackImage={ICWebpage}
    />
)

const ExternalLinkIframeModal = ({ selectedExternalLink, handleCloseModal }) => (
    <VisibleModal2 close={handleCloseModal}>
        <div
            className="flexbox-col dc__position-abs br-8 dc__top-12 dc__bottom-12 dc__right-12 dc__left-12 bg__primary"
            onClick={stopPropagation}
        >
            <div className="flexbox dc__content-space px-20 py-12 dc__align-items-center dc__border-bottom">
                <div className="flexbox dc__gap-8 dc__align-items-center">
                    <ExternalLinkFallbackImage
                        dimension={20}
                        src={selectedExternalLink.icon}
                        alt={selectedExternalLink.label}
                    />
                    <h2 className="cn-9 fs-16 fw-6 lh-24 dc__truncate m-0-imp">{selectedExternalLink.label}</h2>
                </div>
                <div className="flexbox dc__gap-8">
                    <Button
                        ariaLabel="external-link-open"
                        dataTestId="external-link-open"
                        icon={<ICArrowOut />}
                        variant={ButtonVariantType.borderLess}
                        size={ComponentSizeType.xs}
                        component={ButtonComponentType.button}
                        style={ButtonStyleType.neutral}
                        onClick={getHandleOpenURL(selectedExternalLink.externalLinkURL)}
                        showAriaLabelInTippy={false}
                    />
                    <Button
                        ariaLabel="external-link-modal-close"
                        dataTestId="external-link-modal-close"
                        icon={<ICClose />}
                        variant={ButtonVariantType.borderLess}
                        size={ComponentSizeType.xs}
                        component={ButtonComponentType.button}
                        style={ButtonStyleType.negativeGrey}
                        onClick={handleCloseModal}
                        showAriaLabelInTippy={false}
                    />
                </div>
            </div>
            <iframe
                className="flex-grow-1 dc__no-border dc__bottom-radius-8"
                src={selectedExternalLink.externalLinkURL}
                height="100%"
                width="100%"
                sandbox="allow-same-origin allow-scripts"
                referrerPolicy="no-referrer"
            />
        </div>
    </VisibleModal2>
)

const ExternalLinkChip = ({ linkOption, idx, handleOpenModal, details, isOverviewPage }: ExternalLinkChipProps) => {
    const externalLinkURL = getParsedURL(true, linkOption.value.toString(), details)
    const handleTextClick = () => handleOpenModal(linkOption, externalLinkURL)

    const getTippyForLink = (children) => (
        <TippyCustomized
            theme={TippyTheme.white}
            className="w-300"
            placement={isOverviewPage ? 'bottom' : 'top'}
            iconPath={linkOption.icon}
            heading={linkOption.label}
            infoText={linkOption.description}
        >
            <div>{children}</div>
        </TippyCustomized>
    )

    return (
        <ConditionalWrap
            key={`${linkOption.label}-${idx}`}
            condition={!!linkOption.description}
            wrap={(children) => getTippyForLink(children)}
        >
            <div
                className={`dc__grid br-4 dc__border dc__align-items-center ${linkOption.openInNewTab ? '' : 'external-link-chip'}`}
            >
                <button
                    className={`flexbox dc__gap-4 px-6 py-2 dc__align-items-center dc__unset-button-styles dc__hover-n50 dc__left-radius-3 ${linkOption.openInNewTab ? 'dc__right-radius-3' : ''}`}
                    type="button"
                    onClick={linkOption.openInNewTab ? getHandleOpenURL(externalLinkURL) : handleTextClick}
                >
                    <ExternalLinkFallbackImage dimension={16} src={linkOption.icon} alt={linkOption.label} />
                    <span
                        className="fs-12 lh-20 fw-4 dc-9 dc__ellipsis-right dc__mxw-200"
                        data-testid="overview_external_link_value"
                    >
                        {linkOption.label}
                    </span>
                </button>
                {!linkOption.openInNewTab && (
                    <a
                        key={linkOption.label}
                        href={externalLinkURL}
                        target="_blank"
                        rel="noreferrer"
                        className="flex p-4 open-link-button dc__hover-n50 dc__right-radius-3 dc__border-left"
                    >
                        <ICArrowOut className="icon-dim-16 scn-6 dc__no-shrink arrow-out-icon" />
                    </a>
                )}
            </div>
        </ConditionalWrap>
    )
}

export const AppLevelExternalLinks = ({
    appDetails,
    helmAppDetails,
    externalLinks,
    monitoringTools,
    isOverviewPage,
}: AppLevelExternalLinksType): JSX.Element | null => {
    const [appLevelExternalLinks, setAppLevelExternalLinks] = useState<OptionTypeWithIcon[]>([])
    const [expandedExternalLink, setExpandedExternalLink] = useState<ExpandedExternalLink>(null)
    const details = appDetails || helmAppDetails

    const handleOpenModal = (linkOption: OptionTypeWithIcon, externalLinkURL: string) => {
        setExpandedExternalLink({ ...linkOption, externalLinkURL })
    }

    const handleCloseModal = () => {
        setExpandedExternalLink(null)
    }

    const filterAppLevelExternalLinks = (link: ExternalLink) => {
        if (isOverviewPage) {
            const matchedVars = link.url.match(/{(.*?)}/g)
            if (
                !Array.isArray(matchedVars) ||
                matchedVars.length === 0 ||
                matchedVars.every((_match) => _match === '{appName}' || _match === '{appId}')
            ) {
                return link
            }
        } else if (!link.url.includes('{podName}') && !link.url.includes('{containerName}')) {
            return link
        }
    }

    useEffect(() => {
        if (externalLinks.length > 0 && monitoringTools.length > 0) {
            const filteredLinks: ExternalLink[] = externalLinks.filter(filterAppLevelExternalLinks)
            setAppLevelExternalLinks(
                filteredLinks.map((link: ExternalLink) => ({
                    label: link.name,
                    value: link.url,
                    icon: getMonitoringToolIcon(monitoringTools, link.monitoringToolId),
                    startIcon: getExternalLinkIcon(getMonitoringToolIcon(monitoringTools, link.monitoringToolId)),
                    description: link.description,
                    openInNewTab: link.openInNewTab,
                })),
            )
        } else {
            setAppLevelExternalLinks([])
        }
    }, [externalLinks, monitoringTools])

    if (isOverviewPage && appLevelExternalLinks.length === 0) {
        return (
            <div className="flex left flex-wrap" data-testid="overview-no-external-links">
                Configure frequently visited links to quickly access from here.&nbsp;
                <ExternalLinksLearnMore />
            </div>
        )
    }

    return (
        <>
            {appLevelExternalLinks.length > 0 && (
                <div
                    data-testid="external-links-wrapper"
                    className="app-level__external-links flex left w-100 bg__primary dc__no-shrink dc__border-top-n1"
                >
                    {!isOverviewPage && (
                        <div className="app-level__external-links-icon icon-dim-20">
                            <LinkIcon className="external-links-icon icon-dim-20 fc-9" />
                        </div>
                    )}
                    <div className="flex left flex-wrap dc__gap-8">
                        {appLevelExternalLinks.map((link, idx) => (
                            <ExternalLinkChip
                                key={`${link.label}-${idx}`}
                                linkOption={link}
                                idx={idx}
                                handleOpenModal={handleOpenModal}
                                isOverviewPage={isOverviewPage}
                                details={details}
                            />
                        ))}
                    </div>
                </div>
            )}
            {expandedExternalLink && (
                <ExternalLinkIframeModal
                    selectedExternalLink={expandedExternalLink}
                    handleCloseModal={handleCloseModal}
                />
            )}
        </>
    )
}

export const getExternalLinkIcon = (link) => {
    return (
        <ImageWithFallback
            imageProps={{
                className: 'dc__no-shrink',
                height: 20,
                width: 20,
                src: link,
                alt: link,
            }}
            fallbackImage={ICWebpage}
        />
    )
}

export const NodeLevelExternalLinks = ({
    appDetails,
    helmAppDetails,
    nodeLevelExternalLinks,
    podName,
    containerName,
    addExtraSpace,
}: NodeLevelExternalLinksType): JSX.Element | null => {
    const details = appDetails || helmAppDetails

    const onClickExternalLink = (link: OptionTypeWithIcon) => {
        getHandleOpenURL(getParsedURL(false, link.value.toString(), details, podName, containerName))()
    }

    return (
        nodeLevelExternalLinks.length > 0 && (
            <div className={`node-level__external-links flex column${addExtraSpace ? ' mr-4' : ''}`}>
                <SelectPicker
                    inputId={`${podName}-external-links`}
                    name={`${podName}-external-links`}
                    placeholder={`${nodeLevelExternalLinks.length} Link${nodeLevelExternalLinks.length > 1 ? 's' : ''}`}
                    options={nodeLevelExternalLinks}
                    isSearchable={false}
                    shouldMenuAlignRight
                    variant={SelectPickerVariantType.BORDER_LESS}
                    onChange={onClickExternalLink}
                />
            </div>
        )
    )
}

export const ValueContainer = (props): JSX.Element => {
    const { length } = props.getValue()

    return (
        <components.ValueContainer {...props}>
            {length > 0 ? (
                <>
                    {!props.selectProps.menuIsOpen && (
                        <>
                            {props.selectProps.name.includes('Clusters') ? 'Cluster: ' : 'Application: '}
                            {length === props.options.length ? 'All' : <span className="badge">{length}</span>}
                        </>
                    )}
                    {React.cloneElement(props.children[1])}
                </>
            ) : (
                <>{props.children}</>
            )}
        </components.ValueContainer>
    )
}

export const FilterMenuList = (props): JSX.Element => {
    return (
        <components.MenuList {...props}>
            {props.children}
            <div className="flex dc__react-select__bottom bg__primary p-8">
                <button
                    data-testid="external-link-filter-button"
                    className="flex cta apply-filter"
                    onClick={props.handleFilterQueryChanges}
                >
                    Apply Filter
                </button>
            </div>
        </components.MenuList>
    )
}

export const ToolsMenuList = (props): JSX.Element => {
    const lastIndex = props.options?.length - 1

    return (
        <components.MenuList {...props}>
            <>
                {props.options ? (
                    <div className="link-tool-options-wrapper">
                        {props.options.map((_opt, idx) => (
                            <Fragment key={_opt.label}>
                                <div className="link-tool-option">
                                    {_opt.options?.map((_option) => {
                                        return customOption(
                                            _option,
                                            true,
                                            (_option) => props.selectOption(_option),
                                            _option.label === props.selectProps?.value?.label,
                                            true,
                                            true,
                                        )
                                    })}
                                </div>
                                {lastIndex !== idx && <div className="dc__border-bottom-n1" />}
                            </Fragment>
                        ))}
                    </div>
                ) : (
                    <span className="flex p-8 cn-5">No options</span>
                )}
            </>
        </components.MenuList>
    )
}

export const customOption = (
    data: OptionTypeWithIcon,
    isIconDropdown?: boolean,
    onClick?: (selected: OptionTypeWithIcon) => void,
    isSelected?: boolean,
    noMarginRight?: boolean,
    noDefaultIcon?: boolean,
) => {
    const _src = MONITORING_TOOL_ICONS[data.label.toLowerCase()] || (noDefaultIcon ? '' : MONITORING_TOOL_ICONS.webpage)

    const onClickHandler = (e) => {
        e.stopPropagation()
        if (onClick) {
            onClick(data)
        }
    }

    return (
        _src && (
            <div
                className={`custom-option-with-icon flex icon-dim-36 ${isSelected ? 'bcb-1' : ''}`}
                key={data.label}
                onClick={onClickHandler}
            >
                <Tippy className="default-tt" arrow={false} placement="top" content={data.label}>
                    <img
                        src={_src}
                        alt={data.label}
                        style={{
                            width: isIconDropdown ? '28px' : '20px',
                            height: isIconDropdown ? '28px' : '20px',
                            marginRight: noMarginRight ? '0px' : '12px',
                        }}
                        onError={onImageLoadError}
                    />
                </Tippy>
            </div>
        )
    )
}

export const customOptionWithIcon = (props) => {
    const { data } = props
    return <components.Option {...props}>{customOption(data)}</components.Option>
}

export const customValueContainerWithIcon = (props) => {
    const { selectProps } = props
    return (
        <components.ValueContainer {...props}>
            {selectProps.value ? (
                <>
                    {customOption(selectProps.value)}
                    {React.cloneElement(props.children[1], {
                        style: {
                            position: 'absolute',
                        },
                    })}
                </>
            ) : (
                <>{props.children}</>
            )}
        </components.ValueContainer>
    )
}
