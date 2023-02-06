import React, { useEffect, useState } from 'react'
import { showError, copyToClipboard } from '../../../common'
import { useParams } from 'react-router'
import { ReactComponent as CopyIcon } from '../../../../assets/icons/ic-copy.svg'
import { ReactComponent as Download } from '../../../../assets/icons/ic-download.svg'
import { ReactComponent as MechanicalOperation } from '../../../../assets/img/ic-mechanical-operation.svg'
import docker from '../../../../assets/icons/misc/docker.svg'
import folder from '../../../../assets/icons/ic-folder.svg'
import Tippy from '@tippyjs/react'
import EmptyState from '../../../EmptyState/EmptyState'
import '../cIDetails/ciDetails.scss'
import { ArtifactType, CIListItemType, CopyTippyWithTextType } from './types'
import { EMPTY_STATE_STATUS, TERMINAL_STATUS_MAP } from '../../../../config'
import GenericEmptyState from '../../../EmptyState/GenericEmptyState'
export default function Artifacts({ status, artifact, blobStorageEnabled, getArtifactPromise }: ArtifactType) {
    const { buildId, triggerId } = useParams<{ buildId: string; triggerId: string }>()
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (!copied) return
        setTimeout(() => setCopied(false), 2000)
    }, [copied])

    async function handleArtifact(e) {
        try {
            const response = await getArtifactPromise()
            const b = await (response as any).blob()
            const a = document.createElement('a')
            a.href = URL.createObjectURL(b)
            a.download = `${buildId || triggerId}.zip`
            a.click()
        } catch (err) {
            showError(err)
        }
    }
    if (status.toLowerCase() === TERMINAL_STATUS_MAP.RUNNING) {
        return <CIProgressView />
    } else if (
        status.toLowerCase() === TERMINAL_STATUS_MAP.FAILED ||
        status.toLowerCase() === TERMINAL_STATUS_MAP.CANCELLED
    ) {
        return (
            <GenericEmptyState
                title={EMPTY_STATE_STATUS.ARTIFACT.TITLE}
                subTitle={EMPTY_STATE_STATUS.ARTIFACT.SUBTITLE}
            />
        )

    } else {
        return (
            <div className="flex left column p-16">
                <CIListItem type="artifact">
                    <div className="flex column left hover-trigger">
                        <div className="cn-9 fs-14 flex left">
                            <CopyTippyWithText
                                copyText={artifact?.split(':')[1]}
                                copied={copied}
                                setCopied={setCopied}
                            />
                        </div>
                        <div className="cn-7 fs-12 flex left">
                            <CopyTippyWithText copyText={artifact} copied={copied} setCopied={setCopied} />
                        </div>
                    </div>
                </CIListItem>
                {blobStorageEnabled && getArtifactPromise && (
                    <CIListItem type="report">
                        <div className="flex column left">
                            <div className="cn-9 fs-14">Reports.zip</div>
                            <button
                                type="button"
                                onClick={handleArtifact}
                                className="anchor p-0 cb-5 fs-12 flex left pointer"
                            >
                                Download
                                <Download className="ml-5 icon-dim-16" />
                            </button>
                        </div>
                    </CIListItem>
                )}
            </div>
        )
    }
}

const CopyTippyWithText = ({ copyText, copied, setCopied }: CopyTippyWithTextType): JSX.Element => {
    const onClickCopyToClipboard = (e): void => {
        copyToClipboard(e.target.dataset.copyText, () => setCopied(true))
    }
    return (
        <>
            {copyText}
            <Tippy
                className="default-tt"
                arrow={false}
                placement="bottom"
                content={copied ? 'Copied!' : 'Copy to clipboard.'}
                trigger="mouseenter click"
                interactive={true}
            >
                <CopyIcon
                    data-copy-text={copyText}
                    className="pointer ml-6 icon-dim-16"
                    onClick={onClickCopyToClipboard}
                />
            </Tippy>
        </>
    )
}

const CIProgressView = (): JSX.Element => {
    return (
        <EmptyState>
            <EmptyState.Image>
                <MechanicalOperation />
            </EmptyState.Image>
            <EmptyState.Title>
                <h4>Building artifacts</h4>
            </EmptyState.Title>
            <EmptyState.Subtitle>
                Generated artifact(s) will be available here after the pipeline is executed.
            </EmptyState.Subtitle>
        </EmptyState>
    )
}

const CIListItem = ({ type, children }: CIListItemType) => {
    return (
        <div className={`mb-16 ci-artifact ci-artifact--${type}`}>
            <div className="bcn-1 flex br-4">
                <img src={type === 'artifact' ? docker : folder} className="icon-dim-24" />
            </div>
            {children}
        </div>
    )
}
