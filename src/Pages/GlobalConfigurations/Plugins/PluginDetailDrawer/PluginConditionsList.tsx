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

import { PluginConditionsListProps } from '../types'

const PluginConditionsList = ({ conditions }: PluginConditionsListProps) => {
    if (!conditions.length) {
        return <span className="cn-7 fs-13 lh-20">No conditions configured</span>
    }

    return (
        <div className="flexbox-col dc__gap-8">
            {conditions.map((condition) => (
                <div key={condition.id} className="flexbox dc__gap-6 fs-13 lh-20 cn-9">
                    <span className="fw-6 dc__capitalize">{condition.conditionType.toLowerCase()} if</span>
                    <span className="font-ibm-plex-mono">
                        {condition.conditionOnVariable} {condition.conditionOperator} {condition.conditionalValue}
                    </span>
                </div>
            ))}
        </div>
    )
}

export default PluginConditionsList
