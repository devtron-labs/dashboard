import React, { useState } from 'react'
import { ReactComponent as FileCode } from '../../../assets/icons/ic-file-code.svg'
import { ReactComponent as CompareIcon } from '../../../assets/icons/ic-arrows-left-right.svg'
import { ReactComponent as ReadmeIcon } from '../../../assets/icons/ic-book-open.svg'
import { ReactComponent as CloseIcon } from '../../../assets/icons/ic-cross.svg'
import { ReactComponent as Dropdown } from '../../../assets/icons/ic-chevron-down.svg'
import { DeploymentConfigToolbarProps } from '../types'


export default function DeploymentConfigToolbar({
    selectedTabIndex,
    handleTabSelection,
    noReadme,
    showReadme,
    handleReadMeClick,
    isValues,
    setIsValues,
}: DeploymentConfigToolbarProps) {

    const [openDropdown, setOpenDropdown] = useState(false)

    const getTabClassName = (index: number) => {
        return `flex fs-12 lh-20 pb-8 cursor ${selectedTabIndex === index ? 'active-tab fw-6 cb-5' : 'fw-4 cn-9'}`
    }

    const getTabIconClass = (index: number) => {
        return `icon-dim-16 mr-4 ${selectedTabIndex === index ? 'scb-5' : 'scn-6'}`
    }

    const changeTab = (e) => {
        handleTabSelection(Number(e.currentTarget.dataset.index))
    }

    function DropdownContainer({ isOpen, onClose, children }) {
        if (!isOpen) {
            return null;
        }

        return (
          // <ClickAwayListener onClickAway={onClose}>
            <div
              className="flex-col"
              style={{
                backgroundColor: 'white',
                width: '200px',
                height: '72px',
                position: 'absolute',
                top: '22px',
                left: '0px',
                borderRadius: '4px',
                border: '1px solid #D0D4D9',
                boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.20)',
                zIndex: '100',
              }}
            >
              <div style={{ padding: '4px 0px' }}>{children}</div>
            </div>
          // </ClickAwayListener>
        );
      }

    function DropdownItem({ label, isValues, onClick }) {
        return (
          <div
            style={{
              alignItems: 'flex-start',
              padding: '6px 8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: isValues ? '600' : 'normal',
              background: isValues ? '#E5F2FF' : '',
              color: isValues ? '' : 'black',
            }}
            onClick={onClick}
          >
            {label}
          </div>
        );
      }

    const handleOptionClick = (newValue) => {
        setIsValues(newValue);
        setOpenDropdown(false);
    };
      

    return (
        <div className="config-toolbar-container flex dc__content-space bcn-0 pt-8 pl-16 pr-16 dc__border-bottom">
            {!noReadme && showReadme ? (
                <div className="flex left pb-8">
                    <CloseIcon className="icon-dim-16 mr-4 cursor" onClick={handleReadMeClick} />
                    Readme
                </div>
            ) : (
                <div className="flex left">
                    <ol className="flex left dc__column-gap-16 m-0 p-0 dc__list-style-none">
                        <li className={getTabClassName(1)} data-index={1} data-testid="values-tab" onClick={changeTab}>
                            <FileCode className={getTabIconClass(1)} />
                            Values
                        </li>
                        <li
                            className={getTabClassName(2)}
                            data-index={2}
                            data-testid="compare-values-tab"
                            onClick={changeTab}
                            style={{position:'relative'}}
                        >
                            <CompareIcon className={getTabIconClass(2)} />
                            Compare&nbsp;<span style={{color:'black'}} onClick={()=>setOpenDropdown(!openDropdown)}>{isValues? 'Values':'Manifest'}</span>
                            <Dropdown className="icon-dim-16 ml-4 cursor" style={{transform:openDropdown?'rotate(180deg)':''}} onClick={()=>setOpenDropdown(true)}/>
                            {/* {openDropdown && ( */}
                                <DropdownContainer isOpen={openDropdown} onClose={()=>setOpenDropdown(false) }>
                                    <DropdownItem label="Compare values" isValues={isValues} onClick={()=>handleOptionClick(true)} />
                                    <DropdownItem label="Compare manifest" isValues={!isValues} onClick={()=>handleOptionClick(false)} />
                                </DropdownContainer>
                            {/* )}  */}
                        </li>
                    </ol>
                </div>
            )}
            {!noReadme && !showReadme && (
                <div className="flex right pb-8">
                    <ReadmeIcon className="icon-dim-16 scn-7 cursor" onClick={handleReadMeClick} />
                </div>
            )}
        </div>
    )
}
