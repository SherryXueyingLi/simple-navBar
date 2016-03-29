if (typeof jQuery === 'undefined') {
  throw new Error('simple-navBar requires jQuery')
}
(function($){
    if($.fn.navBar !== undefined){
	return;
    }
    //var options, tabs, onClick, active, onActiveChange, afterActiveChanged; 
    var tabObject = function(name, title, parent, path, viewPath, href){
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
	    },'title':{
		value: title || name
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
	    }
	});
	
	
    };
    /**
     * Construct the tabs from JSON structure to tabObject
     */
    var processTab = function(tabArray, parent){
	var tabs = [];
	for(var i in tabArray){
	    var tab = new tabObject(tabArray[i].name, tabArray[i].label, parent, tabArray[i].path, tabArray[i].view);
	    tabs.push(tab);
	    if(tabArray[i].sub && tabArray[i].sub.length>0){
		var subs = processTab(tabArray[i].sub, tab);
		tab.addChild(subs);
	    }
	}
	return tabs;
    };
    
    var findActive = function(tabs){
	if(!tabs) return;
	for(var i in tabs){
	    if($(tabs[i].span).parent().hasClass("active")){
		return findActive(tabs[i].children) || tabs[i];
	    }
	}
	return;
    }
    
    var navBar = function(options){
	var self = this, tabs, active, opt = options;
	var $element = $(options.element);
	try{
	    checkOption(options);
	    this.active = null;
	}catch(e){
	    console.debug(e); 
	}
	Object.defineProperties(this, {'options':{
	    get: function(){ return opt;}
	},'tabs':{
	    get: function(){ return tabs;}
	},'active':{
	    get: function(){
		return findActive(this.tabs);
	    },
	}
	});
	self.init = function(){
	    tabs = processTab(this.options.tabs, null);
	    buildContext.call(this);
	    if(this.options.active){
		active = findTab.call(this, this.options.active);
	    }
	    if(!active){
		active = this.tabs[0];
		while(active.children.length>0){
		    active = active.children[0];
		}
	    }
	    self.setActive(active);
	    $element.data["navBar"] = self;
	}
    };
    
    var buildContext = function(){
	$(this.options.element).empty();
	buildUl.call(this, $(this.options.element), this.tabs, "firstLevel", "firstLevelLi");
    };
    
    var buildSecondLevelUl = function($li, tabs){
	return buildUl.call(this, $li, tabs, "secondLevel", "secondLevelLi");
    };
    
    var buildUl = function($element, tabs, ulClass, liClass){
	var ul = document.createElement("ul");
	$(ul).addClass(ulClass+" navUl");
	if(tabs[0] && tabs[0].parent){
	    $(ul).addClass(tabs[0].parent.code);
	}
	for(var i in tabs){
	    var li = document.createElement("li");
	    buildLi.call(this, $(ul), $(li), tabs[i], $element);
	    $(li).addClass(liClass+" navBar");
	    $(li).appendTo(ul);
	}
	$(ul).appendTo($element);
	return $(ul);
    }
    
    var buildLi = function($ul, $li, tab, $element){
	var span = document.createElement("a"), self=this;
	$(span).text(tab.title);
	$(span).click(function(){
	    stateClickCallback.call(self, $element, this, tab);
	});
	/*$(span).hover(function(){
	    $(this).css( 'cursor', 'pointer' );
	});*/
	if(this.options.route)
	    $(span).attr("href","#"+tab.href);
	$(span).appendTo($li);
	tab.span = span;
	if(tab.children.length>0){
	    var ul = buildSecondLevelUl.call(self, $li, tab.children);
	}
    };
    
    var stateClickCallback = function($element, $span, tab){
	this.setActive(tab, $element);
	this.options.onClick.call(this, tab, $span, $element);
    };
    
    navBar.prototype.setActive = function(tab, element){
	if(!tab){
	    throw ReferenceError("Active tab is required", "simple-navBar.js");
	}
	onActiveChange(this.active, tab);
	if(tab.children.length>0){
	    $(tab.span).siblings("ul").toggle();
	    return;
	}
	$(this.options.element).find(".navBar").removeClass("active");
	$(tab.span).parent().addClass("active")
	if(tab.parent && this.options.autoClose){
	    $(this.options.element).find("."+tab.parent.code).hide(100);
	}
	var curr = tab;
	while(curr.parent){
	    $(curr.parent.span).parent().addClass("active");
	    curr = curr.parent;
	}
	afterActiveChanged(tab);
    };

    var checkOption = function(options){
	if(!options.tabs){
	    throw ReferenceError("Config.tabs is required", "simple-navBar.js");
	}
	return checkTabs(options.tabs);
    };
    /**To check the required field, the 'name' must exist and unique in it's level  **/
    var checkTabs = function(tabs){
	var nameCache = [];
	for(var i in tabs){
	    if(!(tabs[i].name)){
		throw ReferenceError("tab.name is required", "simple-navBar.js");
	    }else if(nameCache.indexOf(tabs[i].name)>=0){
		throw ReferenceError("tab.name ["+tabs[i].name+"]is duplicated", "simple-navBar.js");
	    }else{
		nameCache.push(tabs[i].name);
	    }
	    if(tabs[i].sub){
		checkTabs(tabs[i].sub);
	    }
	}
    };
    var empty = function(){};
    
    navBar.prototype.findbyName = function(name){
	var seq = name.split(".");
	return findTab.call(this, seq, 0 , this.tabs);
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
    var legalFunctions = {};
    Object.defineProperties(legalFunctions, {
	'get':{
	    value: getProcessor,
	},'active':{
	    value: activeProcessor,
	},'set':{
	    //value: setProcessor,
	},'add':{
	    
	}, 'remove':{
	    
	}
    });
    var defaultOption = {
	onClick: empty,
	onActiveChange: empty,
	afterActiveChanged: empty,
	autoClose: true,
	route: true,
    };
    $.fn.navBar = function(){
	var bar = this, navbar;
	if(arguments.length === 1 && (typeof arguments[0]==='object'||arguments[0] === 'refresh')){
	    var options = $.extend({element : $(this)}, defaultOption, arguments[0]);
	    onActiveChange = options.onActiveChange; 
	    afterActiveChanged = options.afterActiveChanged;
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
	return navbar;
    };
    
    
}(jQuery));
