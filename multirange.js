let styleURL = new URL("multirange.css", import.meta.url);

let self = class MultiRange extends HTMLElement {
	static tagName = "range-slider";
	#slot = null;

	constructor() {
		super();

		this.attachShadow({mode: "open"});
		this.shadowRoot.innerHTML = `
			<style>@import url("${styleURL}");</style>
			<div class="multirange">
				<slot>
					<input type="range" part="slider">
				</slot>
			</div>
		`;

		this.container = this.shadowRoot.querySelector(".multirange");
		this.#slot = this.shadowRoot.querySelector("slot");
		this.#slot.addEventListener("slotchange", this);
		this.container.addEventListener("input", this);
	}

	handleEvent (event) {
		console.log(event)
		if (event.type === "slotchange") {
			let previousSource = this.sliderSource;
			let previousCopy = this.sliderCopy;
			previousCopy?.remove();
			this.sliderSource = this.#slot.assignedElements()[0] ?? this.#slot.firstElementChild;
			this.sliderCopy = this.sliderSource.cloneNode(true);
			this.sliderCopy.part = "slider copy";
			this.container.prepend(this.sliderCopy);
			this.sliders = [this.sliderSource, this.sliderCopy].sort((a, b) => a.value - b.value);
			this.#slidersUpdated();
		}
		else if (event.type === "input") {
			this.#valuesUpdated();
			this.dispatchEvent(new CustomEvent("input", {bubbles: true}));
		}
	}

	connectedCallback () {
		this.handleEvent({type: "slotchange"});

		for (let name of this.constructor.observedAttributes) {
			if (this.hasAttribute(name)) {
				this.attributeChangedCallback(name, null, this.getAttribute(name));
			}
		}
	}

	#slidersUpdated () {
		this.sliderLow.classList.remove("high");
		this.sliderLow.classList.add("low");
		this.sliderLow.addEventListener("input", this);
		this.sliderHigh.classList.remove("low");
		this.sliderHigh.classList.add("high");
		this.sliderHigh.addEventListener("input", this);
	}

	#valuesUpdated () {
		console.log(this.sliderLow.value, this.sliderHigh.value, this.progressLow, this.progressHigh)
		if (this.sliderLow.value > this.sliderHigh.value) {
			this.sliders.reverse();
			this.#slidersUpdated();
		}

		this.style.setProperty("--low", this.valueLow);
		this.style.setProperty("--low-progress", this.progressLow + "%");
		this.style.setProperty("--high", this.valueHigh);
		this.style.setProperty("--high-progress", this.progressHigh + "%");
	}

	get sliderLow () {
		return this.sliders[0];
	}
	get sliderHigh () {
		return this.sliders[1];
	}

	get valueLow () {
		return this.sliderLow.value;
	}
	set valueLow (value) {
		this.sliderLow.value = value;
		this.#valuesUpdated();
	}

	get valueHigh () {
		return this.sliderHigh.value;
	}
	set valueHigh (value) {
		this.sliderHigh.value = value;
		this.#valuesUpdated();
	}

	get value () {
		return [this.valueLow, this.valueHigh];
	}
	set value (values) {
		let [low, high = low] = typeof values === "string" ? values.split(",") : values;
		this.valueLow = low;
		this.valueHigh = high;
	}

	get progressLow () {
		return 100 * (this.sliderLow.value - this.min) / (this.max - this.min);
	}

	get progressHigh () {
		return 100 * (this.sliderHigh.value - this.min) / (this.max - this.min);
	}

	static observedAttributes = ["min", "max", "step", "valuelow", "valuehigh", "value"];

	attributeChangedCallback (name, oldValue, newValue) {
		if (newValue !== undefined && newValue === oldValue || !this.isConnected) {
			return;
		}

		let values = this.value + "";

		if (["min", "max", "step"].includes(name)) {
			this.sliderLow.setAttribute(name, newValue);
			this.sliderHigh.setAttribute(name, newValue);
		}
		else if (name === "valuelow") {
			this.sliderLow.setAttribute("value", newValue);
		}
		else if (name === "valuehigh") {
			this.sliderHigh.setAttribute("value", newValue);
		}

		if (this.value + "" !== values) {
			this.#valuesUpdated();
		}
	}
}

let defaults = {min: 0, max: 100, step: 1};

for (let prop of ["min", "max", "step"]) {
	Object.defineProperty(self.prototype, prop, {
		get () {
			let value = this.sliderLow[prop];
			value = value === "" ? defaults[prop] : +value;
			return value;
		},
		set (value) {
			this.sliderLow[prop] = this.sliderHigh[prop] = value;
		}
	});
}

export default self;



// var descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");

// var multirange = function(input) {


// 	var value = input.getAttribute("value");
// 	var values = value === null ? [] : value.split(",");
// 	var min = +(input.min || 0);
// 	var max = +(input.max || 100);
// 	var ghost = input.cloneNode();

// 	input.classList.add("multirange", "original");
// 	ghost.classList.add("multirange", "ghost");

// 	input.value = values[0] || min + (max - min) / 2;
// 	ghost.value = values[1] || min + (max - min) / 2;

// 	input.parentNode.insertBefore(ghost, input.nextSibling);

// 	Object.defineProperty(input, "originalValue", descriptor.get ? descriptor : {
// 		// Fuck you Safari >:(
// 		get: function() { return this.value; },
// 		set: function(v) { this.value = v; }
// 	});

// 	Object.defineProperties(input, {
// 		valueLow: {
// 			get: function() { return Math.min(this.originalValue, ghost.value); },
// 			set: function(v) { this.originalValue = v; },
// 			enumerable: true
// 		},
// 		valueHigh: {
// 			get: function() { return Math.max(this.originalValue, ghost.value); },
// 			set: function(v) { ghost.value = v; },
// 			enumerable: true
// 		}
// 	});

// 	if (descriptor.get) {
// 		// Again, fuck you Safari
// 		Object.defineProperty(input, "value", {
// 			get: function() { return this.valueLow + "," + this.valueHigh; },
// 			set: function(v) {
// 				var values = v.split(",");
// 				this.valueLow = values[0];
// 				this.valueHigh = values[1];
// 				update();
// 			},
// 			enumerable: true
// 		});
// 	}

// 	if (typeof input.oninput === "function") {
// 		ghost.oninput = input.oninput.bind(input);
// 	}

// 	function update() {
// 		ghost.style.setProperty("--low", 100 * ((input.valueLow - min) / (max - min)) + 1 + "%");
// 		ghost.style.setProperty("--high", 100 * ((input.valueHigh - min) / (max - min)) - 1 + "%");
// 	}

// 	input.addEventListener("input", update);
// 	ghost.addEventListener("input", update);

// 	update();
// }

customElements.define("range-slider", self);