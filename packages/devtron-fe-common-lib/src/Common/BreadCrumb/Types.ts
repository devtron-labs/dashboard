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

export interface Breadcrumb {
    to: string
    name: string
    className?: string
}

export interface UseBreadcrumbState {
    breadcrumbs: Breadcrumb[]
    setCrumb: (props: { [key: string]: any }) => void
    resetCrumb: (props: string[]) => void
}

export interface AdvancedAlias {
    component: any
    linked: boolean
}

export interface UseBreadcrumbProps {
    sep?: string
    alias?: { [key: string]: AdvancedAlias | any }
}

export interface Breadcrumbs {
    breadcrumbs: Breadcrumb[]
    sep?: string
    className?: string
}

export type UseBreadcrumbOptionalProps = UseBreadcrumbProps | null

export interface BreadcrumbTextProps {
    heading: string
    isActive?: boolean
}
