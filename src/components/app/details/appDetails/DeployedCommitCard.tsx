import React from 'react'
import Tippy from '@tippyjs/react'
import { ReactComponent as Question } from '../../../../assets/icons/ic-help-outline.svg'
import { ReactComponent as GitHub } from '../../../../assets/icons/git/github.svg'
import { ReactComponent as CommitIcon } from '../../../../assets/icons/ic-code-commit.svg'

export const DeployedCommitCard = () => {
    return (
        <div data-testid="deployed-commit-card" className="card-deployed-commit flex left bcn-0 br-8">
            <div className="card-deployed-commit__top-container flex">
                <div className="card-deployed-commit__top-container__content">
                    <div className="card-deployed-commit__top-container__content__title-wrapper">
                        <div className="fs-12 fw-4 cn-7 mr-5">Deployed commit</div>
                        <Tippy
                            className="default-tt"
                            arrow={false}
                            placement="top"
                            content="Status of last triggered deployment" // @TODO: update this copy
                        >
                            <Question className="icon-dim-16 mt-2" />
                        </Tippy>
                    </div>
                    <div className="card-deployed-commit__top-container__content__commit-text-wrapper flex fs-12 fw-4">
                        <CommitIcon className="card-deployed-commit__top-container__content__commit-text-wrapper__commit-icon" />
                        <div className="card-deployed-commit__top-container__content__commit-text-wrapper__commit-sha">
                            574588a3
                        </div>
                    </div>
                </div>
                <GitHub className="github-icon" />
            </div>
            <div className="card-deployed-commit__bottom-container flex">
                <p className="card-deployed-commit__bottom-container__message fs-12 fw-4">
                    Update Dockerfile Resetting Docker file
                </p>
                <div className="card-deployed-commit__bottom-container__details fs-12 fw-6">Details</div>
            </div>
        </div>
    )
}
