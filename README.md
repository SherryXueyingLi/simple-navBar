## Prepare

Import the simple-navBar.js, and stylsheets/navBar-menu.css

	<script src="simple-navBar.js"></script>
	<link rel="stylesheet" type="text/css" href="stylesheets/navBar-menu.css"></link>

Init the navBar by following:


	$(element).navBar({options});


The simple-navBar could support two style of navigation bars, horizontal and vertical, check on the demo [here](http://sherryxueyingli.github.io/simple-navBar/);

##Options
all options are not mandatory, but I suggest at least set the tabs. otherwise you will get a empty navBar.

Note: value inside a bracket is the default value.

**Tabs**
Tabs([]): should be an array, the attribute 'name' is required, others are optional. 
	A full structure of one tab object is:
 * name: used for identify the tab;
 * label: the text shown on menu, if not set, will be same with name.
 * path: a folder path, if you are using angular.js, it will be useful.
 * viewPath: a folder path, if you are using angular.js, it will be useful.
 * href: used to set the 'href' of the element<a>, if not set, same with name, if in second level, it will be parent's name +'-'+name.
 * sub: should be an array, to save sub tabs if current tab, sub tab's structure same the Tabs.

Example: 

	var defaultMenu = [
	{name : "document",label : "Documents",sub : [ {name : "start",label : "Quick Start"}, 
			{name : "config",label : "Configure",href: "myconfigure"}, 
			{name : "api",label : "APIs"}]},
	{name : "download",label : "Download"} ];`

**Call backs**

* onClick(function), will be called when a tab is click, parameters are event, and the tab Object.


**Others**
* element(undefined): Could be an Element object or a string which is the id of the element. If not set or the cannot find the element, will create a div DOM with specified id. If not set.
* autoClose(true): if a sub tab will close after one is clicked. 
* arrow(true): If show the arrow when there's sub tabs.
* pin(true): If pin the navBar in screen. The position will be depend on it's parent DOM's position.
* horizon(true): To show the navBar in horizon or vertical

##Functions

It could support add, remove, query, set active, and ..etc, check on the descriptions and demo [here](http://sherryxueyingli.github.io/simple-navBar/);

## FYI
css can be replaced anyway.


