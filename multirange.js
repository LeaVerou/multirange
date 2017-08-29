"use strict";
module.exports = (function(self) {

	var supportsMultiple = self.HTMLInputElement && "valueLow" in HTMLInputElement.prototype;

	var descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");

	self.multirange = function(input) {
	if (supportsMultiple || input.classList.contains("multirange")) {
		return;
	}

	var values = input.getAttribute("value").split(",");
	var max = +input.max || 100;
	var ghost = input.cloneNode();

	input.classList.add("multirange", "original");
	ghost.classList.add("multirange", "ghost");

	input.value = values[0] || max / 2;
	ghost.value = values[1] || max / 2;

	input.parentNode.insertBefore(ghost, input.nextSibling);

	Object.defineProperty(input, "originalValue", descriptor.get ? descriptor : {
		// Fuck you Safari >:(
		get: function() { return this.value; },
		set: function(v) { this.value = v; }
	});

	Object.defineProperties(input, {
		valueLow: {
			get: function() { return Math.min(this.originalValue, ghost.value); },
			set: function(v) { this.originalValue = v; },
			enumerable: true
		},
		valueHigh: {
			get: function() { return Math.max(this.originalValue, ghost.value); },
			set: function(v) { ghost.value = v; },
			enumerable: true
		}
	});

	if (descriptor.get) {
		// Again, fuck you Safari
		Object.defineProperty(input, "value", {
			get: function() { return this.valueLow + "," + this.valueHigh; },
			set: function(v) {
				var values = v.split(",");
				this.valueLow = values[0];
				this.valueHigh = values[1];
			},
			enumerable: true
		});
	}

	function update() {
		ghost.style.setProperty("--low", input.valueLow * 100 / max + 1 + "%");
		ghost.style.setProperty("--high", input.valueHigh * 100 / max - 1 + "%");
	}

	input.addEventListener("input", update);
	ghost.addEventListener("input", update);

	update();
	};

	self.multirange.init = function() {
	Array.from(document.querySelectorAll("input[type=range][multiple]:not(.multirange)")).forEach(self.multirange);
	};

	if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", self.multirange.init);
	} else {
	self.multirange.init();
	}
	return self.multirange;

})(typeof window === 'undefined'? (typeof global === 'undefined' ? {} : global) : window);
