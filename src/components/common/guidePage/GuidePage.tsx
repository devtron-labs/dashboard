import React, { useState } from 'react'
import { NavLink, useLocation, useRouteMatch, useHistory } from 'react-router-dom'
import './guidePage.scss'
import { URLS } from '../../../config'
import SampleImage from '../../../assets/img/guide-sample-app.png'
import CreateApp from '../../../assets/img/guide-create-app.png'
// import Tippy from '@tippyjs/react'
// import GettingToast from '../../../assets/img/lifebuoy.png'
import GettingStarted from '../gettingStartedCard/GettingStarted'

function GuidePage({ title, subTitle, leftImage, leftText, rightImage, rightText, onClickLeftCardAction }) {
    const match = useRouteMatch()
    const history = useHistory()
    const location = useLocation()
    const [showHelpCard, setShowHelpCard] = useState(true)

    const redirectToDeployGuide = (url) => {
        history.push(url)
    }

    const hideGettingStartedCard = () => {
        setShowHelpCard(!showHelpCard)
    }

    return (
        <div className="guide-container">
            <div className="flex h-300 guide-header column">
                <h1 className="fw-6 mb-8">{title}</h1>
                <p className="fs-14 cn-7">{subTitle}</p>
            </div>
            {/* <Tippy
                className="default-tt br-8 w-300 fs-13 p-20 m-auto"
                arrow={true}
                placement="top-end"
                content={
                    <div>
                        <img className="token-icon mb-12" src={GettingToast} alt="getting started icon" />
                        <div className="flex column left fw-6">Getting started</div>
                        <div>You can always access the Getting Started guide from here.</div>
                        <div className="mt-12">
                            <button className="cn-9 fw-6 br-4 mr-16">Okay</button>
                            <button className="br-4 token__dont-show en-0 bw-1">Don't show again</button>
                        </div>
                    </div>
                }
                visible={true}
            /> */}
            {showHelpCard && (
                <GettingStarted
                    className={'w-300'}
                    showHelpCard={false}
                    setShowHelpCard={setShowHelpCard}
                    hideGettingStartedCard={hideGettingStartedCard}
                />
            )}
            <div className="bcn-0 guide-body flex position-rel">
                <div className="guide-cards__wrap">
                    <div className="guide-card__left bcn-0 w-300 br-4 en-2 bw-1 cursor">
                        <div className="no-decor fw-6 cursor" onClick={onClickLeftCardAction}>
                            <img className="guide-card__img" src={SampleImage} alt="Please connect cluster" />
                            <div className="fw-6 fs-16 pt-32 pb-32 pl-24 pr-24 break-word">{leftText}</div>
                        </div>
                    </div>

                    <div className="guide-card__right bcn-0 w-300 br-4 en-2 bw-1 cursor">
                        <NavLink
                            to={`${match.url}/${URLS.GUIDE}`}
                            className="no-decor fw-6 cursor"
                            activeClassName="active"
                        >
                            <img className="guide-card__img" src={CreateApp} alt="Please connect cluster" />
                            <div className="fw-6 fs-16 pt-32 pb-32 pl-24 pr-24">{rightText}</div>
                        </NavLink>
                    </div>
                </div>
                {/* <div className="fs-14 mt-120 flex column">
                    <div className="cb-5 fw-6 cursor mb-8">Skip and explore Devtron on your own</div>
                    <div className="cn-7">Tip: You can return here anytime from the Help menu</div>
                </div> */}
            </div>
        </div>
    )
}

export default GuidePage
