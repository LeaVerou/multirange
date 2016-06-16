(function() {
"use strict";

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

    function passClick(evt) {
      // Are the ghost and input elements inverted? (ghost is lower range)
      var isInverted = input.valueLow == ghost.value;
      // Find the horizontal position that was clicked (as a percentage of the element's width)
      var clickPoint = evt.offsetX / this.offsetWidth;
      // Map the percentage to a value in the range (note, assumes a min value of 0)
      var clickValue = max * clickPoint;

      // Get the distance to both high and low values in the range
      var highDiff = Math.abs(input.valueHigh - clickValue);
      var lowDiff = Math.abs(input.valueLow - clickValue);

      if (lowDiff < highDiff && !isInverted || (isInverted && lowDiff > highDiff)) {
        // The low value is closer to the click point than the high value
        // We should update the low value input
        var passEvent = new MouseEvent("mousedown", {screenX: evt.screenX, clientX: evt.clientX});
        // Pass a new event to the low "input" element (which is obscured by the
        // higher "ghost" element, and doesn't get mouse events outside the drag handle
        input.dispatchEvent(passEvent);
        // The higher "ghost" element should not respond to this event
        evt.preventDefault();
        return false;
      }
      else {
      	// The high value is closer to the click point than the low value
        // The default behavior is appropriate, so do nuthin
      }
    }

    ghost.addEventListener("mousedown", passClick);
    input.addEventListener("input", update);
    ghost.addEventListener("input", update);

	update();
}

multirange.init = function() {
	Array.from(document.querySelectorAll("input[type=range][multiple]:not(.multirange)")).forEach(multirange);
}

if (document.readyState == "loading") {
	document.addEventListener("DOMContentLoaded", multirange.init);
}
else {
	multirange.init();
}

})();