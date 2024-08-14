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

export const REGEX_ERROR_MESSAGES = {
    MIN_5_CHAR: 'Minimum 5 characters required',
    LOWER_CASE: 'Use only lowercase alphanumeric characters "-" or "."',
    START_END_ALPHA: 'Start and end with an alphanumeric character only',
    NO_SPACE: "Do not use 'spaces'",
    MAX_30_CHAR: 'Must not exceed 30 characters',
}

export const REQ_FIELD = 'This is a required field'

export const DUPLICATE_NAME = 'Duplicate names found'

export const NAME_REGEX_PATTERN = 'name must follow `^[a-z]+[a-z0-9-?]*[a-z0-9]+$` pattern'

export const EMPTY_ENV = 'Environment is mandatory'

export const APP_NAME_TAKEN = 'App name already taken'

export enum CHART_KEYS {
    CHART_REPO = 'chart-repo',
    DEPRECATED = 'deprecated',
    SEARCH = 'search',
    CLEAR = 'clear',
}
