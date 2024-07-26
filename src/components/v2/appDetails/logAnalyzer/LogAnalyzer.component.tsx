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

import { useEffect } from 'react'
import AppDetailsStore, { AppDetailsTabs } from '../appDetails.store'
import { LogSearchTermType } from '../appDetails.type'
import LogsComponent from '../k8Resource/nodeDetail/NodeDetailTabs/Logs.component'

const LogAnalyzerComponent = ({ logSearchTerms, setLogSearchTerms, isExternalApp }: LogSearchTermType) => {
    useEffect(() => {
        AppDetailsStore.markAppDetailsTabActiveByIdentifier(AppDetailsTabs.log_analyzer)
    }, [])

    return (
        <div className="flexbox-col flex-grow-1">
            <LogsComponent
                selectedTab={null}
                isDeleted={false}
                logSearchTerms={logSearchTerms}
                setLogSearchTerms={setLogSearchTerms}
                isExternalApp={isExternalApp}
            />
        </div>
    )
}

export default LogAnalyzerComponent
