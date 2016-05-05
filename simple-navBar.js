(function(global){
	var tabObject = function(name, label, parent, path, viewPath, href, icon){
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
		},'icon':{
			value: icon
		},'href':{
			get: function() {
				if(href && (href.indexOf("#") === 0 ||  href.indexOf("/") >=0)) return href;
				else if(href) return "#"+href;
				else return "#"+this.code;
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
		var children=this.options.element.children;
		for(var i in children){
			if(children[i].tagName === "UL" && children[i].classList.contains("navUl")){
				this.options.element.removeChild(children[i]);
			}
		}
		var ul = buildUl.call(this,  this.tabs);
		this.options.element.appendChild(ul);
		return ul;
	};
	var buildUl = function(tabs){
		var ul = document.createElement("ul");
		ul.classList.add("navBar_"+currentLevel, "navUl");
		for(var i in tabs){
			tabs[i].span = createLi.call(this, tabs[i]);
			ul.appendChild(tabs[i].span);
		}
		(!(this.options.horizon) || currentLevel>0) && (ul.style.overflowY="hidden");
		this.options.autoClose && tabs[0].parent &&ul.classList.add("autoClose");
		(currentLevel >=1 && this.options.closed) && (ul.style.display='none');
		return ul;
	}
	
	var createLi = function(tab){
		var li = document.createElement("li");
		li.classList.add("navBarli_"+currentLevel, "navBar");
		li.setAttribute("navCode", tab.code);
		var span = document.createElement("a"), self=this;
		li.appendChild(span);
		span.text=tab.label;
		this.options.route && (tab.children.length===0)  && span.setAttribute("href", tab.href);
		span.onclick = function($event){
			stateClickCallback.call(self, $event, tab);
		};
		if(this.options.center){
			var liw = li.style.width;
			var spanw = span.style.width;
			li.setAttribute("align", "center");
		}
		if(tab.children.length>0){
			this.options.arrow && span.appendChild(arrowDownElement());
			currentLevel++;
			li.appendChild(buildUl.call(this, tab.children));
			currentLevel--;
		}
		return li;
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
			if(this.findLi(tabs[i]).classList.contains("active")){
				return findActive.call(this, tabs[i].children) || tabs[i];
			}
		}
		return;
	};
	var findLi = function(tab){
		var lis = this.options.element.getElementsByTagName("li");
		for(var i in lis){
			if(lis[i].getAttribute("navCode") === tab.code){
				return lis[i]
			}
		}
	};
	
	var findConfigTab = function(name){
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
	
	var findOffset =function (element){
		var top = 0, left = 0, start = element;
		var actualTop = element.offsetTop;
		var current = element.parentElement;
		while (current !== null){
			left += current.offsetLeft;
			top += current.offsetTop;
			current = current.offsetParent;
		}
		return {top: top, left: left};
	};

	var slideToggle = function(element){
		if(element.style.display === 'none'){
			slideDown(element);
		}else{
			slideUp(element);
		}
	};
	
	var slideDown = function(element){
		element.style.height="0px";
		element.style.display="block";
		setTimeout(function(){
			element.style.height=element.scrollHeight+"px";
			element.style.overflow="";
		}, 180);
		
		element.animate([{height: '0px'},{height: element.scrollHeight+"px"}], 200);
		
	};
	
	var  slideUp = function(element){
		element.style.overflow="hidden";
		setTimeout(function(){
			element.style.display = 'none';
		}, 180);
		element.animate([{height: element.scrollHeight+"px"},{height: '0px'}], 200);
		
	};
	
	var closeAll = function(){
		var lis = this.options.element.getElementsByTagName("li");
		for(var i=0; i<lis.length; i++){
			uls = lis[i].getElementsByTagName("ul");
			for(var j=0; j<uls.length; j++){
				uls[j].style.display="none";
			}
		}
		if(this.options.type ==='float' && this.options.element.style.left!==window.innerWidth+"px"){
			toggleMenu.call(this, this.handbar);
		}
	};

	var setActive = function(tab){
		if(!tab){
			throw ReferenceError("Active tab is required", "simple-navBar.js");
		}
		this.options.onActiveChange.call(this.active, tab);
		var li = this.findLi(tab);
		if(tab.children.length>0){
			//li.children("ul").slideToggle(100);
			var lis = this.options.element.getElementsByTagName("li");
			for(var i=0; i<lis.length; i++){
				if(lis[i]!=li && lis[i].getElementsByTagName("ul").length>0){
					slideUp(lis[i].getElementsByTagName("ul")[0]);
				}
			}
			slideToggle(li.getElementsByTagName("ul")[0]);
			return;
		}
		var activeli = this.options.element.getElementsByTagName("li");
		for(var i=0; i<activeli.length; i++){
			activeli[i].classList.remove("active");
		}
		li.classList.add("active");
		tab.parent && this.options.autoClose && slideUp(li.parentElement);
		this.options.autoClose&&closeAll.call(this);
		var curr = tab.parent;
		while(curr){
			this.findLi(curr).classList.add("active");
			curr = curr.parent;
		}
		this.options.afterActiveChanged.call(this, tab);
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
	
	var createRow = function(color){
		var div = document.createElement("div");
		div.style.position="relative";
		var top=0;
		for(var i=0; i<4; i++){
			var a = document.createElement("div");
			a.style.borderTop="solid 3px #939698";
			a.style.position = "absolute";
			a.style.width = "15px";
			a.style.left = "0px";
			a.style.display = "inline-block";
			a.style.top = top+"px";
			if(i!=1) top=top+5;
			div.appendChild(a);
		}
		div.style.height="15px";
		div.style.width="15px";
		div.style.margin="0px";
		return div;
	};
	
	var toggleMenu = function(div){
		var element = this.options.element;
		if(element.style.left===window.innerWidth+"px"){
			slideLeft(element, div);
			toCross(div.children[0]);
		}else{
			slideRight(element, div);
			toRows(div.children[0]);
		}
	};
	
	var toCross = function(div){
		div.children[1].style.WebkitTransform="rotate(45deg)";
		div.children[0].style.opacity="0";
		div.children[3].style.opacity="0";
		div.children[2].style.WebkitTransform="rotate(-45deg)";
		div.children[1].animate([{WebkitTransform: 'rotate(0deg)'},{WebkitTransform: 'rotate(45deg)'}], 200);
		div.children[0].animate([{opacity: '1'},{opacity: '0'}], 200);
		div.children[3].animate([{opacity: '1'},{opacity: '0'}], 200);
		div.children[2].animate([{WebkitTransform: 'rotate(0deg)'},{WebkitTransform: 'rotate(-45deg)'}], 200);
	};
	
	var toRows = function(div){
		div.children[1].animate([{WebkitTransform: 'rotate(45deg)'},{WebkitTransform: 'rotate(0deg)'}], 200);
		div.children[0].animate([{opacity: '0'},{opacity: '1'}], 200);
		div.children[3].animate([{opacity: '0'},{opacity: '1'}], 200);
		div.children[2].animate([{WebkitTransform: 'rotate(-45deg)'},{WebkitTransform: 'rotate(0deg)'}], 200);
		div.children[1].style.WebkitTransform=null;
		div.children[0].style.opacity="1";
		div.children[3].style.opacity="1";
		div.children[2].style.WebkitTransform=null;
	};
	
	var  slideLeft = function(element){
		var originalleft = element.style.left;
		element.style.left=window.innerWidth+"px";
		element.style.display="block";
		element.style.left=window.innerWidth;
		var pos = 0;
		var id = setInterval(frame, 1);
		function frame() {
			if (pos === element.scrollWidth) {
				clearInterval(id);
			} else {
				pos = pos+3<=element.scrollWidth?pos+3:element.scrollWidth; 
				element.style.left = window.innerWidth - pos + 'px';
			}
		}
	};
	
	var  slideRight = function(element){
		var originalleft = element.style.left;
		element.style.overflow="hidden";
		var pos = +element.style.left.substr(0, element.style.left.length-2);
		var id = setInterval(frame, 1);
		function frame() {
			if (pos === window.innerWidth) {
				clearInterval(id);
			} else {
				pos=pos+3<=window.innerWidth?pos+3:window.innerWidth; 
				element.style.left = pos + 'px';
			}
		}
	}
	
	var creatBar = function(){
		var div = document.createElement("div");
		div.align="center";
		div.style.cursor="pointer";
		div.style.width="20px";
		div.style.padding="5px";
		div.style.position = "fixed";
		div.style.backgroundColor = "#EDEDF1";
		div.style.zIndex = "999";
		div.style.left = window.innerWidth-100 +"px";
		div.style.top = window.innerHeight-100 +"px";
		div.appendChild(createRow("#939698"));
		div.onclick = toggleMenu.bind(this, div);
		return div;
	};
	
	var navBar = function(options){
		var self = this, tabs, active, opt = options;
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
				var ul = this.buildContext();
				if(this.options.type === 'float'){
					this.handbar = creatBar.call(this);
					document.body.appendChild(this.handbar);
					this.options.element.style.left=window.innerWidth+"px";
				}
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
				var disStyle = "block"; 
				this.options.horizon && (disStyle="inline-block"); 
				var lis = this.options.element.children;
				for(var i=0; i<lis.length; i++){
					if(lis[i].tagName.toLowerCase() === "li" && lis[i].classList.contains("navBar")){
						lis[i].style.display=disStyle;
					}
				}
				this.options.element.classList.add(this.options.theme);
				$(this.options.element).data["navBar"] = this;//set element data attribute
			}catch(e){
				console.debug(e); 
			}
			if(this.options.pin) {
				this.options.element.style.position = "fixed";
				var offset = findOffset(this.options.element)
				this.options.element.style.top = offset.top+"px";
				this.options.type !== 'float' && (this.options.element.style.left = offset.left+"px");
				this.options.element.style.width="inherit";
			}
		}
	};

	navBar.prototype ={
		'buildContext' : buildContext,
		'findLi': findLi,
		'findConfigTab': findConfigTab,
		'setActive' : setActive,
		'findbyName' : function(name){
			return !!(name) && findTab.call(this, name.split("."), 0 , this.tabs);
		},
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
			var legal = JSON.parse(JSON.stringify(tabs[i]));
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

	var defaultOption = {
		onClick: empty,
		onActiveChange: empty,
		afterActiveChanged: empty,
		route: true,
		tabs: [],
		element: undefined,
		navTarget: undefined,
		type: 'nav'||'side'||'float'
	};
	
	var legalType = ['nav','side','float'];
	
	var typeDefault = {
		'nav': {
			horizon: true,
			pin: true,
			theme: 'navbar',
			closed: true,
			mutex: true,
			arrow: true,
			autoClose: true,
			center: true
		},
		'side':{
			horizon: false,
			pin: true,
			theme: 'sidebar',
			closed: false,
			mutex: true,
			arrow: false,
			autoClose: false,
			center: false
		},
		'float':{
			horizon: false,
			pin: true,
			theme: 'floatbar',
			closed: false,
			mutex: true,
			arrow: false,
			autoClose: true,
			center: true
		}
	};
	
	
	var copyOption = function(options) { 
        var rt = {};
        for(var key in defaultOption){
        	if(options[key] !== undefined){
        		rt[key] = options[key]
        	}else{
        		rt[key] = defaultOption[key];
        	}
        }
        var typeOption = typeDefault[options['type']];
        for(var key in typeOption){
        	if(options[key] !== undefined){
        		rt[key] = options[key]
        	}else{
        		rt[key] = typeOption[key];
        	}
        }

        return rt; 
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
	};
	
	var setAutoNavigation = function(target){
		target.onscroll = function(){
			
		}
	};
	
	var simpleNavBar= function(){
		if(arguments.length === 0 || typeof arguments[0]==='object'){
			if(arguments[0].horizon === false && arguments[0].theme === undefined){
				defaultOption.theme = 'sidebar';
			}
			var options = copyOption(arguments[0]);
			if(typeof options.element==='string'){
				options.element = document.getElementById(options.element);
			}
			if(!options.element){
				options.element = document.createElement("div");
			}
			if(typeof options.navTarget==='string'){
				options.navTarget = document.getElementById(options.navTarget);
			}
			if(!options.navTarget){
				options.navTarget = document.body;
			}
			
			options.element.classList.add(options.theme);
			options.element.style.zIndex="998";
			this.navbar = new navBar(options);
			this.navbar.init();
			options.scrollNav && setAutoNavigation.call(this.navbar, options.navTarget);
		}
		
		Object.defineProperties(this, {
			'active': {
				get: function(){
					return this.navbar.active;
				}
			}, 'options':{
				get: function(){
					return this.navbar.options;
				}
			}, 'element':{
				get: function(){
					return this.navbar.options.element;
				}
			}
		});

		return this;
	};
	simpleNavBar.prototype= {
		getActive : function(){
			return this.active;
		},
		setActive: function(name){
			try{
				var tab = this.navbar.findbyName(name);
				this.navbar.setActive(tab);
			}catch(e){
				throw ReferenceError("Set Active failed. Cannot find tab by given name "+arguments[1], "simple-navBar.js");
			}
		}, remove: function(name){
			var names;
			Array.isArray(name) ? names=name : names=[name];
			this.options.tabs = removeByName(this.options.tabs, names);
			this.init();
		}, init: function(){
			this.navbar.init();
		}, 'add': function(tabs, parent){
			Array.isArray(tabs) || (tabs = [tabs]);
			var parent = this.navbar.findConfigTab(parent);
			if(parent){
				parent.sub = parent.sub || [];
				parent.sub.push.apply(parent.sub, tabs);
			}else{
				this.options.tabs.push.apply(this.options.tabs, tabs);
			}
			this.init();
		},
	};


	global.simpleNavBar = simpleNavBar;
})(window);
