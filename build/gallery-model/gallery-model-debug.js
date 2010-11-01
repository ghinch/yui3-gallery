YUI.add('gallery-model', function(Y) {

Y.Model = Y.Base.create('model', Y.Base, [], {
	_id : null,

	// These methods allow setters to be strings for primitive types
	'string' : function (val, key) {
		return String(val);
	},
	'number' : function (val, key) {
		return Number(val);
	},
	'date' : function (val, key) {
		return new Date(val);
	},

	initializer : function (cfg) {
		this.once('initializedChange', function (e) {
			var c = this.constructor,
				id = this.get('_id');

			if (!c._instances) {
				c._instances = {};
			}

			c._instances[id] = this;
		}, this);
	},

	destructor : function () {
		var c = this.constructor,
			id = this.get('_id');

		delete c._instances[id];
	},

	// Compare if two instances are the same by turning them into objects and comparing them as JSON. 
	// Would be nice if we had md5 here... this may have problems though, if Model references are included,
	// may just need to do top level comparison
	compare : function (other) {
		if (!other instanceof this.constructor) {
			return false;
		}

		var selfHash = Y.JSON.stringify(this.toObject()),
			otherHash = Y.JSON.stringify(other.toObject());

		return selfHash == otherHash;
	},

	// Turns this model instance into a Javascript object which can be serialized into another data format
	toObject : function () {
		var c = this.constructor,
			members = c.members(),
			obj = {};

		Y.Array.each(members, function (member) {
			obj[member] = this.get(member);
		}, this);

		return obj;
	}
}, {
	NS : 'model',
	ATTRS : {
		primaryKey : {
			readOnly : true,
			valueFn : function () {
				return this.constructor.PRIMARY_KEY;
			}
		},
		'_id' : {
			readOnly : true,
			getter : function () {
				var pk = this.get('primaryKey'),
					id = (pk ? this.get(pk) : null);

				if (!id) {
					if (!this._id) {
						this._id = Y.guid();
					}
					id = this._id;
				}
				return id;
			}
		}
	},

	getById : function (id) {
		var o;
		if (this._instances) {
			o = this._instances[id];
		}
		return o;
	},

	// Class method for returning a list of all the member properties (ATTRS) of this constructor,
	// up the inheritance chain
	members : function () {
		var c = this.prototype.constructor,
			map = [];

		function pushVal (val, key) {
			if (!val.readOnly) {
				map.push(key);
			}
		}

		while (c) {
			try {
				if (c.ATTRS) {
					Y.Object.each(c.ATTRS, pushVal);
				}
			} catch (err) {}

			c = (c.superclass ? c.superclass.constructor : null);
		}

		return map;
	}
});

function isModel (o) {
	var c = o.superclass.constructor;
	while (c.superclass) {
		if (c == Y.Model) {
			return true;
		}
		c = c.superclass.constructor;
	}
	return false;
}

// Propogates additional data needed for models
Y.mix(Y.Base._buildCfg.custom, {
	getById : function (prop, r, s) {
		if (isModel(r)) {
			r.getById = Y.Model.getById;
		}
	},

	members : function (prop, r, s) {
		if (isModel(r)) {
			r.members = Y.Model.members;
		}
	}
});
Y.namespace('Plugin').DataSourceModelMapper = Y.Base.create('model-mapper', Y.Plugin.Base, [], {
	_mapData : function (data) {
		var map = this.get('map'),
			mappedData = (map ? {} : data);

		Y.Object.each(map, function (sourceKey, member, obj) {
			var path = Y.DataSchema.JSON.getPath(sourceKey);
			mappedData[member] = Y.DataSchema.JSON.getLocationValue(path, data);
		});

		return mappedData;
	},
	_resultsToModels : function (results) {
		var resultSet = [],
			model = this.get('model');

		Y.Array.each(results, function (result, index, arr) {
			var data = this._mapData(result),
				m = (model ? new model(data) : data);

			if (m) {
				resultSet.push(m);
			}
		}, this);

		return resultSet;
	},

	_beforeDefResponseFn : function (e) {
		var results = e.response.results;
		if (results) {
			e.response.results = this._resultsToModels(results);
		} else {
			e.response.results = [];
		}
		Y.DataSource.Local.issueCallback(e, this);
		return new Y.Do.Halt("ModelManager plugin halted defResponseFn");
	},

	initializer : function () {
		this.doBefore('_defResponseFn', this._beforeDefResponseFn);
	}
}, {
	NS : 'mapper',
	ATTRS : {
		map : {},
		model : {}
	}
});


}, '@VERSION@' ,{requires:['base-build', 'datasource-local', 'dataschema-json', 'json-stringify', 'plugin']});
