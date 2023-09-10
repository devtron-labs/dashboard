import React, { useState } from 'react'
import { ReactComponent as FileCode } from '../../../assets/icons/ic-file-code.svg'
import { ReactComponent as CompareIcon } from '../../../assets/icons/ic-arrows-left-right.svg'
import { ReactComponent as ReadmeIcon } from '../../../assets/icons/ic-book-open.svg'
import { ReactComponent as CloseIcon } from '../../../assets/icons/ic-cross.svg'
import { ReactComponent as Dropdown } from '../../../assets/icons/ic-chevron-down.svg'
import { DeploymentConfigToolbarProps } from '../types'
import '../deploymentConfig.scss'
import { DropdownContainer, DropdownItem } from './DeploymentTemplateView.component'

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

    const getTabClassName = (index: number) => `flex fs-12 lh-20 pb-8 cursor ${selectedTabIndex === index ? 'active-tab fw-6 cb-5' : 'fw-4 cn-9'}`

    const getTabIconClass = (index: number) => `icon-dim-16 mr-4 ${selectedTabIndex === index ? 'scb-5' : 'scn-6'}`

    const changeTab = (e) => {
        handleTabSelection(Number(e.currentTarget.dataset.index))
    }



    const handleOptionClick = (newValue) => {
        setIsValues(newValue)
        setOpenDropdown(false)
    }

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
                            className={`${getTabClassName(2)} dc__position-rel`}
                            data-index={2}
                            data-testid="compare-values-tab"
                            onClick={changeTab}
                        >
                            <CompareIcon className={getTabIconClass(2)} />
                            Compare&nbsp;
                            <span style={{ color: 'black' }} onClick={() => setOpenDropdown(!openDropdown)}>
                                {isValues ? 'Values' : 'Manifest'}
                            </span>
                            <Dropdown
                                className="icon-dim-16 ml-4 cursor"
                                style={{ transform: openDropdown ? 'rotate(180deg)' : '' }}
                                onClick={() => setOpenDropdown(true)}
                            />
                            <DropdownContainer isOpen={openDropdown} onClose={() => setOpenDropdown(false)}>
                                <DropdownItem
                                    label="Compare values"
                                    isValues={isValues}
                                    onClick={() => handleOptionClick(true)}
                                />
                                <DropdownItem
                                    label="Compare generated manifest"
                                    isValues={!isValues}
                                    onClick={() => handleOptionClick(false)}
                                />
                            </DropdownContainer>
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
