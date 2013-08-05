
 var cocos2dApp = cc.Application.extend({
    config:document['ccConfig'],
    ctor:function (scene) {
        this._super();
        this.startScene = scene;
        cc.COCOS2D_DEBUG = this.config.COCOS2D_DEBUG;
		cc.initDebugSetting();
        cc.setup(this.config.tag);
        cc.AppController.shareAppController().didFinishLaunchingWithOptions();
		
		// add custom file types for Spine
		cc.RESOURCE_TYPE["XML"].push("json");
		cc.RESOURCE_TYPE["TEXT"].push("atlas");
    },
    applicationDidFinishLaunching:function () {
        // initialize director
        director = cc.Director.getInstance();
        winSize = director.getWinSize();
        centerPos = cc.p( winSize.width/2, winSize.height/2 );
		
        //cc.EGLView.getInstance().setDesignResolutionSize(320,480,cc.RESOLUTION_POLICY.SHOW_ALL);

        // turn on display FPS
        director.setDisplayStats(this.config.showFPS);

        // set FPS. the default value is 1.0/60 if you don't call this
        director.setAnimationInterval(1.0 / this.config.frameRate);

        //load resources
        cc.LoaderScene.preload(g_mainmenu, function () {
            director.replaceScene(new this.startScene());
        }, this);

        return true;
    }
});

var director;
var winSize;
var centerPos;

var myApp = new cocos2dApp(MainScene);