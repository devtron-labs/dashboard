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

export const Colors = {
    yellow: '#FF7E5B',
    red: '#FF3E3E',
    green: '#1DAD70',
    orange: '#FF7E5B',
    gray: 'rgba(128, 128, 128, 1)',
}

export const AppListViewType = {
    LOADING: 'LOADING',
    LIST: 'LIST',
    EMPTY: 'LIST_EMPTY',
    NO_RESULT: 'NO_RESULT',
    ERROR: 'ERROR',
}

export const CI_PIPELINE_VIEW = {
    SELECT_PIPELINE: 'SELECT_PIPELINE',
}

export const TriggerStatus = {
    pending: Colors.orange,
    starting: Colors.yellow,
    running: Colors.yellow,
    succeeded: Colors.green,
    failed: Colors.red,
    error: Colors.red,
    cancelled: Colors.gray,
    notbuilt: Colors.gray,
    nottriggered: Colors.gray,
}
