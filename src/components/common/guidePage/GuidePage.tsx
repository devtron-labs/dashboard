import React, { useState } from 'react'
import { useLocation, useRouteMatch, useHistory } from 'react-router-dom'
import './guidePage.scss'
import CreateApp from '../../../assets/img/guide-create-app.png'
import PreviewImage from '../../../assets/img/ic-preview.png'
import GettingStarted from '../gettingStartedCard/GettingStarted'
import { DOCUMENTATION } from '../../../config'
export interface GuidedPageType {
    openDevtronAppCreateModel: (event) => void
}

function GuidePage({ openDevtronAppCreateModel }: GuidedPageType) {
    const [showHelpCard, setShowHelpCard] = useState(true)

    const hideGettingStartedCard = () => {
        setShowHelpCard(!showHelpCard)
    }

    const renderSubTitle = () => {
        return (
            <>
                Tip:
                <a
                    className="learn-more__href"
                    href={'https://www.youtube.com/watch?v=9u-pKiWV-tM&t=1s'}
                    rel="noreferrer noopener"
                    target="_blank"
                >
                    &nbsp; Watch how to create a sample nodejs application
                </a>
            </>
        )
    }

    return (
        <div className="guide-container">
            <div className="flex h-300 guide-header column">
                <h1 className="fw-6 mb-8">Create your first application</h1>
                <p className="fs-14 cn-7">{renderSubTitle()}</p>
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
            <div className="guide-body flex position-rel">
                <div className="guide-cards__wrap">
                    <div className="guide-card__left bcn-0 w-300 br-4 en-2 bw-1 cursor">
                        <div className="no-decor fw-6 cursor" onClick={openDevtronAppCreateModel}>
                            <img className="guide-card__img" src={CreateApp} alt="Please connect cluster" />
                            <div className="fw-6 fs-16 pt-32 pb-32 pl-24 pr-24 break-word">
                                Create an application from scratch
                            </div>
                        </div>
                    </div>

                    <div className="guide-card__right bcn-0 w-300 br-4 en-2 bw-1 cursor">
                        <a
                            className="cn-9 no-decor fw-6 cursor href__link"
                            href={DOCUMENTATION.PREVIEW_DEVTRON}
                            rel="noreferrer noopener"
                            target="_blank"
                        >
                            <img className="guide-card__img" src={PreviewImage} alt="Please connect cluster" />
                            <div className="fw-6 fs-16 pt-32 pb-32 pl-24 pr-24 break-word">
                                Explore a preconfigured Demo at &nbsp;
                                <span className="cb-5">preview.devtron.ai</span>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GuidePage
