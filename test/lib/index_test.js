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
});
