import React from 'react'
import { showError, copyToClipboard } from '../../../common'
import { toast } from 'react-toastify'
import { useParams } from 'react-router'
import { ReactComponent as CopyIcon } from '../../../../assets/icons/ic-copy.svg'
import { ReactComponent as Download } from '../../../../assets/icons/ic-download.svg'
import { ReactComponent as MechanicalOperation } from '../../../../assets/img/ic-mechanical-operation.svg'
import docker from '../../../../assets/icons/misc/docker.svg'
import folder from '../../../../assets/icons/ic-folder.svg'
import Tippy from '@tippyjs/react'
import EmptyState from '../../../EmptyState/EmptyState'
import { EmptyView } from './History.components'
import '../cIDetails/ciDetails.scss'
export default function Artifacts({
    status,
    artifact,
    blobStorageEnabled,
    getArtifactPromise,
}: {
    status: string
    artifact: string
    blobStorageEnabled: boolean
    getArtifactPromise?: () => Promise<any>
}) {
    const { buildId, triggerId } = useParams<{ buildId: string; triggerId: string }>()
    async function handleArtifact(e) {
        try {
            const response = await getArtifactPromise()
            const b = await (response as any).blob()
            let a = document.createElement('a')
            let url = URL.createObjectURL(b)
            a.href = url
            a.download = `${buildId || triggerId}.zip`
            a.click()
        } catch (err) {
            showError(err)
        }
    }
    if (status.toLowerCase() === 'running') return <CIProgressView />
    if (['failed', 'cancelled'].includes(status.toLowerCase()))
        return <EmptyView title="No artifacts generated" subTitle="Errr..!! We couldn’t build your code." />
    return (
        <div style={{ padding: '16px' }} className="flex left column">
            <CIListItem type="artifact">
                <div className="flex column left">
                    <div className="cn-9 fs-14 flex left dc__visible-hover dc__visible-hover--parent">
                        <CopyTippyWithText copyText={artifact?.split(':')[1]} />
                    </div>
                    <div className="cn-7 fs-12 flex left dc__visible-hover dc__visible-hover--parent">
                        <CopyTippyWithText copyText={artifact} />
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

const CopyTippyWithText = ({ copyText }: { copyText: string }): JSX.Element => {
    return (
        <>
            {copyText}
            <Tippy content={'Copy to clipboard'}>
                <CopyIcon
                    className="pointer dc__visible-hover--child ml-6 icon-dim-16"
                    onClick={() => copyToClipboard(copyText, () => toast.info('copied to clipboard'))}
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

export const CIListItem: React.FC<{ type: 'report' | 'artifact'; children: any }> = ({ type, children }) => {
    return (
        <div className={`mb-16 ci-artifact ci-artifact--${type}`}>
            <div className="bcn-1 flex br-4">
                <img src={type === 'artifact' ? docker : folder} className="icon-dim-24" />
            </div>
            {children}
        </div>
    )
}
