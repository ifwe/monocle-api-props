Monocle Props
=============

Uses the Monocle API "props" syntax to determine if an object or array contains the specified properties.

## Basic Usage

```js
// Require this library
var MoncoleApiProps = require('monocle-api-props');

// Create an instance with the users data
var props = new MoncoleApiProps(users);

// Check if deeply nested properties exist
props.has('items@name'); // returns true or false if the path exists
```

## Advanced Example

```js
// Sample object
var users = {
    total: 3,
    filters: {
        minAge: 20,
        maxAge: 40
    },
    items: [
        {
            name: 'Alice',
            age: 27,
            primaryPhoto: {
                url: 'http://...'
            }
        },
        {
            name: 'Jane',
            age: 32,
            primaryPhoto: {
                url: 'http://...'
            }
        },
        {
            name: 'Ed',
            age: 29,
            primaryPhoto: {
                url: 'http://...'
            }
        }
    ]
};

// Create an instance with the users data
var props = new MoncoleApiProps(users);

// Basic top-level property access
props.has('total');             // returns true because users has a "total" property
props.has('filters');           // returns true because users has a "filters" property
props.has('foo');               // returns false because users does not have a "foo" property

// Nested properties use a "." separator
props.has('filters.minAge');    // returns true because users.filters has a "minAge" property
props.has('filters.maxAge');    // returns true because users.filters has a "maxAge" property
props.has('filters.derp');      // returns false because users.filters does not have a "derp" property

// Reach into arrays using an "@" separator to ensure they all contain the specified property
props.has('items@name');        // returns true because each object in the items array has a "name" property
props.has('items@age');         // returns true because each object in the items array has an "age" property
props.has('items@flerp');       // returns false because at least one object in the items array did not have a "flerp" property

// Mix and match "@" and "." as necessary to drill deeper
props.has('items@primaryPhoto.url'); // returns true because each object in the "items" array has a "primaryPhoto" object with a "url" property.
props.has('items@primaryPhoto.url'); // returns true because each object in the "items" array has a "primaryPhoto" object with a "url" property.
```

## Files and Directory Structure

The following describes the various files in this repo and the directory structure.

**Note:** Files and directories prefixed by `*` are auto-generated and excluded from the
repository via `.gitignore`.

    .
    ├── Gruntfile.js            # grunt task configuration
    ├── README.md               # this file
    ├── *docs                   # autogenerated documentation
    │   └── *index.html         # each JS file in `./lib` has a corresponding HTML file for documentation
    ├── lib                     # all code for this library will be placed here
    │   └── index.js            # main entry point for your npm package
    ├── *node_modules           # all dependencies will be installed here by npm
    ├── package.json            # description of this package for npm, including dependency lists
    └── test                    # unit test configuration, reports, and specs
        ├── *coverage.html      # code coverage report
        ├── lib                 # specs go here, preferably with a 1:1 mapping to code in `./lib`
        │   └── index_test.js   # example spec for `./lib/index.js`
        ├── mocha.opts          # runtime options for mocha
        └── test_runner.js      # configures mocha environment (e.g. chai, sinon, etc.)

## What's Included?

### Grunt

Grunt is a JavaScript task runner to automate common actions. The Tagged NPM Package Seed
supports the following built-in grunt tasks:

**test**

Runs all unit tests through mocha.

    $ grunt test

**coverage**

Runs all unit tests and generates a code coverage report in `./test/coverage.html`

    $ grunt coverage

**watch**

Automatically runs mocha tests each time a file changes in `./lib` or `./test`.

    $ grunt watch

**docs**

Generates documentation for all JS files within `./lib` using docco. Documentation is
written to `./docs`.

    $ grunt docs

**clean**

Deletes all auto-generated files, including `./docs` and `./test/coverage.html`

### Mocha, Sinon, Chai, Blanket

The ultimate TDD environment for node. Place your specs in `./test/lib`, and run `grunt test`.

See `./test/lib/index_test.js` for examples.
