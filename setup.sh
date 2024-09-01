#!/bin/sh

declare -a possible_env_types=("production" "development")
declare -a possible_workspace_types=("no-workspace" "ent" "oss")

user_input_env_type=$1
user_input_workspace_type=$2
selected_env_type=""
selected_workspace_type=""

if [ -z "$user_input_env_type" ]; then
  echo 'no env type given. aborting script'
  exit 1
elif [ -z "$user_input_workspace_type" ]; then
  echo 'no workspace type given. aborting script'
  exit 1
fi

for env_type in "${possible_env_types[@]}"; do
  # substring matches user input env type with the possible env types
  if [[ "$env_type" == *"$user_input_env_type"* ]]; then
    selected_env_type=$env_type
  fi
done

if [ -z "$selected_env_type" ]; then
  echo "no env type matched. possible values - ${possible_env_types[@]}"
fi

for workspace_type in "${possible_workspace_types[@]}"; do
  # substring matches user input env type with the possible env types
  if [[ "$workspace_type" == *"$user_input_workspace_type"* ]]; then
    selected_workspace_type=$workspace_type
  fi
done

if [ -z "$selected_workspace_type" ]; then
  echo "no workspace type matched. possible values - ${possible_workspace_types[@]}"
fi

echo "setting up $selected_env_type environment..."
if [ "$selected_env_type" == "${possible_env_types[1]}" ] && [ "$selected_workspace_type" != "${possible_workspace_types[0]}" ]; then
  cat "tsconfig.$selected_workspace_type.json" > tsconfig.json
else
  cat "tsconfig.$selected_env_type.json" > tsconfig.json
fi
echo 'done'

echo "setting up workspace..."
if [ "$selected_workspace_type" == "${possible_workspace_types[0]}" ]; then
  if [ -f 'pnpm-workspace.yaml'  ]; then
    rm pnpm-workspace.yaml
  fi
  cat "package.base.json" > package.json
else
  cat "pnpm-workspace.$selected_workspace_type.yaml" > pnpm-workspace.yaml
  cat "package.$selected_workspace_type.json" > package.json
fi

if [ ! -d '../devtron-fe-lib' ]; then
  exit 0
fi

cd '../devtron-fe-lib'
./setup.sh "$selected_env_type"
