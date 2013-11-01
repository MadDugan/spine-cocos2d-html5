/* MainLayer
*/

var MainLayer = cc.LayerColor.extend({
	_labelLoading:null,
	ccSkelNode:null,
    ctor:function() {
		this._super(cc.c4b(255,0,255,255));

        var size = cc.Director.getInstance().getWinSize();

        if (sys.capabilities.hasOwnProperty('mouse'))
			this.setMouseEnabled(true);

        this._labelLoading = cc.LabelTTF.create("loading...", "Arial", 15);
        this._labelLoading.setPosition(cc.p(size.width / 2, size.height / 2 - 20));
        this.addChild(this._labelLoading);

		// wait for texture to be loaded...
		cc.TextureCache.getInstance().addImageAsync(s_spineboy, this, this.loadSpineTest);
    },
	onEnterTransitionDidFinish:function () {
		cc.Loader.preload(g_maingame, this.ready, this);
	},
	ready:function () {

	},
	loadSpineTest: function () {

		ccSkelNode = cc.SkeletonAnimation.createWithFile(s_spineboyJSON, s_spineboyATLAS);

        ccSkelNode.setPosition(cc.p(winSize.width / 2, 20));
		ccSkelNode.updateWorldTransform();

		ccSkelNode.skeleton.setSlotsToSetupPose();

		ccSkelNode.setMix("walk", "jump", 0.2);
		ccSkelNode.setMix("jump", "walk", 0.4);

		ccSkelNode.setAnimationListener(this, this.animationStateEvent);
		ccSkelNode.setAnimation(0, "walk", false);
		ccSkelNode.addAnimation(0, "jump", false);
		ccSkelNode.addAnimation(0, "drawOrder", false);
		ccSkelNode.addAnimation(0, "walk", true);

		//ccSkelNode.debugBones = true;
		//ccSkelNode.debugSlots = true;
		
		ccSkelNode.state.onEvent = function (trackIndex, event) {
			cc.log(trackIndex + " event: " + event.data.name)
		}		

		this.addChild(ccSkelNode);

		this.removeChild(this._labelLoading, true);
	},
    onMouseDown:function(event) {
		ccSkelNode.setAnimation(0, "jump", false);
		ccSkelNode.addAnimation(0, "walk", true, 0);
    }
});

MainLayer.create = function () {
    var c = new MainLayer();
    if (c && c.init()) {
        return c;
    }
    return null;
};

var MainScene = cc.Scene.extend({
    ctor:function() {
        this._super();
		this.init();
    },
    onEnter:function () {
        this._super();
        var layer = MainLayer.create();
        this.addChild(layer);
    }
});


