/**
 * DOM helper
 */
var DOM = {}
/**
 * Gets all clases of an element in an array 
 * @param element Element
 */
DOM.getClasses = function (element) {
	return element.className.split(" ")
}
/**
 * Sets the classes of an element by an array
 * @param element Element
 * @param classes Array
 */
DOM.setClasses = function (element, classes) {
	element.className = classes.join(" ")
}
/**
 * Add a class to an element.
 * @param element Element
 * @param className string
 */
DOM.addClass = function (element, className) {
	var classes = DOM.getClasses(element)
	for (var i=0;i<classes.length;i++) {
		if (classes.hasOwnProperty(i) && classes[i] == className) {
			return
		}
	}
	classes.push(className)
	DOM.setClasses(element, classes)
},
/**
 * Delete a class from an element
 * @param element Element
 * @param className string
 */
DOM.delClass = function (element, className) {
	var classes = DOM.getClasses(element)
	for (var i=0;i<classes.length;i++) {
		if (classes.hasOwnProperty(i) && classes[i] == className) {
			delete classes[i]
		}
	}
	DOM.setClasses(element, classes)
}
/**
 * Check, if an element has a class
 * @param element Element
 * @param className string
 * @return boolean
 */
DOM.hasClass = function (element, className) {
	var classes = DOM.getClasses(element)
	for (var i=0;i<classes.length;i++) {
		if (classes.hasOwnProperty(i) && classes[i] == className) {
			return true
		}
	}
	return false
}
/**
 * Toggles a class on an element
 * @param element Element
 * @param className string
 */
DOM.toggleClass = function (element, className) {
	if (DOM.hasClass(element, className)) {
		DOM.delClass(element, className)
	} else {
		DOM.addclass(element, className)
	}
}
/**
 * Creates an element with a given tag name
 * @param tagName string
 * @return Element
 */
DOM.createElement = function (tagName) {
	return document.createElement(tagName)
}
/**
 * Returns the element with a given ID optionally starting from a given
 * element.
 * @param id string
 * @return Element
 */
DOM.getElementById = function(id) {
	return document.getElementById(id)
}
/**
 * Returns all elements with a given tag name optionally starting
 * from a given element.
 * @param tagName string
 * @param element Element
 * @return Array
 */
DOM.getElementsByTagName = function (tagName, element) {
	if (!element) {
		element = document
	}
	return element.getElementsByTagName(tagName)
}
/**
 * Returns the first element with a given tag name optionally starting
 * from a given element.
 * @param tagName string
 * @param element Element
 * @return Array
 */
DOM.getFirstElementByTagName = function (tagName, element) {
	if (!element) {
		element = document
	}
	return element.getElementsByTagName(tagName)[0]
},
/**
 * Returns the document html
 * @return Element
 */
DOM.getDocumentHTML = function () {
	return DOM.getFirstElementByTagName("html")
}
/**
 * Returns the document body
 * @return Element
 */
DOM.getDocumentBody = function () {
	return DOM.getFirstElementByTagName("body")
}
/**
 * Returns all elements containing a single class.
 * With optional root element support.
 * @param className string
 * @param element Element
 * @return Array
 */
DOM.getElementsByClassName = function (className, element) {
	if (!element) {
		element = document
	}

	if (document.getElementsByClassName) {
		return element.getElementsByClassName(className)
	} else if (document.evaluate) {
		return document.evaluate(".//*[contains(concat(' ', @class, ' '), ' " + className + " ')]", element, null, 0, null)
	} else {
		var elements = element.all
		var test = new RegExp("(^|\\s)" + className + "(\\s|$)")
		var result = []
		for(var i=0; i<elements.length; i+=1){
			if (test.test(elements[i].className)) {
				result.push(elements[i])
			}
		}
		return result
	}
}
/**
 * HTTP library to perform AJAX requests
 * @param string url
 * @param string method
 * @param mixed data
 */
var HTTPClient = function(url, method, data) {
	if (url) {
		this.url = url
	} else {
		this.url = ''
	}
	if (method) {
		this.method = method
	} else {
		this.method = 'GET'
	}
	if (data) {
		this.data = data
	} else {
		this.data = ''
	}
	this._xhr = null
	this._callbacks = {
		'open': [],
		'headers': [],
		'loading': [],
		'successful': [],
		'error': [],
		'done': []
	}
}
/**
 * HTTPClient prototype
 */
HTTPClient.prototype = {
	/**
	 * @return XMLHttpRequest
	 */
	get xhr() {
		if (!this._xhr) {
			try {
				this._xhr = new XMLHttpRequest()
			} catch (e) {
				throw "No HTTP client implementation available!"
			}
		}
		return this._xhr
	},
	/**
	 * Sets the HTTP method
	 * @param string method
	 * @throws if the method is not valid
	 */
	set method(method) {
		switch (method) {
			case 'GET':
			case 'HEAD':
			case 'POST':
			case 'PUT':
			case 'DELETE':
			case 'OPTIONS':
				this._method = method
				break
			default:
				throw "Invalid HTTP method: " + method
		}
	},
	/**
	 * Returns the HTTP method
	 * @return string
	 */
	get method() {
		return this._method
	},
	/**
	 * Sets the URL to call
	 * @param string url
	 */
	set url(url) {
		this._url = url
	},
	/**
	 * Gets the URL to call
	 * @return string
	 */
	get url() {
		return this._url
	},
	/**
	 * Sets the data to send
	 * @param string data
	 */
	set data(data) {
		this._data = data
	},
	/**
	 * Gets the data that is being sent
	 * @return string
	 */
	get data() {
		return this._data
	},
	/**
	 * Sets the callbacks array
	 * @param array callbacks
	 * @internal
	 */
	set callbacks(callbacks) {
		this._callbacks = callbacks
	},
	/**
	 * Gets the callbacks array
	 * @return array
	 * @internal
	 */
	get callbacks() {
		return this._callbacks
	},
}
/**
 * Returns the function used to process callbacks.
 * @internal
 */
HTTPClient.prototype.getCallbackHandler = function(callback, context) {
	return function () {
		return callback.apply(context)
	}
}
/**
 * Sets most data from a HTML form. Cannot set file upload
 */
HTTPClient.buildFromForm = function(form) {
	var inputs = DOM.getElementsByTagName('input')
	var textareas  = DOM.getElementsByTagName('textarea')
	var element
	var i, j
	var match
	var data = {}
	var value
	for (i in inputs) {
		if (inputs.hasOwnProperty(i)) {
			value = null
			input = inputs[i]
			switch (input.type) {
				case 'checkbox':
				case 'radio':
					if (input.checked) {
						if (!input.value) {
							value = 'on'
						} else {
							value = input.value
						}
					}
					break
				default:
					value = input.value
					break
			}
			if (value) {
				data.push({name:input.name, value:value})
			}
		}
	}
	for (i in textareas) {
		if (textareas.hasOwnProperty(i)) {
			data.push({name:textareas[i].name, value:textareas[i].value})
		}
	}
	var elements = []
	for (i in data) {
		if (data.hasOwnProperty(i)) {
			elements.push(encodeURICompoent(data[i].name) + '=' + encodeURIComponent(data[i].value))
		}
	}
	return elements.join('&')
}
/**
 * Starts the request.
 */
HTTPClient.prototype.send = function() {
	this.xhr.open(this.method, this.url, true)
	this.xhr.onreadystatechange = this.getCallbackHandler(this.callbackHandler, this)
	this.xhr.send(this.data)
}
/**
 * This function adds a callback, which gets called, when the connection is open. May not be called in all browsers.
 */
HTTPClient.prototype.onOpened = function(callback) {
	this.callbacks.open.push(callback)
}
/**
 * This function adds a callback, which gets called, when headers are received. May not be called in all browsers.
 */
HTTPClient.prototype.onHeadersReceived = function(callback) {
	this.callbacks.headers.push(callback)
}
/**
 * This function adds a callback, which gets called, when loading is in progress. May not be called in all browsers.
 */
HTTPClient.prototype.onLoading = function(callback) {
	this.callbacks.loading.push(callback)
}
/**
 * This function adds a callback, which gets called when the request is finished with a success status code
 */
HTTPClient.prototype.onDoneSuccessful = function(callback) {
	this.callbacks.successful.push(callback)
}
/**
 * This function adds a callback, which gets called when the request is finished with an error status code
 */
HTTPClient.prototype.onDoneError = function(callback) {
	this.callbacks.error.push(callback)
}
/**
 * This function adds a callback, which gets called when the request is finished, regardless of it's outcome
 */
HTTPClient.prototype.onDone = function(callback) {
	this.callbacks.done.push(callback)
}
/**
 * This function calls a callback, applying the HTTPClient as context
 */
HTTPClient.prototype.callback = function(func, xhr) {
	for (var i in this.callbacks[func]) {
		if (this.callbacks[func].hasOwnProperty(i)) {
			try {
				this.callbacks[func][i].apply(xhr)
			} catch (err) {}
		}
	}
}
/**
 * This function handles the different type of callbacks
 */
HTTPClient.prototype.callbackHandler = function() {
	switch (this.xhr.readyState) {
		case 1:
			this.callback('open', this)
			break
		case 2:
			this.callback('headers', this)
			break
		case 3:
			this.callback('loading', this)
			break
		case 4:
			var re = /^4|5/
			if (re.test(this.xhr.status)) {
				this.callback('successful', this)
			} else {
				this.callback('error', this)
			}
			this.callback('done', this)
			break
	}
}

/**
 * Initialize a new Ajaxifier.
 * @param function loadHandler will be passed the DOM fragments to insert in an array. The function should accept a
 * second parameter as a callback it should call, when the replacements are finished. Defaults to internal load
 * handler
 */
var Ajaxify = function (loadHandler) {
	if (loadHandler) {
		this.loadHandler = loadHandler
	} else {
		this.loadHandler = this.defaultLoadHandler
	}
	this.init()
}
/**
 * Initialize the Ajaxifier by iterating over all links and forms.
 */
Ajaxify.prototype.init = function () {
	if (!this.isCompatible()) {
		return false
	}
	this.convertLinks()
	this.convertForms()
}
/**
 * This is the default load handler, that simply replaces the elements' innerHTML
 * @param array parts
 * @param function callback
 */
Ajaxify.prototype.defaultLoadHandler = function (parts, callback) {
	for (var i in parts) {
		if (parts.hasOwnProperty(i)) {
			DOM.getElementById(parts[i].id).innerHTML = parts[i].xml.innerHTML
		}
	}
	callback()
}
/**
 * This function determins, if the browser is compatible with Ajaxify
 * @return boolean
 */
Ajaxify.prototype.isCompatible = function () {
	var func = [
		window.addEventListener,
		window.history.pushState,
		[].hasOwnProperty,
		XMLHttpRequest
	]
	for (var i in func) {
		if (func.hasOwnProperty(i) && !func[i]) {
			return false
		}
	}
	return true
}
/**
 * This function returns a bound replaceFinished function
 * @param context ajaxify
 * @internal
 */
Ajaxify.prototype.getReplaceFinished = function(ajaxify) {
	return function() {
		ajaxify.replaceFinished.apply(ajaxify)
	}
}
/**
 * This is the function the callback function must call once it's finished with the replacements.
 */
Ajaxify.prototype.replaceFinished = function() {
	try {
		window.history.pushState({}, DOM.getFirstElementByTagName('title').innerHTML, this.client.url)
		var containers = DOM.getElementsByClassName('ajaxify')
		var replace = []
		for (var i in containers) {
			if (containers.hasOwnProperty(i)) {
				if (containers[i].id) {
					this.convertLinks(containers[i])
					this.convertForms(containers[i])
				}
			}
		}
	} catch (err) { }
}
/**
 * This function is called, once a page is loaded in the background.
 * @param HTTPClient client
 * @internal
 */
Ajaxify.prototype.pageLoaded = function(client) {
	try {
		var xml = client.xhr.responseXML
		var containers = DOM.getElementsByClassName('ajaxify')
		var replace = []
		for (var i in containers) {
			if (containers.hasOwnProperty(i)) {
				if (containers[i].id) {
					replace.push({id:containers[i].id, xml:xml.getElementById(containers[i].id)})
				}
			}
		}
		this.loadHandler(replace, this.getReplaceFinished(this))
	} catch (err) {}
}
/**
 * Returns a bound pageLoaded function
 * @param context ajaxify
 * @param HTTPClient client
 * @return function
 */
Ajaxify.prototype.getPageLoaded = function(ajaxify, client) {
	return function() {
		return ajaxify.pageLoaded.apply(ajaxify, [client])
	}
}
/**
 * Loads a page using the defined callback
 * @param string url
 * @param string method
 * @param string data
 * @todo Add hash fragment handling
 */
Ajaxify.prototype.loadPage = function(url, method, data) {
	if (method == 'GET' && data) {
		if (url.indexOf('?' != -1)) {
			url += '&' + data
		} else {
			url += '?' + data
		}
		data = ''
	}
	this.client = new HTTPClient(url, method, data)
	this.client.xhr.overrideMimeType('text/xml')
	this.client.onDone(this.getPageLoaded(this, this.client))
	this.client.send()
}
/**
 * Returns a bound link handler
 * @param context ajaxify
 * @param Element form
 * @return function
 * @internal
 */
Ajaxify.prototype.getLinkHandler = function (ajaxify, link) {
	return function (e) {
		if (!e) {
			e = window.event
		}
		try {
			ajaxify.loadPage.apply(ajaxify, [link.href, 'GET'])
				
			e.cancelBubble = true
			if (e.stopPropagation) {
				e.stopPropagation()
			}			
			if (e.preventDefault) {
				e.preventDefault()
			}			
		} catch(err) {}
	}
}
/**
 * This function adds event listeners to link onclick events.
 * @param Element root optional root to start from
 */
Ajaxify.prototype.convertLinks = function (root) {
	if (!root) {
		root = document
	}
	var links = DOM.getElementsByTagName('a')
	var domainpart = document.location.protocol + '//' + document.location.hostname + '/'
	for (var i in links) {
		if (links.hasOwnProperty(i)) {
			if (links[i].href &&
				links[i].href.substring(0, domainpart.length) == domainpart &&
				!DOM.hasClass(links[i], 'noajaxify')) {
				links[i].addEventListener('click', this.getLinkHandler(this, links[i]), false)
			}
		}
	}
}
/**
 * Returns a bound form handler
 * @param context ajaxify
 * @param Element form
 * @return function
 * @internal
 */
Ajaxify.prototype.getFormHandler = function (ajaxify, form) {
	return function (e) {
		if (!e) {
			e = window.event
		}
		try {
			ajaxify.loadPage.apply(ajaxify, [form.action, form.method, HTTPClient.buildFromForm(form)])
				
			e.cancelBubble = true
			if (e.stopPropagation) {
				e.stopPropagation()
			}			
			if (e.preventDefault) {
				e.preventDefault()
			}			
		} catch(err) {}
	}
}
/**
 * This function adds event listeners to form onsubmit events.
 * @param Element root optional root to start from
 */
Ajaxify.prototype.convertForms = function (root) {
	if (!root) {
		root = document
	}
	var forms = DOM.getElementsByTagName('form', root)
	var domainpart = document.location.protocol + '//' + document.location.hostname + '/'
	for (var i in forms) {
		if (forms.hasOwnProperty(i)) {
			if (forms[i].action &&
				forms[i].action.substring(0, domainpart.length) == domainpart &&
				!DOM.hasClass(forms[i], 'noajaxify')) {
				forms[i].addEventListener('submit', this.getFormHandler(this, forms[i]), false)
			}
		}
	}
}
