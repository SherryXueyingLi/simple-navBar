if (typeof jQuery === 'undefined') {
  throw new Error('simple-navBar requires jQuery')
}
(function($){
	if($.fn.navBar !== undefined){
		return;
	}
	//var options, tabs, onClick, active, onActiveChange, afterActiveChanged; 
	var tabObject = function(name, label, parent, path, viewPath, href){
	var  children = [];
	var addChild = function(child){
		if(child instanceof tabObject){
		children.push(child);
		}else if(Array.isArray(child)){
		child.forEach(function(value){
			addChild(value);
		});
		}
	};
	Object.defineProperties(this,{
		'name':{
		value: name,
		},'label':{
		value: label || name
		},'parent':{
		value:parent
		},'controllerPath':{
		get: function(){
			return path || this.code.split("-").join("/")+"/controller";
		}
		}, 'url':{
		get: function(){
			return this.code.split("-").join("/")
		}
		},'children':{
		get: function(){
			return children;
		}
		},'code':{
		get: function() {
			var state = name, up = parent;
			while(up){
				state = up.name+'-'+state;
				up = up.parent;
			}
			return state;
			}
		},'state':{
		get: function(){
			return this.code.split("-").join(".")
		}
		},'viewPath':{
		get: function() {
			return view || this.code.split("-").join("/")+"/view";
		}
		},'addChild':{
		value: addChild
		},'href':{
		get: function() {
			return href || this.code;
		}
		},
	});
	
	
	};
	/**
	 * Construct the tabs from JSON structure to tabObject
	 */
	var processTab = function(tabArray, parent){
	var tabs = [];
	for(var i in tabArray){
		var tab = new tabObject(tabArray[i].name, tabArray[i].label, parent, tabArray[i].path, tabArray[i].view, tabArray[i].href);
		tabs.push(tab);
		if(tabArray[i].sub && tabArray[i].sub.length>0){
		var subs = processTab(tabArray[i].sub, tab);
		tab.addChild(subs);
		}
	}
	return tabs;
	};
	
	var currentLevel = 0;
	var buildContext = function(){
	currentLevel = 0;
	$(this.options.element).children("ul.navUl").detach();
	var ul = buildUl.call(this,  this.tabs).appendTo($(this.options.element));
	ul.css("")
	};
	
	var buildUl = function(tabs){
	var ul = document.createElement("ul");
	ul.classList.add("navBar_"+currentLevel, "navUl");
	for(var i in tabs){
		createLi.call(this, tabs[i]).appendTo($(ul));
	}
	this.options.autoClose && tabs[0].parent &&ul.classList.add("autoClose");
	return $(ul);
	}
	
	var createLi = function(tab){
		var li = document.createElement("li");
		li.classList.add("navBarli_"+currentLevel, "navBar");
		li.setAttribute("navCode", tab.code);
		var span = document.createElement("a"), self=this;
		$(span).appendTo($(li));
		span.text=tab.label;
		this.options.route && span.setAttribute("href","#"+tab.href);
		span.onclick = function($event){
			stateClickCallback.call(self, $event, tab);
		};
		if(tab.children.length>0){
			this.options.arrow && $(span).append($(arrowDownElement()));
			currentLevel++;
			buildUl.call(this, tab.children).appendTo($(li));
			currentLevel--;
		}
		return $(li);
	};
	
	var arrowDownElement = function(){
		var div = document.createElement("div");
		div.classList.add("arrowDown"); 
		return div;
	};
	var stateClickCallback = function($event, tab){
		this.setActive(tab);
		this.options.onClick.call(this, $event, tab);
	};
	
	var findActive = function(tabs){
		if(!tabs) return;
		for(var i in tabs){
			if(this.findLi(tabs[i]).hasClass("active")){
				return findActive.call(this, tabs[i].children) || tabs[i];
			}
		}
		return;
	}
	
	var navBar = function(options){
		var self = this, tabs, active, opt = options;
		var $element = $(options.element);
	
		Object.defineProperties(this, {'options':{
			get: function(){ return opt;}
		},'tabs':{
			get: function(){ return tabs;}
		},'active':{
			get: function(){
				return findActive.call(this, this.tabs);
			},
		}
	});
	self.init = function(){
		try{
			checkOption(this.options);
			tabs = processTab(this.options.tabs, null);
			this.buildContext();
			this.active = null;
			if(this.options.active){
				active = findTab.call(this, this.options.active);
			}
			if(!active){
				active = this.tabs[0];
				while(active.children.length>0){
				active = active.children[0];
			}
			}
			this.setActive(active);
			this.options.horizon? $element.children().css("display","inline-block"):$element.children().css("display","block");
			$element.data["navBar"] = this;//set element data attribute
		}catch(e){
			console.debug(e); 
		}
		if(this.options.pin) {
			$element.css("position", "fixed");
			$element.css("top", $element.parent().offset().top);
			$element.css("left", $element.parent().offset().left);
		}
	}
	};
	
	navBar.prototype.buildContext = function(){
		buildContext.call(this);
	};
	
	navBar.prototype.findLi = function(tab){
		return $(this.options.element).find("li[navCode='"+tab.code+"']");
	};
	
	navBar.prototype.findConfigTab = function(name){
		return name && findConfig.call(this, this.options.tabs, name.split("."), 0);
	};
	var findConfig = function(tabs, name, level){
		if(level >= name.length || !tabs) return;
		for(var i=0; i<tabs.length; i++){
			if(tabs[i].name === name[level]){
				if(level === name.length-1) return tabs[i];
				return findConfig(tabs.sub, name, level+1);
			}else{
				var subs = findConfig(tabs.sub, name, level);
				if(subs){
					return subs;
				}
			} 
		}
		return;
	};
	navBar.prototype.setActive = function(tab){
		if(!tab){
			throw ReferenceError("Active tab is required", "simple-navBar.js");
		}
		this.options.onActiveChange.call(this.active, tab);
		var li = this.findLi(tab);
		if(tab.children.length>0){
			li.children("ul").slideToggle(100);
			return;
		}
		$(this.options.element).find(".navBar").removeClass("active");
		li.addClass("active")
		tab.parent && this.options.autoClose && li.parent("ul").hide(100);
		var curr = tab.parent;
		while(curr){
			this.findLi(curr).addClass("active");
			curr = curr.parent;
		}
		this.options.afterActiveChanged.call(this, tab);
	};

	var checkOption = function(options){
		if(!options.tabs){
			throw ReferenceError("Config.tabs is required", "simple-navBar.js");
		}
		options.tabs = checkTabs(options.tabs);
	};
	/**To check the required field, the 'name' must exist and unique in it's level  **/
	var checkTabs = function(tabs){
	var nameCache = [];
	var legaled = [];
	for(var i in tabs){
		if(!(tabs[i].name)){
			throw ReferenceError("tab.name is required", "simple-navBar.js");
		}else if(nameCache.indexOf(tabs[i].name)>=0){
			console.warn("tab.name ["+tabs[i].name+"]is duplicated, second one will be ignored");
		}else{
			var legal = $.extend({}, tabs[i]);
			nameCache.push(tabs[i].name);
		if(tabs[i].sub){
			legal.sub = checkTabs(tabs[i].sub);
		}
			legaled.push(legal);
		}
		
	}
	return legaled;
	};
	var empty = function(){};
	
	navBar.prototype.findbyName = function(name){
		return !!(name) && findTab.call(this, name.split("."), 0 , this.tabs);
	};
	
	var findTab = function(name, level, tabArray){
		if(level >= name.length || !tabArray) return;
		for(var i=0; i<tabArray.length; i++){
			if(tabArray[i].name === name[level]){
				if(level === name.length-1) return tabArray[i];
				return findTab(name, level+1, tabArray.children);
			}else{
				var subs = findTab(name, level, tabArray.children);
				if(subs){
					return subs;
				}
			}
			
		}
		return;
	};
	
	var getProcessor = function(){
		// by default, it will return the active tabObject.
		if(arguments.length === 1){
			return this.active;
		}
		return findbyName(arguments[1]);
	};
	var activeProcessor = function(){
		if(arguments.length===1){
			return this.active;
		}else{
			try{
			this.setActive(this.findbyName(arguments[1]));
			}catch(e){
			throw ReferenceError("Set Active failed. Cannot find tab by given name "+arguments[1], "simple-navBar.js");
			}
		}
	};
	
	var addProcessor = function(){
		var tabs;
		Array.isArray(arguments[1]) ? tabs=arguments[1] : tabs=[arguments[1]];
		parent = this.findConfigTab(arguments[2]);
		if(parent){
			parent.sub = parent.sub || [];
			parent.sub.push.apply(parent.sub, tabs);
		}else{
			this.options.tabs.push.apply(this.options.tabs, tabs);
		}
		this.init();
	};
	
	var removeByName = function(tabs, names, predix){
		return tabs.filter(function(tab){
			var tarname = predix?predix+"."+tab.name:tab.name;
			if(names.indexOf(tarname)>=0){
				return false;
			}
			if(tab.sub){
				tab.sub = removeByName(tab.sub, names, tab.name);
			}
			return true;
		});
	}
	var removeProcessor = function(){
		var names;
		Array.isArray(arguments[1]) ? names=arguments[1] : names=[arguments[1]];
		this.options.tabs = removeByName(this.options.tabs, names);
		this.init();
	};
	
	
	var legalFunctions = {};
	Object.defineProperties(legalFunctions, {
		'get':{
			value: getProcessor,
		},'active':{
			value: activeProcessor,
		},'set':{
			//value: setProcessor,
		},'add':{
			value: addProcessor,
		}, 'remove':{
			value: removeProcessor,
		}
	});
	var defaultOption = {
		onClick: empty,
		onActiveChange: empty,
		afterActiveChanged: empty,
		autoClose: true,
		route: true,
		arrow: true,
		pin: true,
		horizon: true,
		tabs: []
	};
	$.fn.navBar = function(){
		var bar = this, navbar;
		if(arguments.length === 0 || (typeof arguments[0]==='object'||arguments[0] === 'refresh')){
			var options = $.extend({element : $(this)}, defaultOption, arguments[0]);
			$(this).addClass(options.style);
			navbar = new navBar(options);
			navbar.init();
			$(this).data('navBar', navbar);
			return navbar;
		}else {
			navbar = $(this).data('navBar');
		}
		if(arguments.length === 0){
			return navbar;
		}else if(arguments.length>=1){
			try{
			return legalFunctions[arguments[0]] && legalFunctions[arguments[0]].apply(navbar, arguments);
			}catch(e){
			console.log(e);
			}
			
		}
		return $(this);
	};
	
	
}(jQuery));
