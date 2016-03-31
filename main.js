require.config({
    paths: {
	"angular": "lib/angular.min",
	"uiRouter": "lib/angular-ui-router",
	"css": "lib/css",  
    },
    shim: {
        'angular': {
            exports: 'angular'
        },
        "uiRouter": ["angular"],
    },
});

require(["navDemo","angular","uiRouter"], function(navDemo, angular){
    // see Stack Overflow Q: 25168593
    var app = angular.module("simple-navBar", ['ui.router']);
   
    app.config(function($controllerProvider, $stateProvider, $urlRouterProvider) {
	app.cp = $controllerProvider;
	app.$stateProvider = $stateProvider;
	setStates(config.tabs, $stateProvider);
	$urlRouterProvider.when("", "/main");
    });
    
    app.controller('menubar', navDemo);
    var cache={}; 
    var setStates = function(tabs, $stateProvider){
	for(var i in tabs){
	    if(tabs[i].children.length>0){
		setStates(tabs[i].children, $stateProvider);
	    }else{
		$stateProvider.state(tabs[i].state, generateConfig(tabs[i]));
	    }
	}
	
    };
    
    function generateConfig(tab){
	return {
            url: "/"+tab.url,
            templateUrl: tab.view,
            data: {
        	tab: tab,
        	name: tab.name,
        	state: tab.state,
        	path: tab.controllerPath
            },
            
            resolve: {
                tabController: ['$q',function($q){
                    if(cache[this.data.state]) return;
                    var data = this.data;
                    require([data.path], function(ctr){
                        angular.module("startup").cp.register(data.state, ctrl);
                        cache[data.state] = data.state;
                        $("#"+data.state).click();
                    })
                    return load(data).then(function(data){
                	
                    });
                }]
            },
            controller: tab.state
	   }
    };
    

    angular.bootstrap(document, ["startup"]);
    
});

