import React from 'react'
import { NavLink } from 'react-router-dom'
import { URLS } from '../../../config'
import { VisibleModal } from '../../common'
import { ReactComponent as SuccessIcon } from '../../../assets/icons/ic-success-with-light-background.svg'
import { ReactComponent as GotToBuildDeploy } from '../../../assets/icons/go-to-buildanddeploy@2x.svg'
import { ReactComponent as GoToEnvOverride } from '../../../assets/icons/go-to-envoverride@2x.svg'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import { ReactComponent as Dropdown } from '../../../assets/icons/ic-chevron-down.svg'

interface ChartVersionSelectorModalType {
    closePopup: () => void
    appStoreApplicationName: string
    appIconUrl: string
    onError: (e) => void
}

export default function ChartVersionSelectorModal({
    closePopup,
    appStoreApplicationName,
    appIconUrl,
    onError,
}: ChartVersionSelectorModalType) {
    const createActionCard = (
        url: string,
        Icon: React.FunctionComponent<any>,
        title: string,
        subtitle: string,
    ): JSX.Element => {
        return (
            <NavLink to={url} className="no-decor">
                <div className="flex left br-4 pt-12 pr-16 pb-12 pl-16 mb-12 en-2 bw-1 action-card">
                    <div className="h-60 ">
                        <Icon />
                    </div>
                    <div className="ml-16 mr-16 flex-1">
                        <div className="fw-6 fs-13 cn-9">{title}</div>
                        <div className="fw-4 fs-13 cn-7">{subtitle}</div>
                    </div>
                    <Dropdown className="icon-dim-20 rotate-270" />
                </div>
            </NavLink>
        )
    }

    return (
        <VisibleModal className="transition-effect">
            <div className="modal__body mt-0 no-top-radius chart-version-selector">
                <div className="header-container mb-20">
                    <div className="icon-dim-44 mr-16 mr-16">
                        <img src={appIconUrl} onError={onError} className="chart-grid-item__icon" alt="chart icon" />
                    </div>
                    <div>
                        <div className="fw-6 fs-16 cn-9">Deploy {appStoreApplicationName}</div>
                        <div className="fw-4 fs-13 cn-9">Choose to start with...</div>
                    </div>
                    <button type="button" className="transparent" onClick={closePopup}>
                        <Close className="icon-dim-20" />
                    </button>
                </div>
                {createActionCard(
                    `${URLS.APP}/`,
                    GotToBuildDeploy,
                    'Preset value',
                    'Choose from a list of pre-defined values',
                )}
                {createActionCard(
                    `${URLS.APP}/`,
                    GoToEnvOverride,
                    'Deployed value',
                    'Choose from currently deployed values',
                )}
                {createActionCard(
                    `${URLS.APP}/`,
                    GotToBuildDeploy,
                    'I want to start from scratch',
                    'Start with the latest default value for this chart',
                )}
            </div>
        </VisibleModal>
    )
}
