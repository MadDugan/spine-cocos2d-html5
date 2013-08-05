(function () {
    var d = document;
    var c = {
        COCOS2D_DEBUG:2,
        box2d:false,
        chipmunk:false,
        showFPS:true,
        frameRate:60,
        loadExtension:false,
        tag:'gameCanvas',

        SingleEngineFile:'Cocos2d-html5-v2.1.3.min.js',
		//engineDir:'cocos2d/',
        appFiles:[
            './resource.js',
			'./MainScene.js',
			'./main.js',
			'./CCSkeleton.js',
			'./CCSkeletonAnimation.js',
	    ]
    };

    window.addEventListener('DOMContentLoaded', function () {
        var s = d.createElement('script');
        if (c.SingleEngineFile && !c.engineDir) {
            s.src = c.SingleEngineFile;
        }
        else if (c.engineDir && !c.SingleEngineFile) {
            s.src = c.engineDir + 'platform/jsloader.js';
        }
        else {
            alert('You must specify either the single engine file OR the engine directory in "cocos2d.js"');
        }

        document.ccConfig = c;
        s.id = 'cocos2d-html5';
        d.body.appendChild(s);
    });
})();