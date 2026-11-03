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

import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'

import { useQueryClient } from '@devtron-labs/devtron-fe-common-lib'

import { PLUGIN_QUERY_KEYS, PLUGIN_ROUTE_SEGMENTS } from './constants'
import { PluginDetailDrawer } from './PluginDetailDrawer'
import { PluginFormDrawer } from './PluginFormDrawer'
import { PluginList } from './PluginList'
import { PluginFormMode } from './types'
import { getPluginDetailURL } from './utils'

import './styles.scss'

const PluginsRouter = () => {
    const navigate = useNavigate()
    const { search } = useLocation()
    const queryClient = useQueryClient()

    const handleSuccess = (pluginVersionId: number) => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        Promise.all(
            [PLUGIN_QUERY_KEYS.LIST, PLUGIN_QUERY_KEYS.TAGS, PLUGIN_QUERY_KEYS.PARENT_LIST].map((queryKey) =>
                queryClient.invalidateQueries({ queryKey: [queryKey] }),
            ),
        )
        navigate({ pathname: getPluginDetailURL(pluginVersionId), search })
    }

    return (
        <>
            <PluginList />

            <Routes>
                {/* List is rendered outside routes, index route avoids the redirect below which drops the list filters */}
                <Route index element={null} />
                <Route
                    path={PLUGIN_ROUTE_SEGMENTS.CREATE}
                    element={<PluginFormDrawer mode={PluginFormMode.CREATE} handleSuccess={handleSuccess} />}
                />
                <Route
                    path={`:pluginVersionId/${PLUGIN_ROUTE_SEGMENTS.CLONE}`}
                    element={<PluginFormDrawer mode={PluginFormMode.CLONE} handleSuccess={handleSuccess} />}
                />
                <Route
                    path={`:pluginVersionId/${PLUGIN_ROUTE_SEGMENTS.NEW_VERSION}`}
                    element={<PluginFormDrawer mode={PluginFormMode.NEW_VERSION} handleSuccess={handleSuccess} />}
                />
                <Route path=":pluginVersionId" element={<PluginDetailDrawer />} />
                <Route path="*" element={<Navigate to="" />} />
            </Routes>
        </>
    )
}

export default PluginsRouter
