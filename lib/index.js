var debug = require('debug')('monocle:props');

// Whatever is exported here will be available to the consumers of your npm module.
module.exports = MonocleProps;

function MonocleProps(resource) {
    this._resource = resource;
}

/**
 * Returns true if the resource contains the specified property according to its path.
 * a.b => reach into object `a` to look for `b` property
 * a@b => reach into array `a` to look for `b` properties on each item
 *
 * @param object resource - The object to check
 * @param string prop - The property path to verify
 * @return boolean
 */
MonocleProps.prototype.has = function(fullPath) {
    debug('has?', fullPath, this._resource);
    if (!fullPath) {
        return true;
    }

    var paths = tokenize(fullPath);

    // Array validation, check each item in the array
    switch(paths[0].type) {
        case 'array':
            return arrayHas(this._resource, paths);

        case 'object':
            return objectHas(this._resource, paths);
    }

    // Shouldn't get here...
    return false;
};

function arrayHas(resource, paths) {
    if (!Array.isArray(resource)) {
        debug('expected an array', build(paths), resource);
        return false;
    }

    if (paths[0].property) {
        paths[0].type = 'object';
    }

    for (var i = 0, len = resource.length; i < len; i++) {
        if (!objectHas(resource[i], paths)) {
            debug('expected path in object from array', build(paths), resource[i]);
            return false;
        }
    }

    paths[0].type = 'array';

    return true;
}

function objectHas(resource, paths) {
    // Walk the path to see if the properties exist
    var current = resource;
    var path;

    for (var i = 0, len = paths.length; i < len; i++) {
        if (null === current) {
            // Trying to fetch a nested property from a top-level object that doesn't exist.
            debug('got current');
            return false;
        }

        path = paths[i];

        switch (path.type) {
            case 'object':
                if (!objectHasChildProp(current, path.property)) {
                    debug('object does not have property', path.property, current);
                    return false;
                }
                current = current[path.property];
                break;

            case 'array':
                var subPaths = paths.slice(i);
                if (!arrayHas(current, subPaths)) {
                    debug('array does not have properties within objects', build(subPaths), current);
                    return false;
                }
                // Nothing else to do
                return true;
        }
    }

    debug('nothing more to validate');
    return true;
}

var objectHasChildProp = function(object, property) {
    return object && property && object.hasOwnProperty(property) && typeof object[property] !== 'undefined';
};

/**
 * Tokenizes a full path into an array of path parts.
 * Each path part contains the type (either 'object' or 'array')
 * and the property name.
 *
 * @param string fullPath - the full path for the property, using '.' to denote a nested property and '@' to denote reaching into an array
 * @return array - tokenized paths
 */
function tokenize(fullPath) {
    var paths = [];
    var currentPath;

    if (fullPath[0] !== '@') {
        currentPath = {
            property: '',
            type: 'object'
        };
        paths.push(currentPath);
    }

    for (var i = 0, len = fullPath.length; i < len; i++) {
        var char = fullPath[i];

        switch (char) {
            case '.':
                currentPath = {
                    property: '',
                    type: 'object'
                };
                paths.push(currentPath);
                break;

            case '@':
                currentPath = {
                    property: '',
                    type: 'array'
                };
                paths.push(currentPath);
                break;

            default:
                currentPath.property += char;
        }
    }

    return paths;
}

function build(paths) {
    var fullPaths = paths.reduce(function(previousValue, path) {
        if (previousValue && path.type === 'object') {
            previousValue += '.';
        }
        if (path.type === 'array') {
            previousValue += '@';
        }
        return previousValue + path.property;
    }, '');
    return fullPaths;
}
