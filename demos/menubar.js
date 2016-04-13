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
	{name: 'github', label: 'Github'},
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

