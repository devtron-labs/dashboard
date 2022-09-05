import React from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as GoBack } from '../../assets/icons/ic-arrow-backward.svg'
import { GuideCommonHeaderType } from './OnboardingGuide.type'
import { URLS } from '../../config'

function GuideCommonHeader({ loginCount, title, subtitle, onClickCloseButton, isGettingStartedClicked }: GuideCommonHeaderType) {
    const history = useHistory()
    const match = useRouteMatch()
    const isGuidePage = match.url.includes(`${URLS.GETTING_STARTED}/${URLS.GUIDE}`)
    const showClossIcon = loginCount > 0 || isGettingStartedClicked
    const onClickedGoBack = () => {
        history.goBack()
    }

    return (
        <div className="common-guide__container">
            <div className={`deploy-manage__header h-300 dc__window-bg bcn-1`}>
                {showClossIcon && (
                    <button type="button" className="w-100 flex right transparent p-20" onClick={onClickCloseButton}>
                        <Close className="icon-dim-24" />
                    </button>
                )}
                <div className={`${showClossIcon ? 'deploy-manage__upper top' : 'h-300'} flex`}>
                    <div className="deploy__title flex center">
                        {isGuidePage && (
                            <div className="bcn-0 deploy_arrow flex cursor" onClick={onClickedGoBack}>
                                <GoBack className="icon-dim-24" />
                            </div>
                        )}
                        <div className="flex column">
                            <h1 className="fw-6 mb-8">{title}</h1>
                            <p className="fs-14 cn-7">{subtitle}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GuideCommonHeader
