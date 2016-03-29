if (typeof jQuery === 'undefined') {
  throw new Error('simple-navBar requires jQuery')
}
(function($){
    if($.fn.navBar !== undefined){
	return;
    }
    var options, tabs, onClick, active, onActiveChange, afterActiveChanged; 
    var tabObject = function(name, title, parent, path, view){
	var  children = [];
	Object.defineProperties(this,{
	    'name':{
		value: name,
	    },
	    'title':{
		value: title || name
	    },
	    'parent':{
		value:parent
	    },
	    'controllerPath':{
		get: function(){
		    return path || this.state.split("-").join("/")+"/controller";
		}
	    },
	    'url':{
		get: function(){
		    return this.state.split("-").join("/")
		}
	    },
	    'children':{
		get: function(){
		    return children;
		}
	    },
	    'state':{
		get: function() {
			var state = name;
			var up = parent;
			while(up){
			    state = up.name+'-'+state;
			    up = up.parent;
			}
			return state;
		    }
	    },
	    'view':{
		get: function() {
			return view || this.state.split("-").join("/")+"/view.html";
		}
	    }
	});
	
	var addChild = function(child){
	    if(child instanceof tabObject){
		children.push(child);
	    }else if(Array.isArray(child)){
		child.forEach(function(value){
		    addChild(value);
		});
	    }
	};
	this.addChild = addChild;
    };
    /**
     * Construct the tabs from JSON structure to tabObject
     */
    var processTab = function(tabArray, parent){
	var tabs = [];
	for(var i in tabArray){
	    var tab = new tabObject(tabArray[i].name, tabArray[i].label, parent, tabArray[i].path);
	    tabs.push(tab);
	    if(tabArray[i].sub && tabArray[i].sub.length>0){
		var subs = processTab(tabArray[i].sub, tab);
		tab.addChild(subs);
	    }
	}
	return tabs;
    };
    
    var navBar = function(){
	var $element = options.element;
	try{
	    checkOption(options);
	    tabs = processTab(options.tabs, null);
	    if(options.onClick) onClick = options.onClick;
	    buildContext(options.element, tabs);
	    active = null;
	    if(options.active){
		active = findTab(options.active);
	    }
	    if(!active){
		active = tabs[0];
		while(active.children.length>0){
		    active = active.children[0];
		}
	    }
	    setActive(active);
	    
	}catch(e){
	    console.debug(e); 
	}
    };
    
    
    
    var buildContext = function(element, tabs){
	$(element).empty();
	buildUl($(element), tabs, "firstLevel", "firstLevelLi");
    };
    
    var buildSecondLevelUl = function($li, tabs){
	return buildUl($li, tabs, "secondLevel", "secondLevelLi");
    };
    
    var buildUl = function($element, tabs, ulClass, liClass){
	var ul = document.createElement("ul");
	$(ul).addClass(ulClass+" navUl");
	if(tabs[0] && tabs[0].parent){
	    $(ul).addClass(tabs[0].parent.state);
	}
	for(var i in tabs){
	    var li = document.createElement("li");
	    buildLi($(ul), $(li), tabs[i]);
	    $(li).addClass(liClass+" navBar");
	    $(li).appendTo(ul);
	}
	$(ul).appendTo($element);
	return $(ul);
    }
    
    var buildLi = function($ul, $li, tab){
	var span = document.createElement("span");
	$(span).text(tab.title);
	$(span).attr("id", tab.state);
	$(span).click(function(){
	    stateClickCallback(tab);
	});
	$(span).appendTo($li);
	if(tab.children.length>0){
	    var ul = buildSecondLevelUl($li, tab.children);
	}
    };
    
    var stateClickCallback = function(tab){
	setActive(tab);
	onClick(tab);
    }
    
    var setActive = function(tab){
	onActiveChange(active, tab);
	active = tab;
	if(tab.children.length>0){
	    $("."+tab.state).toggle();
	    return;
	}
	$(".navBar").removeClass("active");
	$("#"+tab.state).parent().addClass("active");
	if(tab.parent){
	    $("."+tab.parent.state).hide();
	}
	var curr = tab;
	while(curr.parent){
	    $("#"+curr.parent.state).parent().addClass("active");
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
    
    var checkTabs = function(tabs){
	for(var i in tabs){
	    if(!(tabs[i].name)){
		throw ReferenceError("tab.name is required", "simple-navBar.js");
	    }
	    if(tabs[i].sub){
		checkTabs(tabs[i].sub);
	    }
	}
    };
    
    var defaultOption = {
	onClick: function(){},
	onActiveChange: function(){},
	afterActiveChanged: function(){},
    };
    
    
    var findTab = function(name, tab){
	tab = tab|| tabs;
	for(var i in tab){
	    if(tab[i].name === name){
		return tab[i];
	    }
	    if(tab[i].children.length>0){
		var sub = findTab(name, tab[i].children); 
		if(sub) return sub;
	    }
	}
	return;
    };
    
    $.fn.navBar = function(){
	var bar = this;
	if(arguments.length === 1 && typeof arguments[0]==='object'){
	    options = $.extend({element : $(this)}, defaultOption, arguments[0]);
	    onActiveChange = options.onActiveChange; 
	    afterActiveChanged = options.afterActiveChanged;
	    $(this).addClass("navDiv");
	    new navBar();
	}else if(arguments.length === 0){
	    return tabs; // return list of tabObjects
	}else if(arguments.length>=1 && arguments[0] === 'get'){
	    if(arguments.length === 1){
		return active;
	    }
	    return findTab(arguments[1]);
	}else if(arguments.length>=1 && arguments[0] === 'active'){
	    if(arguments.length===1){
		return active;
	    }else{
		 setActive(findTab(arguments[1]));
	    }
	}else if(arguments.length>=1 && arguments[0] === 'set'){
	    
	}else if(arguments.length>=1 && arguments[0] === 'refresh'){
	    new navBar();
	}
    };
    
    
}(jQuery));
