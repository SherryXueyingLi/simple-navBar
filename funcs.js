var navBarMenu = [ {
	name : "main",label : "Main", path : "main/controller"}, 
		{name : "demo", label : "Demos", sub : [ 
			{name : "navbar",label : "Nav Bar"}, 
			{name : "sidebar", label : "Side Bar"}, 
			{name : "menubar", label : "Menu Bar"},
			{name : "diy", label : "DIY"} ]}, 
	{name : "download", label : "Download"}];
var navbar = new simpleNavBar({
		element: "nav",
		tabs : navBarMenu,
		onClick : function($event, tab) {
			console.log([$event, tab]);
		},
		center: true,
		type:'nav'
});
var sideBarMenu = [{
	name : "main",label : "Introduction", path : "main/controller"}, 
		{name : "document", label : "Documents", sub : [ 
			{name : "start",label : "Quick Start"}, 
			{name : "config", label : "Configure", href: "myconfigure"}, 
			{name : "api", label : "APIs"} ]}, 
	{name : "download", label : "Download"},
	{name: 'claim', label: 'Claim'} ];

var sidebar = new simpleNavBar({
	element: "sideBar",
		tabs : sideBarMenu,
		type:'side'
});

var menubarOnClick = function($event, tabObj){
	var e = document.createElement("pre");
	e.textContent = "You just clicked "+tabObj.label;
	document.getElementById("blackboard").appendChild(e);
	setTimeout(function(){
		setTimeout(function(){
			e.remove();
		}, 900);
		e.animate([{opacity: 1},{opacity: 0}],1000);
	}, 4000);
};

var menubar = new simpleNavBar({
	element: 'menuBar',
	tabs: [
	{name: 'github', label: 'Github', href:"https://github.com/SherryXueyingLi/simple-navBar"},
	{name:'js', label:'Javascript', sub:[
		{name: 'kt', label: 'Knockout'},
		{name: 'angular', label: 'AngularJs'},
		{name: 'require', label: 'RequireJs'},
		{name: 'jquery', label: 'JQuery'},
		{name: 'boot', label: 'Bootstrapper'}]},
	{name: 'css', label:'CSS'},
	{name: 'html', label:'HTML'},
	{name: 'script', label:'Scripts', sub:[
		{name:'python', label: 'Python'},
		{name:'php', label:'PHP'}]
	}],
	type: 'float',
	onClick: menubarOnClick
});



	function getActive() {
		var active = navbar.active;
		$("#currentActive").text("Get: " + active.label+", State is: "+active.state+", Check the returned object in console.");
		console.log(["get active object: ", active]);
	};

	function setActive() {
		navbar.setActive("download");
	};

	function add() {
		navbar.add({name : 'about', label : 'About'});
	};

	function addList() {
		navbar.add([{ name : 'docs', label : 'Docs'},
			{name : 'about', label : 'About'}]);
	};
	
	function addToAbout(){
		navbar.add([{name : 'me', label : 'Me'},
			{name : 'team',label : 'Team'}], 'about');
	};

	function removeAbout() {
		navbar.remove("about");
	};
	function removeList() {
		navbar.remove(["about","docs"]);
	};
	function removeMe() {
		navbar.remove(["about.me", "docs"]);
	};