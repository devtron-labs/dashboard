import React, { useState, useEffect } from 'react'
import ReactSelect, { components, MultiValue } from 'react-select'
import { ReactComponent as ShowIcon } from '../../assets/icons/ic-visibility-on.svg'
import { ReactComponent as HideIcon } from '../../assets/icons/ic-visibility-off.svg'
import { ReactComponent as Clear } from '../../assets/icons/ic-error.svg'
import { OptionType } from '../app/types'
import { useAppGroupAppFilterContext } from './AppGroupDetailsRoute'
import { appGroupAppSelectorStyle } from './AppGroup.utils'

const ValueContainer = (props) => {
    let selectedAppsLength = props.getValue().length

    const selectorText = `${selectedAppsLength > 0 ? selectedAppsLength : props.options.length}/${
        props.options.length
    } Applications`
    return (
        <components.ValueContainer {...props}>
            <ShowIcon className="icon-dim-16 mr-4 mw-18" />
            {!props.selectProps.inputValue && (
                <>
                    {!props.selectProps.menuIsOpen ? (
                        <span className="dc__position-abs dc__left-35 cn-9 ml-2">{selectorText}</span>
                    ) : (
                        <span className="dc__position-abs dc__left-35 cn-5 ml-2">{props.selectProps.placeholder}</span>
                    )}
                </>
            )}
            {React.cloneElement(props.children[1])}
        </components.ValueContainer>
    )
}

const Option = (props) => {
    const { selectOption, data } = props
    const {
        selectedAppList,
    }: {
        selectedAppList: MultiValue<OptionType>
    } = useAppGroupAppFilterContext()

    const selectData = () => {
        selectOption(data)
    }

    const renderIcon = (): JSX.Element => {
        if (selectedAppList?.length) {
            if (props.isSelected) {
                return <ShowIcon className="icon-dim-16 scb-5 mr-4 mw-18 cursor" onClick={selectData} />
            } else {
                return <HideIcon className="icon-dim-16 mr-4 mw-18 cursor" onClick={selectData} />
            }
        } else {
            return <ShowIcon className="icon-dim-16 mr-4 mw-18 cursor" onClick={selectData} />
        }
    }

    return (
        <div className="flex left pl-12" style={{ background: props.isFocused ? 'var(--N100)' : 'transparent' }}>
            {renderIcon()}
            <components.Option {...props} />
        </div>
    )
}

const MenuList = (props: any): JSX.Element => {
    const {
        appListOptions,
        selectedAppList,
        setSelectedAppList,
    }: {
        appListOptions: OptionType[]
        selectedAppList: MultiValue<OptionType>
        setSelectedAppList: React.Dispatch<React.SetStateAction<MultiValue<OptionType>>>
    } = useAppGroupAppFilterContext()
    const clearSelection = (): void => {
        setSelectedAppList([])
    }
    return (
        <components.MenuList {...props}>
            <div className="flex flex-justify dc__position-sticky dc__top-0 dc__window-bg dc__no-top-radius w-100 pt-4 pr-10 pb-4 pl-10">
                <span className="fs-12 fw-6 cn-9">
                    {selectedAppList?.length}/{appListOptions?.length} Applications
                </span>
                {selectedAppList?.length > 0 && selectedAppList.length !== appListOptions?.length && (
                    <Clear className="icon-dim-16 mr-4 mw-18 cursor icon-n4" onClick={clearSelection} />
                )}
            </div>
            {props.children}
            <div className="dc__react-select__bottom bcv-1 p-8 fs-12 fw-4 cn-9">
                Select apps you’re working with. Only selected apps will be shown across tabs.
            </div>
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
    }: {
        appListOptions: OptionType[]
        selectedAppList: MultiValue<OptionType>
        setSelectedAppList: React.Dispatch<React.SetStateAction<MultiValue<OptionType>>>
        isMenuOpen: boolean
        setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>
    } = useAppGroupAppFilterContext()
    const [appFilterInput, setAppFilterInput] = useState('')

    const handleMenuState = (menuOpenState: boolean): void => {
        setMenuOpen(menuOpenState)
    }

    const handleCloseFilter = (): void => {
        handleMenuState(false)
    }

    const clearAppFilterInput = () => {
        setAppFilterInput('')
    }

    const onAppFilterInputChange = (value, action) => {
        if (action.action === 'input-change') {
            setAppFilterInput(value)
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
            onMenuOpen={() => handleMenuState(true)}
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
        />
    )
}
