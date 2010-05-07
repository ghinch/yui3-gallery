function ObjectPluginBase () {
    ObjectPluginBase.superclass.constructor.apply(this, arguments);
}

ObjectPluginBase.NAME = 'object-plugin';

Y.extend(ObjectPluginBase, VideoPluginBase, {
    _createObjectNode : function (data, type, classid, codebase, paramMap) {
        var objTemplate = '<object height="100%" width="100%" ',
            widget = this.get('host'),
            contentBox = widget.get('contentBox');
        
        if (Y.UA.ie) {
            objTemplate += 'classid="' + classid + '" codebase="' + codebase + '"';
        } else {
            objTemplate += 'data="' + data + '" type="' + type + '"';
        }
        
        objTemplate += '>'; 
        
        Y.Object.each(paramMap, Y.bind(function(val, key) {
            var p = this._createParamNode(key, val);
            objTemplate += p;
        }, this));
        
        objTemplate += '</object>';
        
        contentBox.set('innerHTML', objTemplate);
        return contentBox.one('object');
    },
    
    
    _createParamNode : function (name, value) {
        var param = 
            '<param name="' + name + '" value="' + value + '">';
        
        return param;
    }
});