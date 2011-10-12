YUI.add('gallery-viewbynode', function(Y) {

var _instances = {},
    className = Y.ClassNameManager.getClassName('view');

if (!Y.View.getByNode) {
    Y.View.getByNode = function (node) {
        var view; 
        node = Y.Node.one(node);
        
        if (node) {
            node = node.ancestor("." + className, true);
            if (node) {
                view = _instances[Y.stamp(node, true)];
            }
        }

        return view || null;
    };
}

function ViewByNode () {
    this.after('init', this._afterInitCacheContainer);
    this.after('destroy', this._afterDestroyRemoveFromCache);
    this.after('init', this._addClassName);
}

ViewByNode.prototype = {
    _addClassName : function () {
        if (!this.container) {
            this.container = Y.Node.create('<div />');
        }
        this.container.addClass(className);
    },

    _afterInitCacheContainer : function () {
        var container = this.container;

        if (container) {
            _instances[Y.stamp(container, true)] = this;
        }
    },

    _afterDestroyRemoveFromCache : function () {
        var container = this.container;
        
        if (container) {
            delete _instances[Y.stamp(container, true)];
        }
    }
};

Y.namespace('Ext').ViewByNode = ViewByNode;


}, '@VERSION@' ,{requires:['view', 'classnamemanager', 'node-base']});
