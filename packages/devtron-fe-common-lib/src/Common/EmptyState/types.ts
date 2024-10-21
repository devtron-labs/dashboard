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

import { GenericEmptyStateType } from '../Types'

export type GenericFilterEmptyStateProps = Omit<
    GenericEmptyStateType,
    'image' | 'title' | 'subTitle' | 'isButtonAvailable' | 'renderButton'
> &
    Partial<Pick<GenericEmptyStateType, 'title' | 'subTitle'>> &
    (
        | {
              /**
               * If provided, it will have priority over the isButtonAvailable prop
               * and render clear filter button
               */
              handleClearFilters?: () => void
              isButtonAvailable?: never
              renderButton?: never
          }
        | (Pick<GenericEmptyStateType, 'isButtonAvailable' | 'renderButton'> & {
              handleClearFilters?: never
          })
    )
