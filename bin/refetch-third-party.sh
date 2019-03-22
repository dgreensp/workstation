#!/bin/bash -e

CURL='curl --silent --show-error --fail --write-out %{url_effective}\n'

(
  cd `dirname "$0"`/../public

  rm -rf third-party/*
  cd third-party

  mkdir almond
  $CURL -o almond/index.js https://unpkg.com/almond@0.3.3/almond.js

  mkdir react
  $CURL -o react/index.js https://unpkg.com/react@16.8.4/umd/react.development.js
  sed -i "" "s/define(factory)/define('react', factory)/" react/index.js
  $CURL -o react/index.d.ts https://unpkg.com/@types/react@16.8.8/index.d.ts
  $CURL -o react/global.d.ts https://unpkg.com/@types/react@16.8.8/global.d.ts
  mkdir csstype
  $CURL -o csstype/index.d.ts https://unpkg.com/csstype@2.6.3/index.d.ts
  mkdir prop-types
  $CURL -o prop-types/index.d.ts https://unpkg.com/@types/prop-types@15.7.0/index.d.ts
  $CURL -o prop-types/index.js https://unpkg.com/prop-types@15.7.2/prop-types.js
  sed -i "" "s/define(\[\],f)/define('prop-types',\[\],f)/" prop-types/index.js

  mkdir react-dom
  $CURL -o react-dom/index.js https://unpkg.com/react-dom@16.8.4/umd/react-dom.development.js
  sed -i "" "s/define(\['react'\], factory)/define('react-dom', ['react'], factory)/" react-dom/index.js
  $CURL -o react-dom/index.d.ts https://unpkg.com/@types/react-dom@16.8.2/index.d.ts

  mkdir ResizeSensor
  $CURL -o ResizeSensor/index.js https://unpkg.com/css-element-queries@1.1.1/src/ResizeSensor.js
  sed -i "" "s/define(factory)/define('ResizeSensor', factory)/" ResizeSensor/index.js
  $CURL -o ResizeSensor/index.d.ts https://unpkg.com/css-element-queries@1.1.1/src/ResizeSensor.d.ts

  mkdir bootstrap
  $CURL -o bootstrap/bootstrap.css https://unpkg.com/bootstrap@4.3.1/dist/css/bootstrap.css
  $CURL -o bootstrap/bootstrap.css.map https://unpkg.com/bootstrap@4.3.1/dist/css/bootstrap.css.map

  mkdir reactstrap
  $CURL -o reactstrap/index.js https://unpkg.com/reactstrap@7.1.0/dist/reactstrap.js
  sed -i "" "s/define\.amd ? define(\[/define\.amd ? define('reactstrap', \[/" reactstrap/index.js
  $CURL -o reactstrap/index.d.ts https://unpkg.com/@types/reactstrap@7.1.3/index.d.ts
  (
    mkdir reactstrap/lib
    cd reactstrap/lib
    # this is made to work on Linux too, even though the flags accepted by grep and xargs are a little
    # different, in particular:
    # * grep supports lookaheads on Linux and in GNU grep, but not stock OS X grep
    # * xargs supports -i and -I on Linux and -I and -J on OS X, so we use -I
    # * xargs on Linux requires newline delimiting, not space delimiting, when using -n1 -I
    grep -o "'\./lib/[^']\+'" ../index.d.ts | tr -d "'" | cut -c3- | sort | uniq | xargs -n1 -I {} $CURL -O https://unpkg.com/@types/reactstrap@7.1.3/{}.d.ts
  )

  # this version of react-popper is intentionally not compatible with reactstrap
  mkdir react-popper
  $CURL -o react-popper/index.js https://unpkg.com/react-popper@1.3.3/dist/index.umd.js
  sed -i "" "s/define\.amd ? define(\[/define\.amd ? define('react-popper', \[/" react-popper/index.js
  $CURL -o react-popper/index.d.ts https://unpkg.com/react-popper@1.3.3/typings/react-popper.d.ts
  mkdir popper.js
  $CURL -o popper.js/index.js https://unpkg.com/popper.js@1.14.7/dist/umd/popper.js
  sed -i "" "s/define\.amd ? define(factory/define\.amd ? define('popper.js', factory/" popper.js/index.js
  $CURL -o popper.js/index.d.ts https://unpkg.com/popper.js@1.14.7/index.d.ts

  mkdir hoverintent
  $CURL -o hoverintent/index.js https://unpkg.com/hoverintent@2.2.0/dist/hoverintent.min.js
)
