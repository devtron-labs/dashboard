#!/bin/sh

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
