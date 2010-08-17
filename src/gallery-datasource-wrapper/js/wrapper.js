/**
 * @module datasource-wrapper
 */

var EMPTY_FN = function () {};
 
/**
 * @class Y.DataSourceWrapper
 * @extends Y.Base
 * @constructor
 * @param config {Object}
 * @description Wraps a YUI 3 DataSource instance in an object that
 *				will function with a YUI 2 DataTable
 */
function DSW () {
	DSW.superclass.constructor.apply(this, arguments);
}

Y.mix(DSW, {
	NAME : 'datasource-wrapper',
	ATTRS : {
		/**
		 * @attribute source
		 * @type Y.DataSource.Local
		 * @description A YUI 3 DataSource instance to wrap
		 */
		source : {
			value : null,
			lazyAdd : true,
			setter : function (source) {
				this._createSchema(source);
				return source;
			}
		}
	}
});

Y.extend(DSW, Y.Base, {
    /** 
     * @method _createSchema
     * @param source {Y.DataSource.Local}
     * @private
     * @description Copies the supplied YUI 3 DataSource's schema to
     *              a YUI2 compatible one
     */
    _createSchema : function (source) {
        var schema = source.schema;
        if (!schema) {
			Y.log("You must provide a DataSource with a valid schema", "error", "DataSourceWrapper");
            return;
        }
        schema = schema.get('schema');
        this.responseSchema = { 
            fields : (schema.resultFields || []),
            metaFields : (schema.metaFields || {}),
            resultsList : (schema.resultListLocator || '') 
        };
    },  

    /** 
     * @property responseSchema
     * @type {Object}
     * @description YUI 2 compatible version of the response schema
     */
    responseSchema : null,

	/**
	 * @method sendRequest
	 * @param req {String} A request to send the DataSource
	 * @param cb {Object} A callback object in the structure of a YUI 2 DataSource which contains:
	 *						- success : function that handles success event
	 *						- failure : function that handles failure event
	 *						- scope : scope (this) of callback functions
	 *						- argument : a data object to pass to callback functions
	 */
	sendRequest : function (req, cb) {
		var ds = this.get('source');
		req = req || '';
		
		if (!ds || !ds.sendRequest) {
			Y.log("You must provide a valid DataSource instance", "error", "DataSourceWrapper");
			return;
		}
		
		if (Y.Lang.isObject(cb) === false) {
			Y.log("Please provide a valid callback", "error", "DataSourceWrapper");
			return;
		}

		cb.success = cb.success || EMPTY_FN;
		cb.failure = cb.failure || EMPTY_FN;
		cb.scope = cb.scope || this;
		
		ds.sendRequest({
			request : req,
			callback : {
				success : Y.bind(function (e) {
					cb.success.call(this, e.request, e.response, cb.argument);
				}, cb.scope),
				failure : Y.bind(function (e) {
					cb.failure.call(this, e.request, e.response, cb.argument);
				}, cb.scope)
			}
		});
	}
});

Y.DataSourceWrapper = DSW;
