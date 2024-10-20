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

import { ReactNode } from 'react'
import {
    ErrorScreenManagerProps,
    GenericEmptyStateType,
    ProgressingProps,
    ReloadType,
    ServerErrors,
} from '../../../Common'
import { GenericSectionErrorStateProps } from '../GenericSectionErrorState/types'

export interface EmptyPageTextType {
    title?: GenericEmptyStateType['title']
    subTitle?: GenericEmptyStateType['subTitle']
}

export interface APIResponseHandlerProps {
    /**
     * If true, would show Progressing component
     */
    isLoading?: boolean
    /**
     * If loading is true, would load send these props to Progressing component
     */
    progressingProps?: ProgressingProps
    /**
     * If given, would show this component instead of default Progressing component
     */
    customLoader?: ReactNode
    /**
     * If true and isLoading is false would show default Reload component
     * In case error code is 404 show default 404 page using GenericEmptyState
     */
    error?: ServerErrors
    /**
     * Page text for 404 page
     */
    notFoundText?: EmptyPageTextType
    /**
     * If true would show Not Authorized page
     */
    notAuthorized?: boolean
    /**
     * If given, on Error, would load these props
     */
    reloadProps?: ReloadType
    /**
     * If given, would show GenericSectionErrorState instead of default Reload component
     */
    genericSectionErrorProps?: GenericSectionErrorStateProps
    /**
     * If given, would show ErrorScreenManager component instead of Reload component
     * Priority of error states are: genericSectionErrorProps > errorScreenManagerProps > Reload component
     */
    errorScreenManagerProps?: ErrorScreenManagerProps
    /**
     * If no Error and no Loading, would load this component
     */
    children: ReactNode
}
