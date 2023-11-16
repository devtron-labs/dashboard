import React, { useEffect, useState } from 'react'
import Tippy from '@tippyjs/react'
import { ReactComponent as Question } from '../../../../assets/icons/ic-help-outline.svg'
import { ReactComponent as GitHub } from '../../../../assets/icons/git/github.svg'
import { ReactComponent as CommitIcon } from '../../../../assets/icons/ic-code-commit.svg'
import { DeployedCommitCardType } from './appDetails.type'
import { noop, showError } from '@devtron-labs/devtron-fe-common-lib'
import { getCITriggerInfoModal } from '../../service'
import LoadingCard from './LoadingCard'

const DeployedCommitCard = ({ cardLoading, showCommitInfoDrawer, envId, ciArtifactId }: DeployedCommitCardType) => {
    const [commitId, setCommitId] = useState<string>(null)
    const [commitMessage, setCommitMessage] = useState<string>(null)

    useEffect(() => {
        if (envId && ciArtifactId) {
            const params = {
                envId,
                ciArtifactId,
            }

            getCITriggerInfoModal(params, null)
                .then((response) => {
                    const materials = response.result?.materials
                    const lastCommit = materials[0]?.history[0]
                    const shortenCommitId = lastCommit?.commit?.slice(0, 8)
                    setCommitId(shortenCommitId)
                    setCommitMessage(lastCommit?.message)
                })
                .catch((error) => {
                    showError(error)
                })
        }
    }, [envId, ciArtifactId])

    if (cardLoading || !commitId) return <LoadingCard />

    return (
        <div
            data-testid="deployed-commit-card"
            onClick={cardLoading ? noop : showCommitInfoDrawer}
            className="app-details-info-card pointer flex left bcn-0 br-8 mr-12 lh-20 w-200"
        >
            <div className="app-details-info-card__top-container flex">
                <div className="app-details-info-card__top-container__content">
                    <div className="app-details-info-card__top-container__content__title-wrapper">
                        <div className="fs-12 fw-4 cn-7 mr-5">Deployed commit</div>
                        <Tippy
                            className="default-tt"
                            arrow={false}
                            placement="top"
                            content="Last deployment was triggered with this commit"
                        >
                            <Question className="icon-dim-16 mt-2" />
                        </Tippy>
                    </div>
                    <div className="app-details-info-card__top-container__content__commit-text-wrapper flex fs-12 fw-4">
                        <CommitIcon className="icon-dim-20" />
                        <div className="dc__ellipsis-right cn-7 ml-2 fw-4 fs-12">{commitId}</div>
                    </div>
                </div>
                <GitHub className="github-icon" />
            </div>
            <div className="app-details-info-card__bottom-container dc__content-space">
                <span className="app-details-info-card__bottom-container__message fs-12 fw-4">{commitMessage}</span>
                <div className="app-details-info-card__bottom-container__details fs-12 fw-6">Details</div>
            </div>
        </div>
    )
}

export default React.memo(DeployedCommitCard)
