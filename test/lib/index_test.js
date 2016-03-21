/*jshint expr: true*/

// Your npm package is accessible by requiring `LIB_DIR`.
var MonocleProps = require(LIB_DIR);

describe('MonocleProps', function() {
    it('is a constructor', function() {
        var props = new MonocleProps();
        props.should.be.instanceOf(MonocleProps);
    });

    describe('.has', function() {
        describe('with simple object', function() {
            beforeEach(function() {
                this.resource = {
                    foo: 'test foo',
                    bar: 'test bar',
                    baz: undefined
                };
                this.props = new MonocleProps(this.resource);
            });

            it('returns true if property exists and is not undefined', function() {
                this.props.has('foo').should.be.true;
                this.props.has('bar').should.be.true;
            });

            it('returns false if property exists but is undefined', function() {
                this.props.has('baz').should.be.false;
            });

            it('returns false if property does not exist', function() {
                this.props.has('derp').should.be.false;
            });
        });

        describe('with nested objects in resource', function() {
            beforeEach(function() {
                this.resource = {
                    foo: {
                        bar: {
                            baz: 'test baz'
                        }
                    }
                };
                this.props = new MonocleProps(this.resource);
            });

            it('returns true if property exists', function() {
                this.props.has('foo').should.be.true;
                this.props.has('foo.bar').should.be.true;
                this.props.has('foo.bar.baz').should.be.true;
            });

            it('returns false if property does not exist', function() {
                this.props.has('derp').should.be.false;
                this.props.has('foo.derp').should.be.false;
                this.props.has('foo.bar.derp').should.be.false;
                this.props.has('foo.bar.baz.derp').should.be.false;
            });
        });

        describe('with array of objects', function() {
            beforeEach(function() {
                this.resource = [
                    { foo: 'foo 1', bar: 'bar 1', baz: 'baz 1' },
                    { foo: 'foo 1', bar: 'bar 1' },
                    { foo: 'foo 1' }
                ];
                this.props = new MonocleProps(this.resource);
            });

            it('returns true if property exists on all items in the array', function() {
                this.props.has('@foo').should.be.true;
            });

            it('returns false if property does not exist', function() {
                this.props.has('@bar').should.be.false;
                this.props.has('@baz').should.be.false;
                this.props.has('@other').should.be.false;
            });
        });

        describe('with array in object', function() {
            beforeEach(function() {
                this.resource = {
                    foo: [
                        {
                            bar: 'test bar 1',
                            baz: 'test baz 1',
                            boo: 'test boo 1'
                        },
                        {
                            bar: 'test bar 2',
                            baz: 'test baz 2'
                            // intentionally missing `boo`
                        },
                        {
                            bar: 'test bar 3'
                            // intentionally missing `boo` and `baz`
                        }
                    ],
                    empty: []
                };
                this.props = new MonocleProps(this.resource);
            });

            it('returns true if property exists within each item of the array', function() {
                this.props.has('foo@bar').should.be.true;
            });

            it('returns true if array exists but is empty', function() {
                this.props.has('empty@anything').should.be.true;
            });

            it('returns false if property does not exist in each item of the array', function() {
                this.props.has('foo@baz').should.be.false;
                this.props.has('foo@boo').should.be.false;
            });
        });

        describe('with nested arrays in resource', function() {
            beforeEach(function() {
                this.resource = {
                    foo: [
                        {
                            bar: [
                                {
                                    derp: 'derp 1',
                                    berp: 'berp 1',
                                },
                                {
                                    derp: 'derp 2',
                                    berp: 'berp 2',
                                },
                                {
                                    derp: 'derp 3',
                                    flerp: 'flerp 1',
                                    herp: 'herp 1'
                                }
                            ],
                            baz: []
                        },
                        {
                            bar: [
                                {
                                    derp: 'derp 1',
                                    berp: 'berp 1',
                                    flerp: 'flerp 1'
                                },
                                {
                                    derp: 'derp 2',
                                    berp: 'berp 2',
                                },
                                {
                                    derp: 'derp 3',
                                }
                            ],
                            baz: [
                                {
                                    hud: 'hud 1',
                                    bud: 'bud 1'
                                },
                                {
                                    dud: 'dud 1',
                                    bud: 'bud 1'
                                }
                            ]
                        }
                    ]
                };
                this.props = new MonocleProps(this.resource);
            });

            it('returns true if property exists within each item of the array', function() {
                this.props.has('foo').should.be.true;
                this.props.has('foo@bar').should.be.true;
                this.props.has('foo@bar@derp').should.be.true;
                this.props.has('foo@baz').should.be.true;
                this.props.has('foo@baz@bud').should.be.true;
            });

            it('returns false if property does not exist in each item of the nested arrays', function() {
                this.props.has('foo@bar@berp').should.be.false;
                this.props.has('foo@bar@flerp').should.be.false;
                this.props.has('foo@bar@herp').should.be.false;
                this.props.has('foo@baz@hud').should.be.false;
                this.props.has('foo.bar').should.be.false;
            });
        });

        describe('with mixed nested arrays and objects in resource', function() {
            beforeEach(function() {
                this.resource = {
                    foo: [
                        {
                            foo1: {
                                foo2: [
                                    {
                                        foo3: 'foo',
                                        derp: 'derp'
                                    },
                                    {
                                        foo3: 'foo',
                                        berp: 'berp'
                                    }
                                ]
                            }
                        },
                        {
                            foo1: {
                                foo2: []
                            }
                        }
                    ],
                    bar: [
                        {
                            bar1: {
                                bar2: [
                                    {
                                        bar3: 'bar'
                                    }
                                ]
                            }
                        },
                        {
                            bar1: {
                                bar2: []
                            }
                        }
                    ],
                    baz: []
                };
                this.props = new MonocleProps(this.resource);
            });

            it('returns true for properties that exist on all items', function() {
                this.props.has('foo@foo1.foo2@foo3').should.be.true;
                this.props.has('bar@bar1.bar2@bar3').should.be.true;
                this.props.has('baz@baz1.baz2@baz3').should.be.true;
            });

            it('returns false for properties that do not exist on all items', function() {
                this.props.has('foo@foo1.foo2@derp').should.be.false;
                this.props.has('foo@foo1.foo2@berp').should.be.false;
                this.props.has('foo@foo1.foo2@herp').should.be.false;
            });
        });
    });

    describe('.set', function() {
        describe('with simple object', function() {
            beforeEach(function() {
                this.resource = {
                    foo: 'test foo',
                    bar: 'test bar'
                };
                this.props = new MonocleProps(this.resource);
            });

            it('updates specified property', function() {
                this.props.set('foo', 'updated foo');
                this.resource.foo.should.equal('updated foo');
            });

            it('does not update other properties', function() {
                this.props.set('foo', 'updated foo');
                this.resource.bar.should.equal('test bar');
            });

            it('does nothing if specified property does not exist', function() {
                this.props.set('something', 'anything');
                expect(this.resource.something).to.be.undefined;
            });
        });

        describe('with simple array', function() {
            beforeEach(function() {
                this.resource = [
                    'test foo',
                    'test bar'
                ];
                this.props = new MonocleProps(this.resource);
            });

            it('replaces array with new value', function() {
                this.props.set('@', ['a', 'b', 'c']);
                this.resource.should.have.lengthOf(3);
                this.resource.should.contain('a');
                this.resource.should.contain('b');
                this.resource.should.contain('c');
                this.resource.should.not.contain('test foo');
                this.resource.should.not.contain('test bar');
            });
        });

        describe('with nested object', function() {
            beforeEach(function() {
                this.resource = {
                    foo: {
                        bar: 'test foo bar',
                        baz: 'test foo baz'
                    },
                    derp: {
                        bar: 'test derp bar',
                        baz: 'test derp baz'
                    },
                    deep: {
                        deeper: {
                            deeperer: {
                                deepest: 'ok'
                            }
                        }
                    }
                };
                this.props = new MonocleProps(this.resource);
            });

            it('replaces nested property', function() {
                this.props.set('foo.bar', 'updated');
                this.resource.foo.bar.should.equal('updated');
            });

            it('does not update other properties', function() {
                this.props.set('foo.bar', 'updated');
                this.resource.foo.baz.should.equal('test foo baz');
                this.resource.derp.bar.should.equal('test derp bar');
                this.resource.derp.baz.should.equal('test derp baz');
            });

            it('does nothing if property does not exist', function() {
                this.props.set('foo.bar', 'updated');
                this.resource.foo.baz.should.equal('test foo baz');
                this.resource.derp.bar.should.equal('test derp bar');
                this.resource.derp.baz.should.equal('test derp baz');
            });

            it('replaces deeply nested property', function() {
                this.props.set('deep.deeper.deeperer.deepest', 'yay');
                this.resource.deep.deeper.deeperer.deepest.should.equal('yay');
            });

            it('does nothing if top level of deep path does not exist', function() {
                this.props.set('deep.beeper.keeperer.seepest', 'yay');
                this.resource.deep.deeper.deeperer.deepest.should.equal('ok');
            });
        });

        describe('with array of objects', function() {
            beforeEach(function() {
                this.resource = [
                    {
                        foo: 'test foo 1',
                        bar: 'test bar 1'
                    },
                    {
                        foo: 'test foo 2',
                        bar: 'test bar 2'
                    },
                    {
                        foo: 'test foo 3',
                        bar: 'test bar 3'
                    }
                ];
                this.props = new MonocleProps(this.resource);
            });

            it('replaces property for all objects within array', function() {
                this.props.set('@foo', 'updated foo');
                this.resource.should.have.lengthOf(3);
                this.resource[0].should.have.property('foo', 'updated foo');
                this.resource[1].should.have.property('foo', 'updated foo');
                this.resource[2].should.have.property('foo', 'updated foo');
            });

            it('does not replace properties that do not match the path', function() {
                this.props.set('@foo', 'updated foo');
                this.resource.should.have.lengthOf(3);
                this.resource[0].should.have.property('bar', 'test bar 1');
                this.resource[1].should.have.property('bar', 'test bar 2');
                this.resource[2].should.have.property('bar', 'test bar 3');
            });
        });

        describe('with object of array of objects', function() {
            beforeEach(function() {
                this.resource = {
                    top: [
                        {
                            foo: 'test foo 1',
                            bar: 'test bar 1'
                        },
                        {
                            foo: 'test foo 2',
                            bar: 'test bar 2'
                        },
                        {
                            foo: 'test foo 3',
                            bar: 'test bar 3'
                        }
                    ]
                };
                this.props = new MonocleProps(this.resource);
            });

            it('replaces property for all objects within array', function() {
                this.props.set('top@foo', 'updated foo');
                this.resource.top.should.have.lengthOf(3);
                this.resource.top[0].should.have.property('foo', 'updated foo');
                this.resource.top[1].should.have.property('foo', 'updated foo');
                this.resource.top[2].should.have.property('foo', 'updated foo');
            });

            it('does not replace properties that do not match the path', function() {
                this.props.set('top@foo', 'updated foo');
                this.resource.top.should.have.lengthOf(3);
                this.resource.top[0].should.have.property('bar', 'test bar 1');
                this.resource.top[1].should.have.property('bar', 'test bar 2');
                this.resource.top[2].should.have.property('bar', 'test bar 3');
            });
        });

        describe.skip('with object of array of objects with array of object', function() {
            beforeEach(function() {
                this.resource = {
                    top: [
                        {
                            child: [
                                {
                                    foo: 'test foo 1',
                                    bar: 'test bar 1'
                                },
                                {
                                    foo: 'test foo 2',
                                    bar: 'test bar 2'
                                }
                            ]
                        },
                        {
                            child: [
                                {
                                    foo: 'test foo 1',
                                    bar: 'test bar 1'
                                },
                                {
                                    foo: 'test foo 2',
                                    bar: 'test bar 2'
                                }
                            ]
                        },
                        {
                            child: [
                                {
                                    foo: 'test foo 3',
                                    bar: 'test bar 3'
                                },
                                {
                                    foo: 'test foo 4',
                                    bar: 'test bar 4'
                                }
                            ]
                        }
                    ]
                };
                this.props = new MonocleProps(this.resource);
            });

            it('replaces property for all objects within array', function() {
                this.props.set('top@child@foo', 'updated foo');
                this.resource.top[0].child.should.have.lengthOf(2);
                this.resource.top[0].child[0].should.have.property('foo', 'updated foo');
                this.resource.top[1].child[0].should.have.property('foo', 'updated foo');
            });
        });
    });

    describe('list()', function() {
        beforeEach(function() {
            this.resource = {
                top: [
                    {
                        foo: 'test foo 1',
                        bar: 'test bar 1',
                        derp: {
                            berp: 'test berp'
                        }
                    },
                    {
                        foo: 'test foo 2',
                        bar: 'test bar 2',
                        herp: ['a', 'b', 'c']
                    },
                    {
                        foo: 'test foo 3',
                        bar: 'test bar 3',
                        jerp: [
                            {
                                kerp: 'lerp',
                                flerp: [
                                    {
                                        haboo: null
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };
            this.props = new MonocleProps(this.resource);
        });

        it('returns array of all defined props', function() {
            var list = this.props.list();
            list.should.have.lengthOf(10);
            list.should.contain('top');
            list.should.contain('top@foo');
            list.should.contain('top@bar');
            list.should.contain('top@derp');
            list.should.contain('top@derp.berp');
            list.should.contain('top@herp');
            list.should.contain('top@jerp');
            list.should.contain('top@jerp@kerp');
            list.should.contain('top@jerp@flerp');
            list.should.contain('top@jerp@flerp@haboo');
        });
    });
});
