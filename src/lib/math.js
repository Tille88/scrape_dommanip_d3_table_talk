var MathUtils = function() {};

MathUtils.clamp = function(num, min, max){
	return Math.min(Math.max(num, min), max);
};


module.exports = MathUtils;