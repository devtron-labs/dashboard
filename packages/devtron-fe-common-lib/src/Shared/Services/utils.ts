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

import { createGitCommitUrl, handleUTCTime } from '../../Common'
import { CIMaterialInfoDTO, CIMaterialInfoType } from './app.types'

export const getParsedCIMaterialInfo = (ciMaterialData: CIMaterialInfoDTO): CIMaterialInfoType => {
    const materials = (ciMaterialData?.ciMaterials ?? []).map((mat, materialIndex) => ({
        id: mat.id,
        gitMaterialName: mat.gitMaterialName || '',
        gitMaterialId: mat.gitMaterialId || 0,
        gitURL: mat.url || '',
        type: mat.type || '',
        value: mat.value || '',
        active: mat.active || false,
        history: mat.history.map((hist, index) => ({
            commitURL: mat.url ? createGitCommitUrl(mat.url, hist.Commit) : '',
            commit: hist.Commit || '',
            author: hist.Author || '',
            date: handleUTCTime(hist.Date, false),
            message: hist.Message || '',
            changes: hist.Changes || [],
            showChanges: index === 0,
            webhookData: hist.WebhookData,
            isSelected: false,
        })),
        lastFetchTime: mat.lastFetchTime || '',
        isSelected: materialIndex === 0,
    }))

    return {
        ciPipelineId: ciMaterialData?.ciPipelineId,
        materials,
        triggeredByEmail: ciMaterialData?.triggeredByEmail || '',
        lastDeployedTime: handleUTCTime(ciMaterialData.lastDeployedTime, false),
        environmentName: ciMaterialData?.environmentName || '',
        environmentId: ciMaterialData?.environmentId || 0,
        appId: ciMaterialData?.appId,
        appName: ciMaterialData?.appName || '',
        appReleaseTags: ciMaterialData?.imageTaggingData?.appReleaseTags,
        imageComment: ciMaterialData?.imageTaggingData?.imageComment,
        imageReleaseTags: ciMaterialData?.imageTaggingData?.imageReleaseTags,
        image: ciMaterialData?.image,
        tagsEditable: ciMaterialData?.imageTaggingData?.tagsEditable,
    }
}
