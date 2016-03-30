var defaultMenu = [ {
	name : "main",
	label : "Main",
	path : "main/controller"
    }, {
	name : "document",
	label : "Documents",
	sub : [ {
	    name : "start",
	    label : "Quick Start"
	}, {
	    name : "config",
	    label : "Configure",
	    href: "myconfigure"
	}, {
	    name : "api",
	    label : "APIs"
	} ]
    }, {
	name : "download",
	label : "Download"
    } ];
    $("#nav").navBar({
		tabs : defaultMenu,
		style : 'navDiv',
		onClick : function($event, tab) {
		    console.log([$event, tab]);
		},
		route : false,
    });

    $("#sideBar").navBar({
		tabs : defaultMenu,
		autoClose : false,
		arrow: false,
		horizon: false,
    });

    function getActive() {
	var active = $("#nav").navBar("active");
	$("#currentActive").text("Get: " + active.label+", Check the returned object in console.");
	console.log(["get active object: ", active]);
    };

    function setActive() {
	var active = $("#nav").navBar("active", "download");
    };

    function add() {
	$("#nav").navBar("add", {
	    name : 'about',
	    label : 'About'
	});
    };
    
    function addList() {
	$("#nav").navBar("add", [{
	    name : 'demo',
	    label : 'Demo'
	},{
	    name : 'about',
	    label : 'About'
	}]);
    };
    
    function addToAbout(){
	$("#nav").navBar("add", [{
	    name : 'me',
	    label : 'Me'
	},{
	    name : 'team',
	    label : 'Team'
	}], 'about');
    };

    function removeAbout() {
	$("#nav").navBar("remove", "about");
    };
    function removeList() {
	$("#nav").navBar("remove", ["about","demo"]);
    };
    function removeMe() {
	$("#nav").navBar("remove", ["about.me", "demo"]);
    };