/*******************************************************************************
* Javascript port of CCSkeletonAnimation.cpp (Copyright (c) 2013, Esoteric Software)
* https://github.com/EsotericSoftware/spine-runtimes/tree/master/spine-cocos2dx
*
* File:           CCSkeletonAnimaiton.js
* Version:        1.1.0
* Last changed:   2013/08/05
* Purpose:        Base Animation container for Spine animation
* Author:         J White
* Copyright:      (C) 2013, Snop.com
*
* THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
* KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
* IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
* PARTICULAR PURPOSE.
******************************************************************************/

function callback(state, trackIndex, type, event, loopCount) {
	state.context.onAnimationStateEvent(trackIndex, type, event, loopCount);
}

cc.SkeletonAnimation = cc.Skeleton.extend({
	state:null,
	ownsAnimationStateData:false,
	listenerInstance:null,
	listenerMethod:null,
	init: function () {
		this._super();

		var stateData = new spine.AnimationStateData(this.skeleton.data);
		this.state = new spine.AnimationState(stateData);
	},
	initWithData: function (skeletonData, ownsSkeletonData) {
		return this._super(skeletonData, ownsSkeletonData);
	},
	update: function (deltaTime){
		this._super(deltaTime);

		deltaTime *= this.timeScale;
		this.state.update(deltaTime);
		this.state.apply(this.skeleton);
		this.skeleton.updateWorldTransform();
	},
	setAnimationStateData: function (stateData){
		cc.Assert(stateData, "stateData cannot be null.");

		if (this.ownsAnimationStateData) this.state.data = null;

		this.ownsAnimationStateData = true;
		state = new spine.AnimationState(stateData);
		state.context = this;
		state.listener = callback;
	},
	setMix: function (fromAnimation, toAnimation, duration){
		this.state.data.setMixByName(fromAnimation, toAnimation, duration);
	},
	setAnimationListener: function (instance, method) {
		this.listenerInstance = instance;
		this.listenerMethod = method;
	},
	setAnimation: function (trackIndex, name, loop){
		var animation = this.skeleton.data.findAnimation(name);
		if (!animation) {
			cc.log("Spine: Animation not found: %s", name);
			return 0;
		}
		return this.state.setAnimation(trackIndex, animation, loop);
	},
	addAnimation: function (trackIndex, name, loop, delay){
		delay = delay || 0;
		var animation = this.skeleton.data.findAnimation(name);
		if (!animation) {
			cc.log("Spine: Animation not found: %s", name);
			return 0;
		}
		return this.state.addAnimation(trackIndex, animation, loop, delay);
	},
	getCurrent: function (trackIndex) {
		trackIndex = trackIndex || 0;
		return this.state.getCurrent(trackIndex);
	},
	clearTracks: function () {
		this.state.clearTracks();
	},
	clearTrack: function (trackIndex) {
		trackIndex = trackIndex || 0;
		this.state.clearTrack(trackIndex);
	},
	onAnimationStateEvent: function  ( trackIndex, type, event, loopCount) {
		if (this.listenerInstance) this.listenerMethod(this, trackIndex, type, event, loopCount);
	}
});

/* untested */
cc.SkeletonAnimation.createWithData = function (skeletonData) {
	var c = new cc.SkeletonAnimation();
    if (c && c.initWithData(skeletonData, false)) {
        return c;
    }
    return null;
};

cc.SkeletonAnimation.createWithFile = function (skeletonURL, atlasURL, scale){
	scale = scale || 1;
	var c = new cc.SkeletonAnimation();

	var atlasText = cc.FileUtils.getInstance().getTextFileData(atlasURL);

	var atlas = new spine.Atlas(atlasText, {
		load: function (page, path) {
			var texture = cc.TextureCache.getInstance().addImage(dirData + path);
			var textureAtlas = cc.TextureAtlas.createWithTexture(texture, 4);
			page.rendererObject = textureAtlas;
			page.width = texture.getPixelsWide() || 256;
			page.height = texture.getPixelsHigh() || 256;
		},
		unload: function (textureAtlas) {
			textureAtlas.resizeCapacity(0);
			cc.TextureCache.getInstance().removeTexture(textureAtlas.getTexture());
		}
	});

	var json = new spine.SkeletonJson(new spine.AtlasAttachmentLoader(atlas));
	var skeletonDataFile = cc.FileUtils.getInstance().getTextFileData(skeletonURL);

	var skeletonData = json.readSkeletonData(JSON.parse(skeletonDataFile));

    if (c && c.initWithData(skeletonData, true)) {
        return c;
    }

    return null;
};