import React from 'react'
import { components } from 'react-select'
import { useAppGroupAppFilterContext } from './AppGroupDetailsRoute'
import { getOptionBGClass } from './AppGroup.utils'
import { ReactComponent as ShowIcon } from '../../assets/icons/ic-visibility-on.svg'
import { ReactComponent as ShowIconFilter } from '../../assets/icons/ic-visibility-on-filter.svg'
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../assets/icons/ic-error.svg'
import { ReactComponent as InfoIcon } from '../../assets/icons/ic-info-outlined.svg'
import { ReactComponent as Check } from '../../assets/icons/ic-check.svg'
import { ReactComponent as Edit } from '../../assets/icons/ic-pencil.svg'
import { ReactComponent as Trash } from '../../assets/icons/ic-delete-interactive.svg'
import { AppGroupAppFilterContextType } from './AppGroup.types'
import { AppFilterTabs } from './Constants'
import { ConditionalWrap } from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'

export const ValueContainer = (props): JSX.Element => {
    const { appListOptions, selectedAppList, selectedFilterTab, selectedGroupFilter }: AppGroupAppFilterContextType =
        useAppGroupAppFilterContext()
    let selectorText,
        selectedAppsLength = props.getValue().length
    if (selectedFilterTab === AppFilterTabs.GROUP_FILTER && selectedGroupFilter[0]) {
        selectorText = selectedGroupFilter[0]?.label
    } else {
        selectorText = `${selectedAppList.length > 0 ? selectedAppList.length : appListOptions.length}/${
            appListOptions.length
        } Applications`
    }
    return (
        <components.ValueContainer {...props}>
            {!props.selectProps.inputValue ? (
                <>
                    {!props.selectProps.menuIsOpen ? (
                        <>
                            {selectedAppsLength > 0 ? (
                                <ShowIconFilter className="icon-dim-16 mr-4 mw-18" />
                            ) : (
                                <ShowIcon className="icon-dim-16 mr-4 mw-18" />
                            )}
                            <span className="dc__position-abs dc__left-35 cn-9 ml-2">{selectorText}</span>
                        </>
                    ) : (
                        <>
                            <Search className="icon-dim-16 mr-4 mw-18" />
                            <span className="dc__position-abs dc__left-35 cn-5 ml-2">
                                {props.selectProps.placeholder}
                            </span>
                        </>
                    )}
                </>
            ) : (
                <Search className="icon-dim-16 mr-4 mw-18" />
            )}
            {React.cloneElement(props.children[1])}
        </components.ValueContainer>
    )
}

export const Option = (props): JSX.Element => {
    const { isSuperAdmin, selectedFilterTab, openCreateGroup, openDeleteGroup }: AppGroupAppFilterContextType =
        useAppGroupAppFilterContext()
    const { selectOption, data } = props

    const selectData = () => {
        selectOption(data)
    }

    const showEditPopup = (e) => {
        openCreateGroup(e, data.value)
    }

    const showDeletePopup = (e) => {
        openDeleteGroup(e, data.value)
    }

    const renderOptionIcon = (): JSX.Element => {
        if (selectedFilterTab === AppFilterTabs.APP_FILTER) {
            if (props.isSelected || props.isFocused) {
                return (
                    <ShowIcon
                        className={`icon-dim-16 mr-4 mw-18 cursor ${props.isSelected ? 'scb-5' : ''}`}
                        onClick={selectData}
                    />
                )
            }
        } else {
            if (props.isFocused && isSuperAdmin) {
                return (
                    <div className="flex">
                        <Tippy className="default-tt" arrow={false} content="Edit group">
                            <Edit className="icon-dim-16 mr-8 cursor" onClick={showEditPopup} />
                        </Tippy>
                        <Tippy className="default-tt" arrow={false} content="Delete group">
                            <Trash className="scn-6 icon-dim-16 cursor" onClick={showDeletePopup} />
                        </Tippy>
                    </div>
                )
            } else if (props.isSelected) {
                return <Check className="icon-dim-16 mr-4 mw-18 cursor scb-5" onClick={selectData} />
            }
        }

        return null
    }

    const renderTippy = (children): JSX.Element => {
        return (
            <Tippy
                placement="left"
                arrow={false}
                className="default-tt w-200 mr-12 dc__break-word"
                content={data.description}
            >
                <div className="w-100 dc__ellipsis-right">{children}</div>
            </Tippy>
        )
    }

    return (
        <div className={`flex flex-justify pl-8 pr-8 ${getOptionBGClass(props.isSelected, props.isFocused)}`}>
            <ConditionalWrap
                condition={selectedFilterTab === AppFilterTabs.GROUP_FILTER && data.description}
                wrap={renderTippy}
            >
                <components.Option {...props} />
            </ConditionalWrap>

            {renderOptionIcon()}
        </div>
    )
}

export const MenuList = (props: any): JSX.Element => {
    const {
        appListOptions,
        selectedAppList,
        setSelectedAppList,
        selectedFilterTab,
        setSelectedFilterTab,
        groupFilterOptions,
        openCreateGroup,
        selectedGroupFilter,
    }: AppGroupAppFilterContextType = useAppGroupAppFilterContext()
    const clearSelection = (): void => {
        setSelectedAppList([])
    }
    const onTabChange = (e): void => {
        setSelectedFilterTab(e.currentTarget.dataset.selectedTab)
    }
    return (
        <components.MenuList {...props}>
            <div className="dc__position-sticky dc__top-0 dc__no-top-radius bcn-0">
                <div className="pt-6 pr-8 pl-8 env-header-tab">
                    <ul role="tablist" className="tab-list">
                        <li
                            className="tab-list__tab pointer"
                            data-selected-tab={AppFilterTabs.GROUP_FILTER}
                            onClick={onTabChange}
                        >
                            <div
                                className={`mb-6 fs-12 tab-hover ${
                                    selectedFilterTab === AppFilterTabs.GROUP_FILTER ? 'fw-6 active' : 'fw-4'
                                }`}
                            >
                                <span className="mr-6">Saved filters</span>
                            </div>
                            {selectedFilterTab === AppFilterTabs.GROUP_FILTER && (
                                <div className="apps-tab__active-tab" />
                            )}
                        </li>
                        <li
                            className="tab-list__tab pointer"
                            data-selected-tab={AppFilterTabs.APP_FILTER}
                            onClick={onTabChange}
                        >
                            <div
                                className={`mb-6 fs-12 tab-hover ${
                                    selectedFilterTab === AppFilterTabs.APP_FILTER ? 'fw-6 active' : 'fw-4'
                                }`}
                            >
                                <span className="mr-6">All applications </span>
                            </div>
                            {selectedFilterTab === AppFilterTabs.APP_FILTER && <div className="apps-tab__active-tab" />}
                        </li>
                    </ul>
                </div>
                <div className="flex flex-justify dc__window-bg w-100 pt-6 pr-8 pb-6 pl-8">
                    <span className="fs-12 fw-6 cn-9">
                        Working with {selectedAppList?.length > 0 ? selectedAppList.length : appListOptions.length}/
                        {appListOptions?.length} Applications
                    </span>
                    {selectedAppList?.length > 0 && selectedAppList.length !== appListOptions?.length && (
                        <Clear className="icon-dim-16 mr-4 mw-18 cursor icon-n4" onClick={clearSelection} />
                    )}
                </div>
            </div>
            {selectedFilterTab === AppFilterTabs.APP_FILTER || groupFilterOptions?.length ? (
                props.children
            ) : (
                <div className="h-250 flex column">
                    <InfoIcon className="icon-dim-16 mr-4 mw-18 cursor icon-n4 mb-4" />
                    <div className="fs-13 fw-6 cn-9 mb-4">No saved filters</div>
                    <div className="fs-12 fw-4 cn-7 dc__align-center ">
                        To save a filter, select some applications from All applications and click on ‘Save selection as
                        filter’
                    </div>
                </div>
            )}
            {selectedFilterTab === AppFilterTabs.APP_FILTER && selectedAppList?.length > 0 && !selectedGroupFilter[0] && (
                <div
                    className="dc__react-select__bottom dc__no-top-radius dc__align-right bcn-0 fw-6 fs-13 cb-5 pt-8 pr-12 pb-8 pl-12 cursor"
                    style={{ boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.25)' }}
                >
                    <span onClick={openCreateGroup}>Save selection as filter</span>
                </div>
            )}
        </components.MenuList>
    )
}
