YUI.add('gallery-datafinder', function(Y) {

function Record (map) {
	this._count = Record._count;
	this._uid = Record.UID_PREFIX + this._count;
	Record._count++;
	this._data = {};
	if (Y.Lang.isObject(map)) {
		for (var key in map) {
			if (Y.Object.hasKey(map, key)) {
				this._data[key] = map[key];
			}
		}
	}
}

Record._count = 0;

Record.UID_PREFIX = "yui-rec";

Record.prototype = {
	_count : null,

	_uid : null,

	_data : null,

	getCount : function () {
		return this._count;
	},

	getId : function () {
		return this._uid;
	},

	getData : function (key) {
		if (Y.Lang.isString(key)) {
			return this._data[key];
		} else {
			return this._data;
		}
	},

	setData : function (data) {
		if (Y.Lang.isObject(data)) {
			var o = {};
			if (data.key && data.value) {
				o[data.key] = data.value;
				data = o;
			}

			for (o in data) {
				if (Y.Object.hasKey(data, o) && this._data[o]) {
					this._data[o] = data[o];
				}
			}
			
			return this._data;
		}
		return null;
	}
};

Y.Record = Record;
function RecordSet (data) {
	this._uid = RecordSet.UID_PREFIX + RecordSet._count;
	RecordSet._count++;

	this._records = [];

	if (data) {
		if (Y.Lang.isArray(data)) {
			this.addRecords(data);
		} else if (Y.Lang.isObject(data)) {
			this.addRecord(data);
		}
	}
}

Y.mix(RecordSet, {
	NAME : 'recordset',

	_count : 0,

	UID_PREFIX : 'yui-rs'
});

Y.extend(RecordSet, Y.Base, {
	_uid : null,

	initialize : function () {
		this.publish('');
	},

	_addRecord : function (data, index) {
		var record = new Y.Record(data);
		if (Y.Lang.isNumber(index) && (index > -1)) {
			this._records.splice(index, 0, record);
		} else {
			this._records.push(record);
		}
		return record;
	},

	_setRecord : function (data, index) {
		if (!Y.Lang.isNumber(index) || index < 0) {
			index = this._records.length;
		}
		return (this._records[index] = new Y.Record(data));
	},

	_deleteRecord : function (index, range) {
		if (!Y.Lang.isNumber(range) || (range < 0)) {
			range = 1;
		}
		this._records.splice(index, range);
	},

	getId : function () {
		return this._uid;
	},

	getLength : function () {
		return this._records.length;
	},

	getRecord : function (record) {
		var i, len;
		if (record instanceof Y.Record) {
			for(i=0, len = this._records.length; i < len; i++) {
				if(this._records[i] && (this._records[i].getId() == record.getId())) {
					return record;
				}
			}
		} else if (Y.Lang.isNumber(record)) {
			if (record > -1 && (record < this._records.length)) {
				return this._records[record];
			}
		} else if (Y.Lang.isString(record)) {
			for (i = 0, len = this._records.length; i < len; i++) {
				if(this._records[i] && (this._records[i].getId() == record)) {
					return this._records[i];
				}
			}
		}
		return null;
	},

	getRecords : function(index, range) {
		if(!Y.Lang.isNumber(index)) {
			return this._records;
		}
		if(!Y.Lang.isNumber(range)) {
			return this._records.slice(index);
		}
		return this._records.slice(index, index+range);
	},

	hasRecords : function (index, range) {
		for (var i = 0; i < range; ++i) {
			if (typeof this._records[i] === undefined) {
				return false;
			}
		}
		return true;
	},

	getRecordIndex : function(record) {
		if(record) {
			for(var i=this._records.length-1; i>-1; i--) {
				if(this._records[i] && record.getId() === this._records[i].getId()) {
					return i;
				}
			}
		}
		return null;
	},

	addRecord : function(data, index) {
		if(Y.Lang.isObject(data)) {
			var record = this._addRecord(data, index);
			//this.fire("recordAddEvent",{record:record,data:data});
			return record;
		}
		return null;
	},

	addRecords : function(data, index) {
		if(Y.Lang.isArray(data)) {
			var newRecords = [],
				idx,i,len, record;

			index = Y.Lang.isNumber(index) ? index : this._records.length;
			idx = index;

			// Can't go backwards bc we need to preserve order
			for(i=0,len=data.length; i<len; ++i) {
				if(Y.Lang.isObject(data[i])) {
					record = this._addRecord(data[i], idx++);
					newRecords.push(record);
				}
		   }

		   //this.fire("recordsAddEvent",{records:newRecords,data:data});
		   return newRecords;
		}
		else if(Y.Lang.isObject(data)) {
			record = this._addRecord(data);
			//this.fire("recordsAddEvent",{records:[record],data:data});
			return record;
		}
		return null;
	},

	setRecord : function(data, index) {
		if(Y.Lang.isObject(data)) {
			var record = this._setRecord(data, index);
			//this.fire("recordSetEvent",{record:record,data:data});
			return record;
		}
		return null;
	},

	setRecords : function(data, index) {
		var a = Y.Lang.isArray(data) ? data : [data],
			added = [],
			i = 0, l = a.length, j = 0;

		index = parseInt(index, 10)|0;

		for(; i < l; ++i) {
			if (typeof a[i] == 'object' && a[i]) {
				added[j++] = this._records[index + i] = new Y.Record(a[i]);
			}
		}

		//this.fire("recordsSetEvent",{records:added,data:data});

		if (a.length && !added.length) {
		   // YAHOO.log("Could not set Records with data " +
		   //		  lang.dump(aData), "info", this.toString());
		}

		return added.length > 1 ? added : added[0];
	},

	updateRecord : function(record, data) {
		record = this.getRecord(record);
		if(record && Y.Lang.isObject(data)) {
			// Copy data from the Record for the event that gets fired later
			var oldData = Y.Object(record.getData()),
				newData = record.setData(data);
			//this.fire("recordUpdateEvent",{record : record, newData : newData, oldData : oldData});
			//YAHOO.log("Record at index " + this.getRecordIndex(oRecord) +
			//		  " updated with data " + lang.dump(oData), "info", this.toString());
			return record;
		}
		   // YAHOO.log("Could not update Record " + record, "error", this.toString());
		return null;
	},

	updateRecordValue : function(record, key, data) {
		record = this.getRecord(record);
		if(record) {
			var oldData = null,
				keyValue = record.getData(key);
			// Copy data from the Record for the event that gets fired later
			if(keyValue && Y.Lang.isObject(keyValue)) {
				oldData = Y.Object(keyValue);
			}
			// Copy by value
			else {
				oldData = keyValue;
			}

			record.setData({key : key, value : data});
			// this.fire("keyUpdateEvent", {record : record, key : key, newData : data, oldData : oldData});
			//this.fire("recordValueUpdateEvent",{record : record, key : key, newData : data, oldData : oldData});
			// YAHOO.log("Key \"" + sKey +
			//		  "\" for Record at index " + this.getRecordIndex(roRecord) +
			//		  " updated to \"" + lang.dump(oData) + "\"", "info", this.toString());
		}
		else {
			// YAHOO.log("Could not update key " + sKey + " for Record " + record, "error", this.toString());
		}
	},

	replaceRecords : function(data) {
		this.reset();
		return this.addRecords(data);
	},

	sortRecords : function(fnSort, desc, field) {
		return this._records.sort(function(a, b) {return fnSort(a, b, desc, field);});
	},

	reverseRecords : function() {
		return this._records.reverse();
	},

	deleteRecord : function(index) {
		if(Y.Lang.isNumber(index) && (index > -1) && (index < this.getLength())) {
			// Copy data from the Record for the event that gets fired later
			var data = Y.Object(this.getRecord(index).getData());
			
			this._deleteRecord(index);
			//this.fire("recordDeleteEvent",{datai : data, index : index});
			// YAHOO.log("Record deleted at index " + index +
			//		  " and containing data " + lang.dump(oData), "info", this.toString());
			return data;
		}
		else {
			// YAHOO.log("Could not delete Record at index " + index, "error", this.toString());
			return null;
		}
	},

	deleteRecords : function(index, range) {
		if(!Y.Lang.isNumber(range)) {
			range = 1;
		}

		if(Y.Lang.isNumber(index) && (index > -1) && (index < this.getLength())) {
			var recordsToDelete = this.getRecords(index, range),
			// Copy data from each Record for the event that gets fired later
				deletedData = [], i = 0, len = recordsToDelete.length;
			
			for(; i<len; i++) {
				deletedData[deletedData.length] = Y.Object(recordsToDelete[i]);
			}
			this._deleteRecord(index, range);

			//this.fire("recordsDeleteEvent",{data : deletedData, index : index});
		//	  YAHOO.log(range + "Record(s) deleted at index " + index +
		//			  " and containing data " + lang.dump(deletedData), "info", this.toString());

			return deletedData;
		}
		else {
		//	  YAHOO.log("Could not delete Records at index " + index, "error", this.toString());
			return null;
		}
	},

	reset : function() {
		this._records = [];
		//this._length = 0;
		//this.fire("resetEvent");
		// YAHOO.log("All Records deleted from RecordSet", "info", this.toString());
	}
});

Y.RecordSet = RecordSet;
function DataFinder () {
	DataFinder.superclass.constructor.apply(this, arguments);
}

Y.mix(DataFinder, {
	NAME : "datafinder",

	ATTRS : {
		dataSource : {
			validator : function (val) {
				return this._validateDataSource(val);
			}
		}
	}
});

Y.extend(DataFinder, Y.Base, {
	_query : null,

	_validateDataSource : function (val) {
		if (val instanceof Y.DataSource.Local) {
			return true;
		}
		return false;
	},

	initializer : function () {
		this.publish('success');
		this.publish('failure');
	},

	setParam : function (param, value) {
		if (typeof this._query === undefined || this._query === null) {
			this._query = '';
		}

		this._query += '&' + param + '=' + value;

		return this;
	},

	fetch : function () {
		var ds = this.get('dataSource');
		ds.sendRequest(this._query, {
			success : function (args) {
				var self = args.callback.argument,
					rs;
				if (args.response && args.response.results && !args.response.error) {
					rs = new Y.RecordSet();
					rs.setRecords(args.response.results, 0);
					self.fire('success', {
						request : args.request, 
						records : rs, 
						meta : args.response.meta
					});
				}
			}, 
			failure : function (args) {
				this.fire('failure', args);
			},
			argument : this
		});
	}
});

Y.DataFinder = DataFinder;


}, '@VERSION@' ,{requires:['yui']});
