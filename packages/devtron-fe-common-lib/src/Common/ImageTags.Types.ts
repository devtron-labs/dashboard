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

export interface ReleaseTag {
    id: number
    tagName: string
    appId: number
    deleted: boolean
    artifactId: number
    duplicateTag: boolean
}

export interface ImageComment {
    id: number
    comment: string
    artifactId: number
}

export interface ImageTaggingContainerType {
    ciPipelineId?: number
    artifactId?: number
    imageComment?: ImageComment
    imageReleaseTags?: ReleaseTag[]
    updateCurrentAppMaterial?: (matId: number, releaseTags?: ReleaseTag[], imageComment?: ImageComment) => void
    appReleaseTagNames?: string[]
    tagsEditable?: boolean
    forceReInit?: boolean
    setAppReleaseTagNames?: (appReleaseTags: string[]) => void
    setTagsEditable?: (tagsEditable: boolean) => void
    toggleCardMode?: (id: number) => void
    hideHardDelete?: boolean
    isSuperAdmin?: boolean
}

export interface ImageButtonType {
    text: string
    isSoftDeleted: boolean
    isEditing: boolean
    onSoftDeleteClick?: any
    onHardDeleteClick?: any
    tagId: number
    softDeleteTags: any
    isSuperAdmin: boolean
    duplicateTag?: boolean
    hideHardDelete?: boolean
}
