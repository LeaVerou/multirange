"use strict";
(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], factory); // AMD
	} else if (typeof exports === 'object') {
		module.exports = factory(); // Node, CommonJS-like
	} else {
		root.multirange = factory(); // Browser globals (root is window)
	}
}(this, function() {
	var supportsMultiple = HTMLInputElement && "valueLow" in HTMLInputElement.prototype;

	var descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");

	var multirange = function(input) {
		if (supportsMultiple || input.classList.contains("multirange")) {
			return;
		}

		var value = input.getAttribute("value");
		var values = value === null ? [] : value.split(",");
		var min = +(input.min || 0);
		var max = +(input.max || 100);
		var ghost = input.cloneNode();
		if (ghost.id) {
			ghost.id += "Clone";
		}

		input.classList.add("multirange", "original");
		ghost.classList.add("multirange", "ghost");

		input.value = parseFloat(values[0]) || min + (max - min) / 2;
		ghost.value = parseFloat(values[1]) || min + (max - min) / 2;

		input.parentNode.insertBefore(ghost, input.nextSibling);

		Object.defineProperty(input, "originalValue", descriptor.get ? descriptor : {
			// Fuck you Safari >:(
			get: function() {
				return this.value;
			},
			set: function(v) {
				this.value = v;
			}
		});

		Object.defineProperties(input, {
			valueLow: {
				get: function() {
					return Math.min(this.originalValue, ghost.value);
				},
				set: function(v) {
					this.originalValue = v;
				},
				enumerable: true
			},
			valueHigh: {
				get: function() {
					return Math.max(this.originalValue, ghost.value);
				},
				set: function(v) {
					ghost.value = v;
				},
				enumerable: true
			}
		});

		if (descriptor.get) {
			// Again, fuck you Safari
			Object.defineProperty(input, "value", {
				get: function() {
					return this.valueLow + "," + this.valueHigh;
				},
				set: function(v) {
					var values = v.split(",");
					this.valueLow = values[0];
					this.valueHigh = values[1];
					update();
				},
				enumerable: true
			});
		}

		function update() {
			ghost.style.setProperty("--low", 100 * ((input.valueLow - min) / (max - min)) + 1 + "%");
			ghost.style.setProperty("--high", 100 * ((input.valueHigh - min) / (max - min)) - 1 + "%");
		}

		input.addEventListener("input", update);
		ghost.addEventListener("input", update);

		update();
	};

	multirange.init = function() {
		[].slice.call(document.querySelectorAll("input[type=range][multiple]:not(.multirange)")).forEach(multirange);
	};

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", multirange.init);
	} else {
		multirange.init();
	}
	return multirange;
}));
