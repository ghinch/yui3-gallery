Y.ObjectTag = (function () {
    function _createParamNode (name, value) {
        var param = 
            '<param name="' + name + '" value="' + value + '">';
        return param;
    }
    
    return {
        create : function (data, type, classid, codebase, paramMap) {
            var objTemplate = '<object height="100%" width="100%" ';
            
            if (Y.UA.ie) {
                objTemplate += 'classid="' + classid + '" codebase="' + codebase + '"';
            } else {
                objTemplate += 'data="' + data + '" type="' + type + '"';
            }
            
            objTemplate += '>'; 
            
            Y.Object.each(paramMap, function(val, key) {
                var p = _createParamNode(key, val);
                objTemplate += p;
            });
            
            objTemplate += '</object>';
            
            return objTemplate;
        }
    }; 
})();