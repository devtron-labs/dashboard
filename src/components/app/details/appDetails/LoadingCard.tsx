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

import { LoadingCardType } from './appDetails.type'

const LoadingCard = ({ wider }: LoadingCardType) => (
    <div className={`app-details-info-card pointer flex left bcn-0 br-8 mr-12 lh-20 ${wider ? 'w-250' : 'w-200'}`}>
        <div className="app-details-info-card__top-container">
            <div className="shimmer-loading w-120 h-14 br-2 mb-6" />
            <div className="shimmer-loading w-80px h-18 br-2 mb-6" />
        </div>
        <div className="app-details-info-card__bottom-container">
            <div className="shimmer-loading w-100 h-14 br-2" />
        </div>
    </div>
)

export default LoadingCard
