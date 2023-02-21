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

export const Menu = (props: JSX.IntrinsicElements['div']) => {
    return (
        <div
            style={{
                backgroundColor: 'var(--N0)',
                borderRadius: '4px 4px 0 0',
                marginTop: '8px',
                position: 'absolute',
                left: '8px',
                zIndex: 10,
                width: '300px',
            }}
            {...props}
        />
    )
}
const Blanket = (props: JSX.IntrinsicElements['div']) => (
    <div
        style={{
            bottom: 0,
            left: 0,
            top: 0,
            right: 0,
            position: 'fixed',
            zIndex: 9,
        }}
        {...props}
    />
)
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
                <Menu>{children}</Menu>
                <Blanket onClick={onClose} />
            </>
        )}
    </div>
)

export const noMatchingTabs = () => 'No matching tabs'
