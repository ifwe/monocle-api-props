var debug = require('debug')('monocle-api:props');

// Whatever is exported here will be available to the consumers of your npm module.
module.exports = MonocleProps;

function MonocleProps(resource) {
    this._resource = resource;
}

MonocleProps.prototype.list = function() {
    var list = [];
    var found = [];

    if (Array.isArray(this._resource)) {
        found = listPropsFromArray(this._resource);
    } else {
        found = listPropsFromObject(this._resource);
    }

    found.forEach(function(prop) {
        if (-1 === list.indexOf(prop)) {
            list.push(prop);
        }
    });

    return list;
};

function listPropsFromArray(resource, prefix) {
    debug('listing props from array', resource, prefix);
    var list = [];
    var found;
    prefix = prefix || '@';

    for (var i = 0, len = resource.length; i < len; i++) {
        if (Array.isArray(resource[i])) {
            found = listPropsFromArray(resource[i], prefix);
        } else if (typeof resource[i] === 'object' && null !== resource[i]) {
            found = listPropsFromObject(resource[i], prefix);
        }

        if (found) {
            found.forEach(function(prop) {
                if (-1 === list.indexOf(prop)) {
                    list.push(prop);
                }
            });
        }

        found = null;
    }

    return list;
}

function listPropsFromObject(resource, prefix) {
    debug('listing props from object', resource, prefix);
    var list = [];
    var found;
    prefix = prefix || '';

    for (var i in resource) {
        if (!resource.hasOwnProperty(i)) {
            continue;
        }

        list.push(prefix + i);

        if (Array.isArray(resource[i])) {
            found = listPropsFromArray(resource[i], prefix + i + '@');
        } else if (typeof resource[i] === 'object' && null !== resource[i]) {
            found = listPropsFromObject(resource[i], prefix + i + '.');
        }

        if (found) {
            found.forEach(function(prop) {
                if (-1 === list.indexOf(prop)) {
                    list.push(prop);
                }
            });
        }

        found = null;
    }

    return list;
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
    debug('checking if object has path', fullPath, this._resource);
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

MonocleProps.prototype.set = function(fullPath, value) {
    // Find the parent object(s) of the property we want to change
    var paths = tokenize(fullPath);
    var last = paths.pop();

    var parents = getAll(this._resource, paths);
    parents.forEach(function(item) {
        switch (last.type) {
            case 'object':
                if (item.hasOwnProperty(last.property)) {
                    item[last.property] = value;
                }
                break;

            case 'array':
                // Using .splice to update the array in place.
                if (!last.property) {
                    debug('last path did not contain a property', last);
                    Array.prototype.splice.apply(item, [0, item.length].concat(value));
                } else {
                    debug('last path has a property', last);
                    // Set all of them
                    item.forEach(function(innerItem) {
                        if (innerItem.hasOwnProperty(last.property)) {
                            innerItem[last.property] = value;
                        }
                    });
                }
                break;
        }
    });

    debug('got parents', parents);
};

function getAll(object, paths) {
    debug('getting all', paths, object);
    var all = [];

    if (!paths.length) {
        debug('no paths, returning original object');
        all.push(object);
    } else {
        var current = object;

        for (var i = 0, len = paths.length; i < len; i++) {
            var path = paths[i];

            switch (path.type) {
                case 'object':
                    if (!objectHasChildProp(current, path.property)) {
                        break;
                    }
                    current = current[path.property];
                    break;

                case 'array':
                    return getAll(current, paths.slice(i + 1));
                    break;
            }
        }

        all.push(current);
    }

    debug('got all', paths, all);

    return all;
}

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
