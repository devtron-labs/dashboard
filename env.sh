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

# Recreate config file
rm -f ./env-config.js
touch ./env-config.js

# Add assignment
echo "window._env_ = {" >> ./env-config.js

# Read each line in .env file
# Each line represents key=value pairs
while IFS= read -r line || [ -n "$line" ]; do
  # Split env variables by character `=`
  if echo "$line" | grep -q '='; then
    varname=$(echo "$line" | sed 's/=.*//')
    varvalue=$(echo "$line" | sed 's/^[^=]*=//')
  fi

  # Read value of current variable if exists as Environment variable
  value=$(eval echo "\$$varname")

  # Otherwise use value from .env file
  if [ -z "$value" ]; then
    value="$varvalue"
  fi

  # Append configuration property to JS file
  if [ "$value" = "true" ] || [ "$value" = "false" ]; then
    echo "  $varname: $value," >> ./env-config.js
  else
    echo "  $varname: \"$value\"," >> ./env-config.js
  fi
done < .env

echo "}" >> ./env-config.js
