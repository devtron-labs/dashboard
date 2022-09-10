import React from 'react'
import CreateApp from '../../assets/img/guide-create-app.png'
import PreviewImage from '../../assets/img/ic-preview.png'
import { DEVTRON_NODE_DEPLOY_VIDEO, PREVIEW_DEVTRON } from '../../config'
import { GuidedPageType } from './OnboardingGuide.type'
import './onboardingGuide.scss'

function DevtronAppGuidePage({ openDevtronAppCreateModel }: GuidedPageType) {
    const renderSubTitle = () => {
        return (
            <>
                Tip:
                <a
                    className="learn-more__href"
                    href={DEVTRON_NODE_DEPLOY_VIDEO}
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

            <div className="guide-body flex dc__position-rel">
                <div className="guide-cards__wrap">
                    <div className="guide-card bcn-0 w-300 br-4 en-2 bw-1 cursor">
                        <div className="dc__no-decor fw-6 cursor" onClick={openDevtronAppCreateModel}>
                            <img className="guide-card__img" src={CreateApp} alt="Please connect cluster" />
                            <div className="fw-6 fs-16 pt-32 pb-32 pl-24 pr-24 break-word">
                                Create an application from scratch
                            </div>
                        </div>
                    </div>

                    <div className="guide-card bcn-0 w-300 br-4 en-2 bw-1 cursor">
                        <a
                            className="cn-9 dc__no-decor fw-6 cursor href__link"
                            href={PREVIEW_DEVTRON}
                            rel="noreferrer noopener"
                            target="_blank"
                        >
                            <img className="guide-card__img" src={PreviewImage} alt="Please connect cluster" />
                            <div className="fw-6 fs-16 pt-32 pb-32 pl-24 pr-24 break-word">
                                Explore a preconfigured Demo app at &nbsp;
                                <span className="cb-5">preview.devtron.ai</span>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DevtronAppGuidePage
