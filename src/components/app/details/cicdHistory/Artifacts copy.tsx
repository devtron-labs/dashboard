import React from 'react'
import { History, GitTriggers, CiMaterial } from '../cIDetails/types'
import GitCommitInfoGeneric from '../../../common/GitCommitInfoGeneric'

export default function GitChanges({
    gitTrigger,
    ciMaterials,
}: {
    gitTrigger: GitTriggers
    ciMaterials: CiMaterial[]
}) {
    return (
        <div className="flex column left w-100 p-16">
            {ciMaterials?.map((ciMaterial) => {
                return gitTrigger && (gitTrigger.Commit || gitTrigger.WebhookData?.Data) ? (
                    <div
                        key={gitTrigger?.Commit}
                        className="bcn-0 pt-12 br-4 en-2 bw-1 pb-12 mb-12"
                        style={{ width: 'min( 100%, 800px )' }}
                    >
                        <GitCommitInfoGeneric
                            materialUrl={gitTrigger?.GitRepoUrl ? gitTrigger?.GitRepoUrl : ciMaterial?.url}
                            showMaterialInfo={true}
                            commitInfo={gitTrigger}
                            materialSourceType={
                                gitTrigger?.CiConfigureSourceType ? gitTrigger?.CiConfigureSourceType : ciMaterial?.type
                            }
                            selectedCommitInfo={''}
                            materialSourceValue={
                                gitTrigger?.CiConfigureSourceValue
                                    ? gitTrigger?.CiConfigureSourceValue
                                    : ciMaterial?.value
                            }
                        />
                    </div>
                ) : null
            })}
        </div>
    )
}
