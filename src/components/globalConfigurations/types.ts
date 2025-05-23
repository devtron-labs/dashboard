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

import { HTMLAttributes, MutableRefObject } from 'react'

import { TippyCustomizedProps } from '@devtron-labs/devtron-fe-common-lib'

export type TippyConfig =
    | (Omit<TippyCustomizedProps<false>, 'theme' | 'children' | 'placement'> & {
          showTippy: true
          /**
           * The nav link route on which the Tippy should be shown
           */
          showOnRoute: string
      })
    | {
          showTippy: false
      }

export interface GlobalConfiguration {
    tippyConfig: TippyConfig
    setTippyConfig: (tippyConfig: TippyConfig) => void
}

export interface ListProps extends HTMLAttributes<HTMLDivElement> {
    dataTestId?: string
    internalRef?: MutableRefObject<HTMLDivElement>
}
