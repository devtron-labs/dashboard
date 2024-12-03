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

export SENTRY_ORG=devtron-a6
export SENTRY_PROJECT=dashboard
export FILES_PATH=./dist

ENV_FILE=".env"

# Load only required variables from the .env file
export SENTRY_AUTH_TOKEN=$(grep '^SENTRY_AUTH_TOKEN=' "$ENV_FILE" | cut -d '=' -f2-)
export SENTRY_RELEASE_VERSION=$(grep '^SENTRY_RELEASE_VERSION=' "$ENV_FILE" | cut -d '=' -f2-)

# Verify required variables are set
if [[ -z "$SENTRY_RELEASE_VERSION" || -z "$SENTRY_RELEASE_VERSION" ]]; then
  echo "Sentry credentials not provided. Skipping uploading source map"
  exit 0
fi

echo "Create a new sentry release: $SENTRY_RELEASE_VERSION"
npx sentry-cli releases new "$SENTRY_RELEASE_VERSION"

echo "Uploading artifacts to Sentry..."
npx sentry-cli sourcemaps inject --org "$SENTRY_ORG" --project "$SENTRY_PROJECT" "$FILES_PATH"
npx sentry-cli sourcemaps upload --org "$SENTRY_ORG" --project "$SENTRY_PROJECT" "$FILES_PATH"

echo "Finalize the sentry release: $SENTRY_RELEASE_VERSION"
npx sentry-cli releases finalize "$SENTRY_RELEASE_VERSION"

echo "Artifacts uploaded and release finalized successfully!"
