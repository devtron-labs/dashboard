import React, { useState } from 'react'
import ReactSelect, { components } from 'react-select'
import { useAppGroupAppFilterContext } from './AppGroupDetailsRoute'
import { appGroupAppSelectorStyle, getOptionBGClass } from './AppGroup.utils'
import { ReactComponent as ShowIcon } from '../../assets/icons/ic-visibility-on.svg'
import { ReactComponent as ShowIconFilter } from '../../assets/icons/ic-visibility-on-filter.svg'
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../assets/icons/ic-error.svg'
import { AppGroupAppFilterContextType } from './AppGroup.types'

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
                            <span
                                data-testid="app-group-selector-text"
                                className="dc__position-abs dc__left-35 cn-9 ml-2"
                            >
                                {selectorText}
                            </span>
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
    const { selectOption, data } = props

    const selectData = () => {
        selectOption(data)
    }

    return (
        <div className={`flex left pl-8 pr-8 ${getOptionBGClass(props.isSelected, props.isFocused)}`}>
            <components.Option {...props} />
            {props.isSelected && <ShowIcon className="icon-dim-16 scb-5 mr-4 mw-18 cursor" onClick={selectData} />}
            {props.isFocused && !props.isSelected && (
                <ShowIcon className="icon-dim-16 mr-4 mw-18 cursor" onClick={selectData} />
            )}
        </div>
    )
}

const MenuList = (props: any): JSX.Element => {
    const { appListOptions, selectedAppList, setSelectedAppList }: AppGroupAppFilterContextType =
        useAppGroupAppFilterContext()
    const clearSelection = (): void => {
        setSelectedAppList([])
    }
    return (
        <components.MenuList {...props}>
            <div className="flex flex-justify dc__position-sticky dc__top-0 dc__window-bg dc__no-top-radius w-100 pt-6 pr-8 pb-6 pl-8">
                <span className="fs-12 fw-6 cn-9">
                    Working with {selectedAppList?.length > 0 ? selectedAppList.length : appListOptions.length}/
                    {appListOptions?.length} Applications
                </span>
                {selectedAppList?.length > 0 && selectedAppList.length !== appListOptions?.length && (
                    <Clear className="icon-dim-16 mr-4 mw-18 cursor icon-n4" onClick={clearSelection} />
                )}
            </div>
            {props.children}
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

    return (
        <ReactSelect
            menuIsOpen={isMenuOpen}
            value={selectedAppList}
            options={appListOptions}
            onChange={setSelectedAppList}
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
