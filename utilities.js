exports.FloatMap = function(val,low1,high1,low2,high2){
	return (low2 + (val - low1) * (high2 - low2) / (high1 - low1));
}