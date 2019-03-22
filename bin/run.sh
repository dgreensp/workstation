#!/bin/bash -e

(
  cd `dirname "$0"`/..

  # --skipLibCheck skips checking all .d.ts files,
  # because this takes several seconds for e.g. react
  # alone, and is done on every file change
  node_modules/.bin/tsc -w --skipLibCheck &

  node devserver
)
