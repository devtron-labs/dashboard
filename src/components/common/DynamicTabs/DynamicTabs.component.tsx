import React from 'react'
import { components, MenuProps } from 'react-select'
import { ReactComponent as DropDown } from '../../../assets/icons/ic-arrow-left.svg'
import { MoreButtonWrapperProps } from './DynamicTabs.type'

export const TabsMenu = (props: MenuProps<any, false, any>) => {
    return (
        <components.Menu {...props}>
            <div className="tab-search-select__open-tabs">Open tabs</div>
            {props.children}
        </components.Menu>
    )
}

export const MoreButtonWrapper = ({ children, isMenuOpen, onClose, toggleMenu }: MoreButtonWrapperProps) => (
    <div className="more-tabs-wrapper" style={{ position: 'relative' }}>
        <button className="more-tabs-option" onClick={toggleMenu}>
            <DropDown
                className={`rotate icon-dim-20 pointer ${isMenuOpen ? 'fcn-9' : 'fcn-5'}`}
                style={{ ['--rotateBy' as any]: isMenuOpen ? '90deg' : '-90deg' }}
            />
        </button>
        {isMenuOpen && (
            <>
                <div className="more-tabs__menu-wrapper">{children}</div>
                <div className="more-tabs__blanket" onClick={onClose} />
            </>
        )}
    </div>
)

export const noMatchingTabs = () => 'No matching tabs'
