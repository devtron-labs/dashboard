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

import { CreatePluginFormErrorType, CreatePluginFormType, CreatePluginFormViewType } from './types'

export const CREATE_PLUGIN_DEFAULT_FORM: CreatePluginFormType = {
    icon: '',
    id: 0,
    name: '',
    pluginIdentifier: '',
    pluginVersion: '',
    docLink: '',
    description: '',
    tags: [],
    inputVariables: [],
    currentTab: CreatePluginFormViewType.NEW_PLUGIN,
    shouldReplaceCustomTask: false,
}

export const CREATE_PLUGIN_DEFAULT_FORM_ERROR: CreatePluginFormErrorType = {
    icon: '',
    name: '',
    pluginIdentifier: '',
    pluginVersion: '',
    docLink: '',
    description: '',
    tags: '',
}

export const MAX_TAG_LENGTH = 128
