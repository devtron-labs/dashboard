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

import loadingFailure from '../Assets/Img/ic-loading-failure.png'
import { ReloadType } from './Types'
import { refresh } from './Helper'

/**
 * @deprecated Use APIResponseHandler (Preferred) or error screen manager instead
 */
export default function Reload({ reload, className = '', heightToDeduct = 0 }: ReloadType) {
    return (
        <article
            className={`flex w-100 h-100 ${className}`}
            {...(heightToDeduct > 0 && { style: { height: `calc(100vh - ${heightToDeduct}px)` } })}
        >
            <div className="flex column w-250 dc__align-center" data-testid="reload">
                <img src={loadingFailure} style={{ height: 'auto' }} className="w-100 mb-12" alt="load-error" />
                <h3 className="title dc__bold">Failed to load</h3>
                <div className="dc__empty__subtitle mb-20">
                    We could not load this page. Please give us another try.
                </div>
                <button type="button" className="cta ghosted" onClick={typeof reload === 'function' ? reload : refresh}>
                    Retry
                </button>
            </div>
        </article>
    )
}
