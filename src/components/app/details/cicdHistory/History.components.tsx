import React, { useEffect, useState } from 'react'
import { useKeyDown } from '../../../common'
import { useLocation } from 'react-router'
import Tippy from '@tippyjs/react'
import { ReactComponent as ZoomIn } from '../../../../assets/icons/ic-fullscreen.svg'
import { ReactComponent as ZoomOut } from '../../../../assets/icons/ic-exit-fullscreen.svg'
import { ReactComponent as DropDownIcon } from '../../../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as OpenInNew } from '../../../../assets/icons/ic-open-in-new.svg'
import AppNotDeployed from '../../../../assets/img/app-not-deployed.png'
import { EmptyViewType, GitChangesType, LogResizeButtonType, ScrollerType } from './types'
import GitCommitInfoGeneric from '../../../common/GitCommitInfoGeneric'
import { NavLink } from 'react-router-dom'
import { TIMELINE_STATUS } from '../../../../config'
import { not, GenericEmptyState, showError } from '@devtron-labs/devtron-fe-common-lib'
import { CIListItem, CopyTippyWithText } from './Artifacts'
import { extractImage } from '../../service'
import { EMPTY_STATE_STATUS } from '../../../../config/constantMessaging'
import { getUserRole } from '../../../userGroups/userGroup.service'

export const LogResizeButton = ({ fullScreenView, setFullScreenView }: LogResizeButtonType): JSX.Element => {
    const { pathname } = useLocation()

    const keys = useKeyDown()

    useEffect(() => {
        if (!pathname.includes('/logs')) return
        switch (keys.join('')) {
            case 'f':
                toggleFullScreen()
                break
            case 'Escape':
                setFullScreenView(false)
                break
        }
    }, [keys])

    const toggleFullScreen = (): void => {
        setFullScreenView(not)
    }

    return (
        pathname.includes('/logs') && (
            <Tippy
                placement="top"
                arrow={false}
                className="default-tt"
                content={fullScreenView ? 'Exit fullscreen (f)' : 'Enter fullscreen (f)'}
            >
                {fullScreenView ? (
                    <ZoomOut className="zoom zoom--out pointer" onClick={toggleFullScreen} />
                ) : (
                    <ZoomIn className="zoom zoom--in pointer" onClick={toggleFullScreen} />
                )}
            </Tippy>
        )
    )
}

export const Scroller = ({ scrollToTop, scrollToBottom, style }: ScrollerType): JSX.Element => {
    return (
        <div style={style} className="dc__element-scroller flex column top">
            <Tippy className="default-tt" arrow={false} content="Scroll to Top">
                <button className="flex" disabled={!scrollToTop} type="button" onClick={scrollToTop}>
                    <DropDownIcon className="rotate" style={{ ['--rotateBy' as any]: '180deg' }} />
                </button>
            </Tippy>
            <Tippy className="default-tt" arrow={false} content="Scroll to Bottom">
                <button className="flex" disabled={!scrollToBottom} type="button" onClick={scrollToBottom}>
                    <DropDownIcon className="rotate" />
                </button>
            </Tippy>
        </div>
    )
}

export const GitChanges = ({
    gitTriggers,
    ciMaterials,
    artifact,
    userApprovalMetadata,
    triggeredByEmail,
    ciPipelineId,
    artifactId,
    imageComment,
    imageReleaseTags,
    appReleaseTagNames,
    tagsEditable,
    hideImageTaggingHardDelete
}: GitChangesType) => {
    const [isSuperAdmin, setSuperAdmin] = useState<boolean>(false)
    useEffect(() => {
        if(artifactId){
            initialise()
        }    
    }, [artifactId])
    async function initialise() {
        try {
            const userRole = await getUserRole()

            const superAdmin = userRole?.result?.roles?.includes('role:super-admin___')
            setSuperAdmin(superAdmin)
        } catch (err) {
            showError(err)
        }
    }
    const [copied, setCopied] = useState(false)

    if (!ciMaterials?.length || !Object.keys(gitTriggers ?? {}).length) {
        return (
            <GenericEmptyState
                title={EMPTY_STATE_STATUS.DATA_NOT_AVAILABLE}
                subTitle={EMPTY_STATE_STATUS.DEVTRON_APP_DEPLOYMENT_HISTORY_SOURCE_CODE.SUBTITLE}
            />
        )
    }
    return (
        <div className="flex column left w-100 ">
            {ciMaterials?.map((ciMaterial, index) => {
                const gitTrigger = gitTriggers[ciMaterial.id]
                return gitTrigger && (gitTrigger.Commit || gitTrigger.WebhookData?.Data) ? (
                    <div
                        key={`mat-${gitTrigger?.Commit}-${index}`}
                        className="bcn-0 pt-12 br-4 en-2 bw-1 pb-12 mt-16 ml-16"
                        data-testid="source-code-git-hash"
                        style={{ width: 'min( 100%, 800px )' }}
                    >
                        <GitCommitInfoGeneric
                            index={index}
                            materialUrl={gitTrigger?.GitRepoUrl ? gitTrigger.GitRepoUrl : ciMaterial?.url}
                            showMaterialInfoHeader={true}
                            commitInfo={gitTrigger}
                            materialSourceType={
                                gitTrigger?.CiConfigureSourceType ? gitTrigger.CiConfigureSourceType : ciMaterial?.type
                            }
                            selectedCommitInfo={''}
                            materialSourceValue={
                                gitTrigger?.CiConfigureSourceValue
                                    ? gitTrigger.CiConfigureSourceValue
                                    : ciMaterial?.value
                            }
                        />
                    </div>
                ) : null
            })}
            {artifact && (
                <div className="flex left column mt-16 mb-16 ml-16" style={{ width: 'min( 100%, 800px )' }}>
                    <CIListItem
                        type="deployed-artifact"
                        userApprovalMetadata={userApprovalMetadata}
                        triggeredBy={triggeredByEmail}
                        artifactId={artifactId}
                        ciPipelineId={ciPipelineId}
                        imageComment={imageComment}
                        imageReleaseTags={imageReleaseTags}
                        appReleaseTagNames={appReleaseTagNames}
                        tagsEditable={tagsEditable}
                        hideImageTaggingHardDelete={hideImageTaggingHardDelete}
                        isSuperAdmin={isSuperAdmin}
                    >
                        <div className="flex column left hover-trigger">
                            <div className="cn-9 fs-14 flex left">
                                <CopyTippyWithText
                                    copyText={extractImage(artifact)}
                                    copied={copied}
                                    setCopied={setCopied}
                                />
                            </div>
                            <div className="cn-7 fs-12 flex left">
                                <CopyTippyWithText copyText={artifact} copied={copied} setCopied={setCopied} />
                            </div>
                        </div>
                    </CIListItem>
                </div>
            )}
        </div>
    )
}

export const EmptyView = ({ imgSrc, title, subTitle, link, linkText }: EmptyViewType) => {
    const EmptyViewButton = () => {
        return (
            link ? (
                <NavLink to={link} className="cta cta--ci-details flex" target="_blank">
                    <OpenInNew className="mr-5 mr-5 scn-0 fcb-5 icon-fill-blue-imp" />
                    {linkText}
                </NavLink>
            ) : null
        )
    }
    return (
        <GenericEmptyState
            image={imgSrc ?? AppNotDeployed}
            classname="w-300 dc__text-center lh-1-4 dc__align-reload-center"
            title={title}
            subTitle={subTitle}
            isButtonAvailable={true}
            renderButton={EmptyViewButton}
        />
    )
}

export const triggerStatus = (triggerDetailStatus: string): string => {
    let triggerStatus = triggerDetailStatus?.toUpperCase()
    if (triggerStatus === TIMELINE_STATUS.ABORTED || triggerStatus === TIMELINE_STATUS.DEGRADED) {
        return 'Failed'
    } else if (triggerStatus === TIMELINE_STATUS.HEALTHY) {
        return 'Succeeded'
    } else if (triggerStatus === TIMELINE_STATUS.INPROGRESS) {
        return 'Inprogress'
    } else {
        return triggerDetailStatus
    }
}
