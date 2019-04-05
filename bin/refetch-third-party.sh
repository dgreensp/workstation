#!/bin/bash -e

# Use this curl when output is going to stdout
CURL_STDOUT='curl --silent --show-error --fail'
# Use this curl with -o, because it prints progress information
CURL=$CURL_STDOUT' --write-out %{url_effective}\n'

curl_amd () {
  (
    echo 'define("'$2'", function (require, exports, module) {'
    $CURL_STDOUT $3
    echo '});'
  ) > $1
  echo $3
}

(
  cd `dirname "$0"`/../docs

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

  mkdir orderedmap
  curl_amd orderedmap/index.js orderedmap https://unpkg.com/orderedmap@1.0.0/index.js
  $CURL -o orderedmap/index.d.ts https://unpkg.com/@types/orderedmap@1.0.0/index.d.ts
  mkdir prosemirror-model
  curl_amd prosemirror-model/index.js prosemirror-model https://unpkg.com/prosemirror-model@1.7.0/dist/index.js
  $CURL -o prosemirror-model/index.d.ts https://unpkg.com/@types/prosemirror-model@1.7.0/index.d.ts
  mkdir prosemirror-transform
  curl_amd prosemirror-transform/index.js prosemirror-transform https://unpkg.com/prosemirror-transform@1.1.3/dist/index.js
  $CURL -o prosemirror-transform/index.d.ts https://unpkg.com/@types/prosemirror-transform@1.1.0/index.d.ts
  mkdir prosemirror-state
  curl_amd prosemirror-state/index.js prosemirror-state https://unpkg.com/prosemirror-state@1.2.2/dist/index.js
  $CURL -o prosemirror-state/index.d.ts https://unpkg.com/@types/prosemirror-state@1.2.3/index.d.ts
  mkdir prosemirror-view
  curl_amd prosemirror-view/index.js prosemirror-view https://unpkg.com/prosemirror-view@1.8.4/dist/index.js
  $CURL -o prosemirror-view/index.d.ts https://unpkg.com/@types/prosemirror-view@1.3.1/index.d.ts
  $CURL -o prosemirror-view/prosemirror.css https://unpkg.com/prosemirror-view@1.3.1/style/prosemirror.css
  mkdir rope-sequence
  curl_amd rope-sequence/index.js rope-sequence https://unpkg.com/rope-sequence@1.2.2/dist/index.js
  mkdir prosemirror-history
  curl_amd prosemirror-history/index.js prosemirror-history https://unpkg.com/prosemirror-history@1.0.4/dist/history.js
  $CURL -o prosemirror-history/index.d.ts https://unpkg.com/@types/prosemirror-history@1.0.1/index.d.ts
  mkdir w3c-keyname
  curl_amd w3c-keyname/index.js w3c-keyname https://unpkg.com/w3c-keyname@1.1.8/index.js
  mkdir prosemirror-keymap
  curl_amd prosemirror-keymap/index.js prosemirror-keymap https://unpkg.com/prosemirror-keymap@1.0.1/dist/keymap.js
  $CURL -o prosemirror-keymap/index.d.ts https://unpkg.com/@types/prosemirror-keymap@1.0.1/index.d.ts
  mkdir prosemirror-commands
  curl_amd prosemirror-commands/index.js prosemirror-commands https://unpkg.com/prosemirror-commands@1.0.7/dist/commands.js
  $CURL -o prosemirror-commands/index.d.ts https://unpkg.com/@types/prosemirror-commands@1.0.1/index.d.ts

  mkdir tabbable
  curl_amd tabbable/index.js tabbable https://unpkg.com/tabbable@4.0.0/index.js
  $CURL -o tabbable/index.d.ts https://unpkg.com/@types/tabbable@3.1.0/index.d.ts
)
