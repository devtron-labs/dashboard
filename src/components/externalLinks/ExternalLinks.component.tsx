import React, { useEffect, useState } from 'react'
import { multiSelectStyles } from '../common'
import ReactSelect, { components } from 'react-select'
import EmptyState from '../EmptyState/EmptyState'
import EmptyExternalLinks from '../../assets/img/empty-externallinks@2x.png'
import { ReactComponent as AddIcon } from '../../assets/icons/ic-add.svg'
import { ReactComponent as Link } from '../../assets/icons/ic-link.svg'
import { DOCUMENTATION } from '../../config'
import {
    AppLevelExternalLinksType,
    ExternalLink,
    NodeLevelExternalLinksType,
    OptionTypeWithIcon,
} from './ExternalLinks.type'
import NoResults from '../../assets/img/empty-noresult@2x.png'
import Tippy from '@tippyjs/react'
import {
    customMultiSelectStyles,
    getMonitoringToolIcon,
    getParsedURL,
    MONITORING_TOOL_ICONS,
    onImageLoadError,
} from './ExternalLinks.utils'
import './ExternalLinks.component.scss'
import { OptionType } from '../app/types'

export const AddLinkButton = ({ handleOnClick }: { handleOnClick: () => void }): JSX.Element => {
    return (
        <button onClick={handleOnClick} className="add-link cta flex">
            <AddIcon className="icon-dim-16 mr-8" />
            Add link
        </button>
    )
}

export const NoExternalLinksView = ({ handleAddLinkClick }: { handleAddLinkClick: () => void }): JSX.Element => {
    return (
        <EmptyState>
            <EmptyState.Image>
                <img src={EmptyExternalLinks} alt="Empty external links" />
            </EmptyState.Image>
            <EmptyState.Title>
                <h4 className="title">Connect any monitoring tool for a seamless debugging experience</h4>
            </EmptyState.Title>
            <EmptyState.Subtitle>
                Quickly access any monitoring tool in your stack without losing context of the microserve, pod or
                container you're interested in.
            </EmptyState.Subtitle>
            <EmptyState.Button>
                <AddLinkButton handleOnClick={handleAddLinkClick} />
            </EmptyState.Button>
        </EmptyState>
    )
}

export const NoMatchingResults = (): JSX.Element => {
    return (
        <EmptyState>
            <EmptyState.Image>
                <img src={NoResults} width="250" height="200" alt="No matching results" />
            </EmptyState.Image>
            <EmptyState.Title>
                <h2 className="fs-16 fw-4 c-9">No matching results</h2>
            </EmptyState.Title>
            <EmptyState.Subtitle>We couldn't find any matching external link configuration</EmptyState.Subtitle>
        </EmptyState>
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
            const filteredLinks = externalLinks.filter(filterAppLevelExternalLinks)
            setAppLevelExternalLinks(
                filteredLinks.map((link) => ({
                    label: link.name,
                    value: link.url,
                    icon: getMonitoringToolIcon(monitoringTools, link.monitoringToolId),
                })),
            )
        } else {
            setAppLevelExternalLinks([])
        }
    }, [externalLinks, monitoringTools])

    const getExternalLinkChip = (linkOption: OptionTypeWithIcon, idx: number) => {
        return (
            <Tippy
                key={`${linkOption.label}-${idx}`}
                className="default-tt"
                arrow={false}
                placement="top"
                content={`${linkOption.label} (opens in new tab)`}
            >
                <a
                    key={linkOption.label}
                    href={getParsedURL(true, linkOption.value, details)}
                    target="_blank"
                    className="external-link-chip flex left br-4"
                >
                    <img src={linkOption.icon} alt={linkOption.label} onError={onImageLoadError} />
                    <span className="dc__ellipsis-right">{linkOption.label}</span>
                </a>
            </Tippy>
        )
    }

    if (isOverviewPage && appLevelExternalLinks.length === 0) {
        return (
            <div className="flex left flex-wrap">
                Configure frequently visited links to quickly access from here.&nbsp;
                <a href={DOCUMENTATION.EXTERNAL_LINKS} target="_blank" rel="noreferrer noopener">
                    Learn more
                </a>
            </div>
        )
    }

    return (
        appLevelExternalLinks.length > 0 && (
            <div className="app-level__external-links flex left mb-14">
                {!isOverviewPage && (
                    <div className="app-level__external-links-icon">
                        <Link className="external-links-icon icon-dim-20 fc-9" />
                    </div>
                )}
                <div className="flex left flex-wrap">
                    {appLevelExternalLinks.map((link, idx) => getExternalLinkChip(link, idx))}
                </div>
            </div>
        )
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

    const Option = (props: any): JSX.Element => {
        const { data } = props

        return (
            <Tippy className="default-tt" arrow={false} placement="left" content={`${data.label} (opens in new tab)`}>
                <a
                    key={data.label}
                    href={getParsedURL(false, data.value, details, podName, containerName)}
                    target="_blank"
                    className="external-link-option flex left br-4"
                >
                    <img src={data.icon} alt={data.label} onError={onImageLoadError} />
                    <span className="dc__ellipsis-right">{data.label}</span>
                </a>
            </Tippy>
        )
    }

    return (
        nodeLevelExternalLinks.length > 0 && (
            <div className={`node-level__external-links flex column${addExtraSpace ? ' mr-4' : ''}`}>
                <ReactSelect
                    placeholder={`${nodeLevelExternalLinks.length} Link${nodeLevelExternalLinks.length > 1 ? 's' : ''}`}
                    name={`${podName}-external-links`}
                    options={nodeLevelExternalLinks}
                    isMulti={false}
                    isSearchable={false}
                    closeMenuOnSelect={true}
                    components={{
                        IndicatorSeparator: null,
                        ClearIndicator: null,
                        Option,
                    }}
                    styles={{
                        ...multiSelectStyles,
                        ...customMultiSelectStyles,
                        menu: (base) => ({
                            ...base,
                            width: '150px',
                        }),
                        control: (base) => ({
                            ...base,
                            minWidth: '67px',
                            maxWidth: '112px',
                            minHeight: '24px',
                            backgroundColor: 'var(--N50)',
                            border: '1px solid var(--N200)',
                            cursor: 'pointer',
                        }),
                        option: (base) => ({
                            ...base,
                            cursor: 'pointer',
                        }),
                        valueContainer: (base) => ({
                            ...base,
                            padding: 0,
                            paddingLeft: '8px',
                        }),
                        dropdownIndicator: (base, state) => ({
                            ...customMultiSelectStyles.dropdownIndicator(base, state),
                            padding: '0 8px 0 4px',
                        }),
                        placeholder: (base) => ({
                            ...base,
                            color: 'var(--N700)',
                            margin: 0,
                            minWidth: '45px',
                            maxWidth: '60px',
                        }),
                    }}
                />
            </div>
        )
    )
}

export const ValueContainer = (props): JSX.Element => {
    const length = props.getValue().length

    return (
        <components.ValueContainer {...props}>
            {length > 0 ? (
                <>
                    {!props.selectProps.menuIsOpen && (
                        <>
                            Cluster: {length === props.options.length ? 'All' : <span className="badge">{length}</span>}
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

export const MenuList = (props): JSX.Element => {
    return (
        <components.MenuList {...props}>
            {props.children}
            <div className="flex dc__react-select__bottom bcn-0 p-8">
                <button className="flex cta apply-filter" onClick={props.handleFilterQueryChanges}>
                    Apply Filter
                </button>
            </div>
        </components.MenuList>
    )
}

export const customOption = (data: OptionTypeWithIcon, className = '') => {
    return (
        <div className={`flex left ${className}`}>
            <img
                src={MONITORING_TOOL_ICONS[data.label.toLowerCase()] || MONITORING_TOOL_ICONS.other}
                alt={data.label}
                style={{
                    width: '20px',
                    height: '20px',
                    marginRight: '12px',
                }}
                onError={onImageLoadError}
            />
            <span className="dc__ellipsis-right">{data.label}</span>
        </div>
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
                    {!props.selectProps.menuIsOpen && customOption(selectProps.value, 'absolute-option')}
                    {React.cloneElement(props.children[1])}
                </>
            ) : (
                <>{props.children}</>
            )}
        </components.ValueContainer>
    )
}

export const formatOptionLabelClusters = (option: OptionType): JSX.Element => {
    return (
        <div className="flex left column">
            <span className="w-100 dc__ellipsis-right">{option.label}</span>
            {option.value === '*' && (
                <>
                    <small className="cn-6">All existing and future clusters</small>
                    <div className="modal__dropdown-divider" />
                </>
            )}
        </div>
    )
}
