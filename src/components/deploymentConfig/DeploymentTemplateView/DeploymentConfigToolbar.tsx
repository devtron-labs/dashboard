import React from 'react'
import { ReactComponent as FileCode } from '../../../assets/icons/ic-file-code.svg'
import { ReactComponent as CompareIcon } from '../../../assets/icons/ic-arrows-left-right.svg'
import { ReactComponent as ReadmeIcon } from '../../../assets/icons/ic-book-open.svg'
import { ReactComponent as CloseIcon } from '../../../assets/icons/ic-cross.svg'
import { ReactComponent as ViewVariablesIcon } from '../../../assets/icons/ic-view-variables.svg'
import { DeploymentConfigToolbarProps } from '../types'

export default function DeploymentConfigToolbar({
    selectedTabIndex,
    handleTabSelection,
    noReadme,
    showReadme,
    handleReadMeClick,
    convertVariables,
    handleViewVariablesClick,
}: DeploymentConfigToolbarProps) {
    const getTabClassName = (index: number) => {
        return `flex fs-12 lh-20 pb-8 cursor ${selectedTabIndex === index ? 'active-tab fw-6 cb-5' : 'fw-4 cn-9'}`
    }

    const getTabIconClass = (index: number) => {
        return `icon-dim-16 mr-4 ${selectedTabIndex === index ? 'scb-5' : 'scn-6'}`
    }

    const changeTab = (e) => {
        handleTabSelection(Number(e.currentTarget.dataset.index))
    }

    console.log(convertVariables)

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
                        >
                            <CompareIcon className={getTabIconClass(2)} />
                            Compare Values
                        </li>
                    </ol>
                </div>
            )}
            <div className="flex right pb-8 dc__gap-12">
                {!noReadme && !showReadme && (
                    <ReadmeIcon className="icon-dim-16 scn-7 cursor" onClick={handleReadMeClick} />
                )}
                <ViewVariablesIcon
                    style={{ backgroundColor: 'blue', borderRadius: '4px' }}
                    className="icon-dim-20 p-2 cursor "
                    onClick={handleViewVariablesClick}
                />
            </div>
        </div>
    )
}
