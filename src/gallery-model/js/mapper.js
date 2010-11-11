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
		Y.DataSource.Local.issueCallback(e, this.get('host'));
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
