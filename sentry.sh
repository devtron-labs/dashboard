#!/bin/sh

#
# Copyright (c) 2024. Devtron Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

SENTRY_ORG=devtron-labs
SENTRY_PROJECT=dashboard

BIN="./node_modules/@sentry/cli/bin/sentry-cli"
yarn build
VERSION=`$BIN releases propose-version`
$BIN releases --org $SENTRY_ORG new --project $SENTRY_PROJECT $VERSION
# do you build steps here
# once you are done, finalize
$BIN releases --org $SENTRY_ORG finalize $VERSION
# integrate commit"
$BIN releases --org $SENTRY_ORG set-commits --auto $VERSION
# upload source maps
$BIN releases --org $SENTRY_ORG --project $SENTRY_PROJECT files $VERSION upload-sourcemaps ./dist/static/js
$BIN releases --org $SENTRY_ORG --project $SENTRY_PROJECT deploys $VERSION new -e PRODUCTION
