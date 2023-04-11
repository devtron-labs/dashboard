import React, { useState } from 'react'
import ReactSelect, { components } from 'react-select'
import { useAppGroupAppFilterContext } from './AppGroupDetailsRoute'
import { appGroupAppSelectorStyle, getOptionBGClass } from './AppGroup.utils'
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

const ValueContainer = (props) => {
    let selectedAppsLength = props.getValue().length

    const selectorText = `${selectedAppsLength > 0 ? selectedAppsLength : props.options.length}/${
        props.options.length
    } Applications`
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

const Option = (props) => {
    const { selectedFilterTab }: AppGroupAppFilterContextType = useAppGroupAppFilterContext()
    const { selectOption, data } = props

    const selectData = () => {
        selectOption(data)
    }

    const Icon = selectedFilterTab === AppFilterTabs.APP_FILTER ? ShowIcon : Check

    return (
        <div className={`flex left pl-8 pr-8 ${getOptionBGClass(props.isSelected, props.isFocused)}`}>
            <components.Option {...props} />
            {selectedFilterTab === AppFilterTabs.APP_FILTER ? (
                (props.isSelected || props.isFocused) && (
                    <ShowIcon
                        className={`icon-dim-16 mr-4 mw-18 cursor ${props.isSelected ? 'scb-5' : ''}`}
                        onClick={selectData}
                    />
                )
            ) : props.isFocused ? (
                <div className="flex">
                    <Edit className="icon-dim-16 mr-4 cursor" />
                    <Trash className="scn-6 icon-dim-16 cursor" />
                </div>
            ) : (
                <Check className="icon-dim-16 mr-4 mw-18 cursor scb-5" onClick={selectData} />
            )}
            {/* {props.isSelected && <Icon className="icon-dim-16 scb-5 mr-4 mw-18 cursor" onClick={selectData} />}
            {props.isFocused &&
                !props.isSelected &&
                (selectedFilterTab === AppFilterTabs.APP_FILTER ? (
                    <ShowIcon className="icon-dim-16 mr-4 mw-18 cursor" onClick={selectData} />
                ) : (
                    <div className="flex">
                        <Edit className="icon-dim-16 mr-4" />
                        <Trash className="scn-6 icon-dim-16" />
                    </div>
                ))} */}

            {/* {(props.isSelected || props.isFocused) && (
                <Icon
                    className={`icon-dim-16 mr-4 mw-18 cursor ${props.isSelected ? 'scb-5' : ''}`}
                    onClick={selectData}
                />
            )}

            <div>
                <Edit className="icon-dim-20" />
                <Trash className="scn-6 icon-dim-20" />
            </div> */}
        </div>
    )
}

const MenuList = (props: any): JSX.Element => {
    const {
        appListOptions,
        selectedAppList,
        setSelectedAppList,
        selectedFilterTab,
        setSelectedFilterTab,
        groupFilterOptions,
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
                <div className="dc__no-top-radius flex left w-100 pt-6 pr-8 pb-6 pl-8 fs-12">
                    <span
                        className={`mr-16 ${
                            selectedFilterTab === AppFilterTabs.GROUP_FILTER ? 'cb-5 fw-6' : 'cn-9 fw-4 cursor'
                        }`}
                        data-selected-tab={AppFilterTabs.GROUP_FILTER}
                        onClick={onTabChange}
                    >
                        Saved filters
                    </span>
                    <span
                        className={`mr-16 ${
                            selectedFilterTab === AppFilterTabs.APP_FILTER ? 'cb-5 fw-6' : 'cn-9 fw-4 cursor'
                        }`}
                        data-selected-tab={AppFilterTabs.APP_FILTER}
                        onClick={onTabChange}
                    >
                        All applications
                    </span>
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
            {selectedFilterTab === AppFilterTabs.APP_FILTER && selectedAppList?.length > 0 && (
                <div
                    className="dc__react-select__bottom dc__no-top-radius dc__align-right bcn-0 fw-6 fs-13 cb-5 pt-8 pr-12 pb-8 pl-12 cursor"
                    style={{ boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.25)' }}
                >
                    <span>Save selection as filter</span>
                </div>
            )}
        </components.MenuList>
    )
}
export default function AppGroupAppFilter() {
    const {
        appListOptions,
        selectedAppList,
        setSelectedAppList,
        isMenuOpen,
        setMenuOpen,
        selectedFilterTab,
        groupFilterOptions,
        selectedGroupFilter,
        setSelectedGroupFilter,
    }: AppGroupAppFilterContextType = useAppGroupAppFilterContext()
    const [appFilterInput, setAppFilterInput] = useState('')

    const handleOpenFilter = (): void => {
        setMenuOpen(true)
    }

    const handleCloseFilter = (): void => {
        setMenuOpen(false)
    }

    const clearAppFilterInput = () => {
        setAppFilterInput('')
    }

    const onAppFilterInputChange = (value, action) => {
        if (action.action === 'input-change') {
            setAppFilterInput(value)
        }
    }

    const escHandler = (event: any) => {
        if (event.keyCode === 27 || event.key === 'Escape') {
            event.target.blur()
        }
    }

    const onChangeFilter = (selectedValue): void => {
        if (selectedFilterTab === AppFilterTabs.APP_FILTER) {
            setSelectedAppList(selectedValue)
        } else {
            setSelectedGroupFilter([selectedValue.pop()])
        }
    }

    return (
        <ReactSelect
            menuIsOpen={isMenuOpen}
            value={selectedFilterTab === AppFilterTabs.APP_FILTER ? selectedAppList : selectedGroupFilter}
            options={selectedFilterTab === AppFilterTabs.APP_FILTER ? appListOptions : groupFilterOptions}
            onChange={onChangeFilter}
            isMulti={true}
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            onMenuOpen={handleOpenFilter}
            onMenuClose={handleCloseFilter}
            blurInputOnSelect={false}
            inputValue={appFilterInput}
            onBlur={clearAppFilterInput}
            onInputChange={onAppFilterInputChange}
            components={{
                IndicatorSeparator: null,
                DropdownIndicator: null,
                ClearIndicator: null,
                Option: Option,
                ValueContainer,
                MenuList,
            }}
            placeholder="Search applications"
            styles={appGroupAppSelectorStyle}
            onKeyDown={escHandler}
        />
    )
}
