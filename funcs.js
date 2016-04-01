var navBarMenu = [ {
	name : "main",label : "Main", path : "main/controller"}, 
		{name : "demo", label : "Demos", sub : [ 
			{name : "navbar",label : "Nav Bar"}, 
			{name : "sidebar", label : "Side Bar"}, 
			{name : "menubar", label : "Menu Bar", href:"demos/menubar.html"},
			{name : "diy", label : "DIY"} ]}, 
	{name : "download", label : "Download"}];
var navbar = new simpleNavBar({
		element: "nav",
		tabs : navBarMenu,
		onClick : function($event, tab) {
			console.log([$event, tab]);
		},
		route : true,
		center: true
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
		autoClose : false,
		arrow: false,
		horizon: false,
		closed: false,
		mutex: false
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