var notImplementedError = function(){
	throw Error("NOT IMPLEMENTED");
};

var serverPrototypeInterface = {
	start: notImplementedError,
	stop: notImplementedError
};

module.exports = serverPrototypeInterface;