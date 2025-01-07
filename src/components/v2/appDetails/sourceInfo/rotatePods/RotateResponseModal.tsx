/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useState } from 'react'
import { showError, Progressing, ToastVariantType, ToastManager } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Close } from '../../../../../assets/icons/ic-close.svg'
import { ReactComponent as Success } from '../../../../../assets/icons/appstatus/healthy.svg'
import { ReactComponent as Error } from '../../../../../assets/icons/ic-error-exclamation.svg'
import { RotatePodsRequest, RotatePodsResponseTargetObject, RotateResponseModalProps } from './rotatePodsModal.type'
import '../scaleWorkloads/scaleWorkloadsModal.scss'
import { useSharedState } from '../../../utils/useSharedState'
import IndexStore from '../../index.store'
import { ReactComponent as RetryIcon } from '../../../../../assets/icons/ic-arrow-clockwise.svg'
import { RotatePods } from './rotatePodsModal.service'
import { POD_ROTATION_INITIATED } from '../../../../../config'
import { ReactComponent as BackIcon } from '../../../../../assets/icons/ic-arrow-backward.svg'

export default function RotateResponseModal({
    onClose,
    response,
    setResult,
    callAppDetailsAPI,
}: RotateResponseModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [appDetails] = useSharedState(IndexStore.getAppDetails(), IndexStore.getAppDetailsObservable())

    const renderHeaderSection = (): JSX.Element => {
        return (
            <div className="flex flex-align-center flex-justify dc__border-bottom bg__primary pt-16 pr-20 pb-16 pl-20">
                <span className="fs-16 fw-6 flex m-0 lh-20 cn-9">
                    <button type="button" className="dc__transparent icon-dim-24 mr-16" onClick={() => setResult(null)}>
                        <BackIcon />
                    </button>
                    Restart status
                </span>
                <button type="button" className="dc__transparent flex icon-dim-24" onClick={onClose}>
                    <Close className="icon-dim-24" />
                </button>
            </div>
        )
    }
    const renderStatusIcon = (response: RotatePodsResponseTargetObject): JSX.Element => {
        if (response.errorResponse === '') {
            return <Success className="mr-8 icon-dim-18" />
        }
        return <Error className="mr-8 icon-dim-18" />
    }
    const renderResponseBodySection = (): JSX.Element => {
        return (
            <div className="response-list-container bg__primary dc__height-inherit dc__overflow-auto">
                <div
                    className="dc__position-sticky dc__top-0 bg__primary dc__border-bottom response-row dc__border-bottom pt-8 pb-8"
                    style={{ zIndex: 1 }}
                >
                    <div className="fs-12 fw-6 cn-7 ml-20">RESOURCE</div>
                    <div className="fs-12 fw-6 cn-7 ml-16">ROTATE STATUS</div>
                    <div className="fs-12 fw-6 cn-7 ml-16">MESSAGE</div>
                </div>
                {response.map((response, index) => (
                    <div className="response-row pt-8 pb-8" key={`response-${response.name}`}>
                        <div className="fs-13 fw-4 cn-9 ml-20">
                            <span className="cn-9 fw-6">{response.groupVersionKind.Kind} / </span>
                            <span>{response.name}</span>
                        </div>
                        <div className="flex left top fs-13 fw-4 cn-9 ml-16">
                            {renderStatusIcon(response)}
                            <span data-testid={`response-status-text-${index}`}>
                                {response.errorResponse == '' ? 'Succeeded' : 'Failed'}
                            </span>
                        </div>
                        <div className="fs-13 fw-4 cn-9 ml-16">
                            {response.errorResponse == '' ? '-' : response.errorResponse}
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    const renderFooterSection = (): JSX.Element => {
        return (
            <div className="dc__border-top flex bg__primary pt-16 pr-20 pb-16 pl-20 dc__position-fixed dc__bottom-0 restart-modal-width right">
                <button className="cta cancel flex h-36 mr-12" data-testid="close-popup" onClick={onClose}>
                    Close
                </button>
                <button className="cta flex h-36" onClick={handleRetryRotate} disabled={isLoading}>
                    {isLoading ? (
                        <Progressing />
                    ) : (
                        <>
                            <RetryIcon className="icon-dim-16 dc__no-svg-fill scn-0 mr-10" />
                            Retry Failed
                        </>
                    )}
                </button>
            </div>
        )
    }

    const handleRetryRotate = async () => {
        try {
            setIsLoading(true)
            const requestPayload: RotatePodsRequest = {
                appId: appDetails.appId,
                environmentId: appDetails.environmentId,
                resources: response
                    .filter((workload) => workload.errorResponse !== '')
                    .map((workload) => ({
                        name: workload.name,
                        namespace: workload.namespace,
                        groupVersionKind: workload.groupVersionKind,
                    })),
            }

            const { result } = await RotatePods(requestPayload)
            callAppDetailsAPI()
            if (!result.containsError) {
                onClose()
                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: POD_ROTATION_INITIATED,
                })
            } else {
                setResult(result)
            }
        } catch (e) {
            showError(e)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            {renderHeaderSection()}
            {renderResponseBodySection()}
            {renderFooterSection()}
        </>
    )
}
