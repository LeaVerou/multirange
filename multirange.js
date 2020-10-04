(function() {
"use strict";

var isSSR = typeof window === "undefined";

if (isSSR) {
    return;
}

var supportsMultiple = self.HTMLInputElement && "valueLow" in HTMLInputElement.prototype;

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
	var dragMiddle = input.getAttribute("data-drag-middle") !== null;
	var middle = input.cloneNode();

	input.classList.add("multirange");
	input.classList.add("original");
	ghost.classList.add("multirange");
	ghost.classList.add("ghost");

	input.value = values[0] || min + (max - min) / 2;
	ghost.value = values[1] || min + (max - min) / 2;

	input.parentNode.insertBefore(ghost, input.nextSibling);

	Object.defineProperty(input, "originalValue", descriptor.get ? descriptor : {
		// Fuck you Safari >:(
		get: function() { return this.value; },
		set: function(v) { this.value = v; }
	});

	Object.defineProperties(input, {
		valueLow: {
			get: function() { return Math.min(this.originalValue, ghost.value); },
			set: function(v) { this.originalValue = v; update(); },
			enumerable: true
		},
		valueHigh: {
			get: function() { return Math.max(this.originalValue, ghost.value); },
			set: function(v) { ghost.value = v; update(); },
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
				update();
			},
			enumerable: true
		});
	}

	if (typeof input.oninput === "function") {
		ghost.oninput = input.oninput.bind(input);
	}

	function update(mode) {
		ghost.style.setProperty("--low", 100 * ((input.valueLow - min) / (max - min)) + 1 + "%");
		ghost.style.setProperty("--high", 100 * ((input.valueHigh - min) / (max - min)) - 1 + "%");

		if (dragMiddle && mode !== 1) {
			var w = input.valueHigh - input.valueLow;
			if (w>1) w-=0.5;
			middle.style.setProperty("--size", (100 * w / (max - min)) + "%");
			middle.value = min + (input.valueHigh + input.valueLow - 2*min - w)*(max - min)/(2*(max - min - w));
		}
		// Switch colors in IE
		if (input.value > ghost.value) {
			input.classList.add("switched");
			ghost.classList.add("switched");
		} else {
			input.classList.remove("switched");
			ghost.classList.remove("switched");
		}
	}

	ghost.addEventListener("mousedown", function passClick(evt) {
		// Find the horizontal position that was clicked
		var clickValue = min + (max - min)*evt.offsetX / this.offsetWidth;
		var middleValue = (input.valueHigh + input.valueLow)/2;
		if ( (input.valueLow == ghost.value) == (clickValue > middleValue) ) {
			// Click is closer to input element and we swap thumbs
			input.value = ghost.value;
		}
	});
	input.addEventListener("input", update);
	ghost.addEventListener("input", update);

	if (dragMiddle) {
		middle.classList.add("multirange");
		middle.classList.add("middle");
		input.parentNode.insertBefore(middle, input.nextSibling);
		middle.addEventListener("input", function () {
			var w = input.valueHigh - input.valueLow;
			var m = min + w/2 + (middle.value - min)*(max - min - w)/(max-min);
			input.valueLow = m - w/2;
			input.valueHigh = input.valueLow+w;
			update(1);
		});
	}

	update();
}

multirange.init = function() {
	[].slice.call(document.querySelectorAll("input[type=range][multiple]:not(.multirange)")).forEach(multirange);
}

if (typeof module === "undefined") {
	self.multirange = multirange;
	if (document.readyState == "loading") {
		document.addEventListener("DOMContentLoaded", multirange.init);
	}
	else {
		multirange.init();
	}
} else {
	module.exports = multirange;
}

})();
