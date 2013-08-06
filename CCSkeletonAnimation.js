/*******************************************************************************
* Javascript port of CCSkeletonAnimation.cpp (Copyright (c) 2013, Esoteric Software)
* https://github.com/EsotericSoftware/spine-runtimes/tree/master/spine-cocos2dx
*
* File:           CCSkeletonAnimaiton.js
* Version:        1.0.0
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

cc.SkeletonAnimation = cc.Skeleton.extend({
	states:null,
	stateDatas:null,
	init: function () {
		this._super();
		this.states = [];
		this.stateDatas = [];
	},
	initWithData: function (skeletonData) {
		this.init();
		return this._super(skeletonData, false);
	},
	update: function (deltaTime){
	
		this._super(deltaTime);
		
		deltaTime *= this.timeScale;
		
		for (var i=0;i<this.states.length; i++) {
			this.states[i].update(deltaTime);
			this.states[i].apply(this.skeleton);
		}
		
		this.skeleton.updateWorldTransform();	
	},
	addAnimationState: function (stateData){
		if (!stateData) {
			stateData = new spine.AnimationStateData(this.skeleton.data);
			this.stateDatas.push(stateData);
		}
		
		var state = new spine.AnimationState(stateData);
		this.states.push(state);	
	},
	setAnimationStateData: function (stateData, stateIndex){
		stateIndex = stateIndex || 0;
		cc.Assert(stateIndex >= 0 && stateIndex < this.states.length, "stateIndex out of range.");
		cc.Assert(stateData, "stateData cannot be null.");
		

		var state = this.states[stateIndex];
		
		for(var i=0;i<this.stateDatas.length;i++) {
			if (state.data == this.stateDatas[i]) {
				this.stateDatas.splice(i, 1);
				break;
			}
		}

		this.states.splice(stateIndex, 1);
		
		state = new spine.AnimationState(stateData);
		this.states[stateIndex] = state;	
	},
	getAnimationState: function (stateIndex){
		stateIndex = stateIndex || 0;
		cc.Assert(stateIndex >= 0 && stateIndex < this.states.length, "stateIndex out of range.");
		return this.states[stateIndex];	
	},
	setMix: function (fromAnimation, toAnimation, duration, stateIndex){
		stateIndex = stateIndex || 0;
		cc.Assert(stateIndex >= 0 && stateIndex < this.states.length, "stateIndex out of range.");
		this.states[stateIndex].data.setMixByName(fromAnimation, toAnimation, duration);	
	},
	setAnimation: function (name, loop, stateIndex){
		stateIndex = stateIndex || 0;
		cc.Assert(stateIndex >= 0 && stateIndex < this.states.length, "stateIndex out of range.");
		this.states[stateIndex].setAnimationByName(name, loop);	
	},
	addAnimation: function (name, loop, delay, stateIndex){
		stateIndex = stateIndex || 0;
		cc.Assert(stateIndex >= 0 && stateIndex < this.states.length, "stateIndex out of range.");
		this.states[stateIndex].addAnimationByName(name, loop, delay);	
	},
	clearAnimation: function (stateIndex){
		stateIndex = stateIndex || 0;
		cc.Assert(stateIndex >= 0 && stateIndex < this.states.length, "stateIndex out of range.");
		this.states[stateIndex].clearAnimation();	
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
		c.addAnimationState(null);
        return c;
    }

    return null;	
};