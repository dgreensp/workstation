# Workstation

## What is this?

This is a place to build tiny apps, with just TypeScript and a browser.

All of the source code, build products, HTML, and CSS are in the `docs/` directory, which can be served locally or off of GitHub Pages (which special-cases the `docs/` directory for this purpose).

To run, execute `bin/run.sh`, which will start a TypeScript compile watcher to build the JavaScript bundle, along with a webserver on `localhost:10000`, which is basically just a static file server for the files in `docs/`.

Every directory in the `docs/` directory, or every `.html` file, can be its own demo app.  When I get a small demo working, I leave it alone!  That code can serve as an example for when I do that thing again.  Or, I extract the functionality into a universally useful library.  If I want to take the demo further, I duplicate it and modify the copy.

There is one global JavaScript bundle, built by the TypeScript compiler, which includes all dependencies.  This is because I don't care about code size here; I'm taking a break from worrying about tree-shaking and optimizing bundles and all that.  Also, I'm looking to choose a few technologies and really go deep: React, ProseMirror, maybe Bootstrap, maybe Emotion or something for CSS.  I'm looking to do a large number of experiments with a small number of libraries, in order to converge on an app or platform that uses all of them in a beautiful way.

In order to reduce configuration and moving parts, I'm not only not using Webpack or any bundler (except the TypeScript compiler), I'm also not using npm to install client-side dependencies!  Node is required to run the dev server, and npm is used to install the TypeScript compiler, and that's it.  Dependencies like React are fetched by `bin/refetch-third-party.sh` and committed to the repository in the `docs/third-party` directory.  They are accessed from the demo code via AMD and the Almond module loader (see `docs/toplevel.ts`).  Adding a new third-party library requires some fiddling to find a distribution packaged in the correct way.  All JavaScript code in the `docs/third-party` directory is found by the TypeScript compiler and included
in the bundle as top-level scripts that define AMD modules.  The names and locations of the JS files in `docs/third-party` are not technically important, but the names and locations of the `.d.ts` files are, so that TypeScript can find the type definitions.

The reason for using a dev web server is because `file:` URLs have so many quirks and security limitations.  Running a minimal web server, which has full priveleges and can access the file system and network to its heart's content, is much nicer.  At the same time, I want to keep the server-side footprint to an absolute minimum.

In the future, I could even see myself compiling the TypeScript on the client, so that the whole development experience runs in the browser.  Then I could break the dependencies on Node, and the TypeScript compiler being installed with npm, and the file system and file watching.  Note that the TypeScript compiler is very callable from JavaScript (or TypeScript), including on the client, but it requires synchronous access to the (real or virtual) file system.

In the future, it would be cool to use ES modules, supported directly by the browser, instead of bundling.  However, using ES Modules together with TypeScript and third-party libraries is quite tricky.  For example, browsers interpret import file paths as URLs, and many popular libraries including React have not gotten with the program yet of having ES module distributions with named exports.