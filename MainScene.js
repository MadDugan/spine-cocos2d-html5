/* MainLayer
*/

var MainLayer = cc.LayerColor.extend({
	_labelLoading:null,
    ctor:function() {
        this._super();
        cc.associateWithNative( this, cc.LayerColor );
    },

	init:function () {
		this._super(cc.c4b(255,0,255,255));
		
        var size = cc.Director.getInstance().getWinSize();

        this._labelLoading = cc.LabelTTF.create("loading...", "Arial", 15);
        this._labelLoading.setPosition(cc.p(size.width / 2, size.height / 2 - 20));
        this.addChild(this._labelLoading);		
		
		// wait for texture to be loaded...
		cc.TextureCache.getInstance().addImageAsync(s_spineboy, this, this.loadSpineTest);
		
		return true;
	},
	onEnterTransitionDidFinish:function () {
		cc.Loader.preload(g_maingame, this.ready, this);
	},
	ready:function () {

	},
	loadSpineTest: function () {
	
		var ccSkelNode = cc.SkeletonAnimation.createWithFile(s_spineboyJSON, s_spineboyATLAS);

		ccSkelNode.skeleton.setSlotsToSetupPose();
		ccSkelNode.setMix("walk", "jump", 0.2);
		ccSkelNode.setMix("jump", "walk", 0.4);		
		ccSkelNode.setAnimation("walk", true);
		//ccSkelNode.addAnimation("jump", false, 0);
		ccSkelNode.addAnimation("walk", true, 0);
	
		ccSkelNode.skeleton.getRootBone().x = 0;
		ccSkelNode.skeleton.getRootBone().y = 0;
		
		ccSkelNode.updateWorldTransform();
		ccSkelNode.setPosition(cc.p(320, 5));
		
		this.addChild(ccSkelNode);
		
		this.removeChild(this._labelLoading, true);
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
        cc.associateWithNative( this, cc.Scene );
    },
	init:function () {
		this._super();
		return true;
	},
    onEnter:function () {
        this._super();
        var layer = MainLayer.create();
        this.addChild(layer);
    }
});


