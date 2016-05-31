if (self.HTMLInputElement && !("valueLow" in HTMLInputElement.prototype)) {
(function($, $$){

self.multirange = function(input) {
	var values = input.getAttribute("value").split(",");
	var max = +input.max || 100;
	var clone = input.cloneNode();

	input.classList.add("multirange", "original");
	clone.classList.add("multirange", "clone");

	input.value = values[0] || max/2;
	clone.value = values[1] || max/2;

	input.parentNode.insertBefore(clone, input.nextSibling);

	Object.defineProperty(input, "originalValue", Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value"));

	Object.defineProperties(input, {
		valueLow: {
			get: function() { return Math.min(this.originalValue, clone.value); },
			set: function(v) { this.originalValue = v; }
		},
		valueHigh: {
			get: function() { return Math.max(this.originalValue, clone.value); },
			set: function(v) { clone.value = v; }
		},
		value: {
			get: function() { return this.valueLow + "," + this.valueHigh; }
		}
	});

	[input, clone]._.addEventListener("input", function (evt) {
		clone.style.setProperty("--low", input.valueLow * 100 / max + "%");
		clone.style.setProperty("--high", input.valueHigh * 100 / max + "%");
	})._.fire("input");
}

$$('input[type="range"][multiple]').forEach(multirange);

})(Bliss, Bliss.$);
}
