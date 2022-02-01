#!/usr/bin/env bash

while getopts e:s:b:c: flag; do
  case "${flag}" in
  e) ENVIRONMENT=${OPTARG} ;;
  *) exit 1 ;;
  esac
done

if [[ ! -f ".env.${ENVIRONMENT}" ]]; then
  echo ".env.${ENVIRONMENT} not found, so stopping build!"
  exit 1
fi

ELB_MODE=$(awk -F "=" '/ELB_MODE/ {print $2}' .env."${ENVIRONMENT}")
SUPABASE_URL=$(awk -F "=" '/SUPABASE_URL/ {print $2}' .env."${ENVIRONMENT}")
SUPABASE_ANON_KEY=$(awk -F "=" '/SUPABASE_ANON_KEY/ {print $2}' .env."${ENVIRONMENT}")

{
  echo "ELB_MODE=${ELB_MODE}"
  echo "ENVIRONMENT=${ENVIRONMENT}"
  echo "SUPABASE_URL=${SUPABASE_URL}"
  echo "SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}"
} >.env
