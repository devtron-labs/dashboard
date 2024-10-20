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

import { Drawer, GenericEmptyState, useAsync } from '../../../Common'
import { getArtifactInfo, getCITriggerInfo } from '../../Services/app.service'
import { APIResponseHandler } from '../APIResponseHandler'
import { ReactComponent as ICClose } from '../../../Assets/Icon/ic-close.svg'
import { ReactComponent as ICArrowDown } from '../../../Assets/Icon/ic-arrow-down.svg'
import { Artifacts } from '../CICDHistory'
import MaterialHistory from '../MaterialHistory/MaterialHistory.component'
import { ArtifactInfoModalProps } from './types'

const ArtifactInfoModal = ({
    envId,
    ciArtifactId,
    handleClose,
    renderCIListHeader,
    fetchOnlyArtifactInfo = false,
}: ArtifactInfoModalProps) => {
    const [isInfoLoading, artifactInfo, infoError, refetchArtifactInfo] = useAsync(
        () =>
            fetchOnlyArtifactInfo
                ? getArtifactInfo({
                      ciArtifactId,
                  })
                : getCITriggerInfo({
                      ciArtifactId,
                      envId,
                  }),
        [ciArtifactId, envId, fetchOnlyArtifactInfo],
    )

    const isArtifactInfoAvailable = !!artifactInfo?.materials?.length
    const showDescription = isArtifactInfoAvailable && !fetchOnlyArtifactInfo

    return (
        <Drawer position="right" width="800px" onEscape={handleClose}>
            <div data-testid="visible-modal-commit-info" className="flexbox-col h-100">
                <div className="flex dc__content-space py-10 px-20 cn-9 bcn-0 dc__border-bottom">
                    <div className="flexbox-col dc__content-center">
                        {!infoError &&
                            (isInfoLoading ? (
                                <>
                                    <div className="shimmer h-24 mb-2 w-200" />
                                    <div className="shimmer h-18 w-250" />
                                </>
                            ) : (
                                <>
                                    <h1 className="fs-16 fw-6 lh-24 m-0 dc__truncate">
                                        {showDescription
                                            ? artifactInfo?.appName
                                            : `Source & image details of ${artifactInfo?.appName}`}
                                    </h1>
                                    {showDescription && (
                                        <p className="fs-13 cn-7 lh-1-5 m-0 dc__truncate">
                                            Deployed on {artifactInfo.environmentName} at{' '}
                                            {artifactInfo.lastDeployedTime}
                                            &nbsp;by {artifactInfo.triggeredByEmail}
                                        </p>
                                    )}
                                </>
                            ))}
                    </div>
                    <button
                        data-testid="visible-modal-close"
                        type="button"
                        className="dc__transparent flex"
                        onClick={handleClose}
                        aria-label="Close modal"
                    >
                        <ICClose className="icon-dim-24 icon-use-fill-n6" />
                    </button>
                </div>
                <div className="flexbox-col flex-grow-1 dc__overflow-scroll dc__window-bg h-100">
                    <APIResponseHandler
                        isLoading={isInfoLoading}
                        progressingProps={{
                            pageLoader: true,
                        }}
                        error={infoError}
                        errorScreenManagerProps={{
                            code: infoError?.code,
                            reload: refetchArtifactInfo,
                        }}
                    >
                        {isArtifactInfoAvailable ? (
                            <div className="select-material p-16 flexbox-col dc__gap-12">
                                {artifactInfo.materials.map((material) => (
                                    <MaterialHistory
                                        material={material}
                                        pipelineName=""
                                        key={material.id}
                                        isCommitInfoModal
                                    />
                                ))}
                                <div className="dc__dashed_icon_grid-container">
                                    <hr className="dc__dotted-line" />
                                    <div className="flex">
                                        <ICArrowDown className="scn-6" />
                                    </div>
                                    <hr className="dc__dotted-line" />
                                </div>
                                <Artifacts
                                    status=""
                                    artifact={artifactInfo.image}
                                    blobStorageEnabled
                                    isArtifactUploaded={false}
                                    imageReleaseTags={artifactInfo.imageReleaseTags}
                                    imageComment={artifactInfo.imageComment}
                                    ciPipelineId={artifactInfo.ciPipelineId}
                                    artifactId={ciArtifactId}
                                    appReleaseTagNames={artifactInfo.appReleaseTags}
                                    tagsEditable={artifactInfo.tagsEditable}
                                    hideImageTaggingHardDelete={false}
                                    renderCIListHeader={renderCIListHeader}
                                />
                            </div>
                        ) : (
                            <GenericEmptyState
                                title="Data not available"
                                subTitle="The data you are looking for is not available"
                                classname="h-100 bcn-0 flex-grow-1"
                            />
                        )}
                    </APIResponseHandler>
                </div>
            </div>
        </Drawer>
    )
}

export default ArtifactInfoModal
