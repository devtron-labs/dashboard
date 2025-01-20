import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    DynamicTabType,
    PopupMenu,
    SelectPicker,
    SelectPickerOptionType,
    SelectPickerProps,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICArrowLeft } from '@Icons/ic-arrow-left.svg'
import { InputActionMeta } from 'react-select'
import { useMemo, useState } from 'react'
import { ReactComponent as ICCross } from '@Icons/ic-cross.svg'
import { DynamicTabsSelectProps } from './types'

const DynamicTabsSelect = ({
    tabs,
    getMarkTabActiveHandler,
    selectedTab,
    handleTabCloseAction,
}: DynamicTabsSelectProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [tabSearchText, setTabSearchText] = useState('')

    const handleToggleOpenMenuState = (isOpen: boolean) => {
        setIsMenuOpen(isOpen)
    }

    const options: SelectPickerOptionType<DynamicTabType>[] = useMemo(
        () =>
            tabs.map((tab) => {
                const [kind, name] = tab.title.split('/')

                return {
                    label: kind,
                    value: tab,
                    description: name,
                    endIcon: (
                        <div className="flex top">
                            <Button
                                dataTestId="close-dynamic-tab-option"
                                icon={<ICCross />}
                                variant={ButtonVariantType.borderLess}
                                style={ButtonStyleType.negativeGrey}
                                data-id={tab.id}
                                onClick={handleTabCloseAction}
                                size={ComponentSizeType.xs}
                                ariaLabel={`Close dynamic tab ${kind}`}
                                showAriaLabelInTippy={false}
                            />
                        </div>
                    ),
                }
            }),
        [tabs],
    )

    const clearSearchInput = () => {
        setTabSearchText('')
    }

    const onChangeTab = (option: SelectPickerOptionType<DynamicTabType>): void => {
        if (option) {
            setIsMenuOpen(false)
            getMarkTabActiveHandler(option.value)()
        }
    }

    const handleCloseMenu = () => {
        setIsMenuOpen(false)
        setTabSearchText('')
    }

    const handleOnChangeSearchText = (newValue: string, actionMeta: InputActionMeta) => {
        if ((actionMeta.action === 'input-blur' || actionMeta.action === 'menu-close') && actionMeta.prevInputValue) {
            setTabSearchText(actionMeta.prevInputValue)
        } else {
            setTabSearchText(newValue)
        }
    }

    // NOTE: by default react select compares option references
    // therefore if we don't wrap value and options in useMemo we need to provide isOptionSelected
    const isOptionSelected = (option: SelectPickerOptionType<DynamicTabType>) => option.value.id === selectedTab.id

    const handleOnEscPress = (e: React.KeyboardEvent) => {
        if (e.key !== 'Escape') {
            return
        }

        handleCloseMenu()
    }

    const selectFilter: SelectPickerProps<DynamicTabType>['filterOption'] = (option, searchText) =>
        option.data.value.id.toLowerCase().includes(searchText.toLowerCase())

    return (
        <PopupMenu autoClose autoPosition onToggleCallback={handleToggleOpenMenuState} closeOnEscape>
            <PopupMenu.Button rootClassName="flex">
                <ICArrowLeft
                    className={`rotate icon-dim-18 ${isMenuOpen ? 'fcn-9' : 'fcn-7'}`}
                    style={{ ['--rotateBy' as string]: isMenuOpen ? '90deg' : '-90deg' }}
                />
            </PopupMenu.Button>
            <PopupMenu.Body rootClassName="w-300 mt-8 dynamic-tabs-select-popup-body" style={{ right: '12px' }}>
                <SelectPicker<DynamicTabType, false>
                    inputId="dynamic-tabs-select"
                    placeholder="Search tabs"
                    options={options}
                    onChange={onChangeTab}
                    isOptionSelected={isOptionSelected}
                    filterOption={selectFilter}
                    inputValue={tabSearchText}
                    onInputChange={handleOnChangeSearchText}
                    onKeyDown={handleOnEscPress}
                    onBlur={clearSearchInput}
                    menuIsOpen={isMenuOpen}
                    autoFocus
                />
            </PopupMenu.Body>
        </PopupMenu>
    )
}

export default DynamicTabsSelect
