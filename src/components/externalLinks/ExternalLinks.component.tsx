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
import ReactSelect, { components } from 'react-select'
import Tippy from '@tippyjs/react'
import EmptyExternalLinks from '../../assets/img/empty-externallinks@2x.png'
import { ReactComponent as AddIcon } from '../../assets/icons/ic-add.svg'
import { ReactComponent as LinkIcon } from '../../assets/icons/ic-link.svg'
import { ReactComponent as InfoIcon } from '../../assets/icons/info-filled.svg'
import { DOCUMENTATION, URLS } from '../../config'
import {
    AppLevelExternalLinksType,
    ExternalLink,
    NodeLevelExternalLinksType,
    OptionTypeWithIcon,
    RoleBasedInfoNoteProps,
} from './ExternalLinks.type'
import {
    getMonitoringToolIcon,
    getParsedURL,
    MONITORING_TOOL_ICONS,
    onImageLoadError,
} from './ExternalLinks.utils'
import {
    TippyCustomized,
    TippyTheme,
    InfoColourBar,
    GenericEmptyState,
    ConditionalWrap,
    GenericFilterEmptyState,
    SelectPicker,
    SelectPickerVariantType,
    getHandleOpenURL,
} from '@devtron-labs/devtron-fe-common-lib'
import './externalLinks.component.scss'
import { EMPTY_STATE_STATUS } from '../../config/constantMessaging'
import { UserRoleType } from '../../Pages/GlobalConfigurations/Authorization/constants'

export const AddLinkButton = ({ handleOnClick }: { handleOnClick: () => void }): JSX.Element => {
    return (
        <button onClick={handleOnClick} className="add-link cta flex" data-testid="external-links-add-link">
            <AddIcon className="icon-dim-16 mr-8" />
            Add link
        </button>
    )
}

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
    history,
}: {
    handleAddLinkClick: () => void
    isAppConfigView: boolean
    userRole: UserRoleType
    history: any
}): JSX.Element => {
    const handleButton = () => {
        return <AddLinkButton handleOnClick={handleAddLinkClick} />
    }
    return (
        <GenericEmptyState
            image={EmptyExternalLinks}
            title={EMPTY_STATE_STATUS.EXTERNAL_LINK_COMPONENT.TITLE}
            heightToDeduct={120}
            subTitle={
                <>
                    {`Add frequenly visited links (eg. Monitoring dashboards, documents, specs etc.) for
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

export const RoleBasedInfoNote = ({ userRole, listingView }: RoleBasedInfoNoteProps) => {
    return (
        <InfoColourBar
            message={
                userRole === UserRoleType.SuperAdmin
                    ? 'Only links editable by application admins are shown here. To check all configured links,'
                    : 'Only links editable by application admins are shown here. All configured links are available to super admins in'
            }
            classname={`info_bar fs-12 pl-12 pr-12 ${listingView ? 'mt-12 mb-12' : 'dc__mxw-300 m-20'}`}
            Icon={InfoIcon}
            iconClass="h-20"
            linkText={userRole === UserRoleType.SuperAdmin ? 'Go to Global configurations' : 'Global Configurations.'}
            internalLink
            redirectLink={URLS.GLOBAL_CONFIG_EXTERNAL_LINKS}
        />
    )
}

export const NoMatchingResults = (): JSX.Element => {
    return <GenericFilterEmptyState />
}

export const AppLevelExternalLinks = ({
    appDetails,
    helmAppDetails,
    externalLinks,
    monitoringTools,
    isOverviewPage,
}: AppLevelExternalLinksType): JSX.Element | null => {
    const [appLevelExternalLinks, setAppLevelExternalLinks] = useState<OptionTypeWithIcon[]>([])
    const details = appDetails || helmAppDetails

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
                })),
            )
        } else {
            setAppLevelExternalLinks([])
        }
    }, [externalLinks, monitoringTools])

    const getExternalLinkChip = (linkOption: OptionTypeWithIcon, idx: number) => {
        return (
            <ConditionalWrap
                key={`${linkOption.label}-${idx}`}
                condition={!!linkOption.description}
                wrap={(children) => (
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
                )}
            >
                <a
                    key={linkOption.label}
                    href={getParsedURL(true, linkOption.value.toString(), details)}
                    target="_blank"
                    className="external-link-chip flex left bc-n50 h-24 br-4 cn-7 dc__no-decor dc__border"
                    rel="noreferrer"
                >
                    <img
                        className="icon-dim-16 mr-4"
                        src={linkOption.icon}
                        alt={linkOption.label}
                        onError={onImageLoadError}
                    />
                    <span className="dc__ellipsis-right" data-testid="overview_external_link_value">
                        {linkOption.label}
                    </span>
                </a>
            </ConditionalWrap>
        )
    }

    if (isOverviewPage && appLevelExternalLinks.length === 0) {
        return (
            <div className="flex left flex-wrap" data-testid="overview-no-external-links">
                Configure frequently visited links to quickly access from here.&nbsp;
                <ExternalLinksLearnMore />
            </div>
        )
    }

    return (
        appLevelExternalLinks.length > 0 && (
            <div
                data-testid="external-links-wrapper"
                className="app-level__external-links flex left w-100 dc__border-bottom-n1 bcn-0"
            >
                {!isOverviewPage && (
                    <div className="app-level__external-links-icon icon-dim-20">
                        <LinkIcon className="external-links-icon icon-dim-20 fc-9" />
                    </div>
                )}
                <div className="flex left flex-wrap">
                    {appLevelExternalLinks.map((link, idx) => getExternalLinkChip(link, idx))}
                </div>
            </div>
        )
    )
}

export const getExternalLinkIcon = (link) => {
    return <img src={link} alt={link} onError={onImageLoadError} />
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
            <div className="flex dc__react-select__bottom bcn-0 p-8">
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
