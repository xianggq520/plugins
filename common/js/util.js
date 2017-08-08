var trim = function() {
	return this.toString().replace(/^\s+|\s+$/g, '');
};
var indexOf = function(array, searchElement) {
	for(var i = 0, len = array.length; i < len; i++) {
		if(array[i] === searchElement) {
			return i;
		}
	}
	return -1;
};