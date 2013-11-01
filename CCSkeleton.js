/*******************************************************************************
* Javascript port of CCSkeleton.cpp (Copyright (c) 2013, Esoteric Software)
* https://github.com/EsotericSoftware/spine-runtimes/tree/master/spine-cocos2dx
*
* File:           CCSkeleton.js
* Version:        1.1.0
* Last changed:   2013/08/05
* Purpose:        Base skeleton container for Spine animation
* Author:         J White
* Copyright:      (C) 2013, Snop.com
*
* THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
* KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
* IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
* PARTICULAR PURPOSE.
******************************************************************************/

cc.Skeleton = cc.NodeRGBA.extend({
	skeleton:null,
	rootBone:null,
	timeScale:1,
	debugSlots:false,
	debugBones:false,
	premultipliedAlpha:false,
	ownsSkeletonData:false,
	atlas:null,
	_blendFunc:null,
	init: function () {
		this._super();

		this.debugSlots = false;
		this.debugBones = false;
		this.timeScale = 1;

		this._blendFunc = {src:cc.BLEND_SRC, dst:cc.BLEND_DST};

		this.setOpacityModifyRGB(true);

		this.setShaderProgram(cc.ShaderCache.getInstance().programForKey(cc.SHADER_POSITION_TEXTURECOLOR));
		this.scheduleUpdate();
	},
	initWithData: function (skeletonData, ownsSkeletonData) {
		this.setSkeletonData(skeletonData, ownsSkeletonData);
		this.init();
		return true;
	},
	setSkeletonData: function (skeletonData, ownsSkeletonData){
		this.skeleton = new spine.Skeleton(skeletonData);
		this.rootBone = this.skeleton.getRootBone();
		this.ownsSkeletonData = ownsSkeletonData;
	},
	update: function (deltaTime){
		this.skeleton.update(deltaTime * this.timeScale);
	},
	draw: function (){
		this._super();
		var textureAtlas = null;

		cc.NODE_DRAW_SETUP(this);

		cc.glBlendFunc(this._blendFunc.src, this._blendFunc.dst);

		var color = this.getColor();
		this.skeleton.r = color.r / 255.0;
		this.skeleton.g = color.g / 255.0;
		this.skeleton.b = color.b / 255.0;
		this.skeleton.a = this.getOpacity() / 255.0;
		if (this.premultipliedAlpha) {
			this.skeleton.r *= this.skeleton.a;
			this.skeleton.g *= this.skeleton.a;
			this.skeleton.b *= this.skeleton.a;
		}

		var additive = undefined;
		var quad = new cc.V3F_C4B_T2F_Quad();
		quad.tl.vertices.z = 0;
		quad.tr.vertices.z = 0;
		quad.bl.vertices.z = 0;
		quad.br.vertices.z = 0;

		for (var i = 0, n = this.skeleton.slots.length; i < n; i++) {
			var slot = this.skeleton.drawOrder[i];
			if (!slot.attachment || !(slot.attachment instanceof spine.RegionAttachment)){
				continue;
			}
			var attachment = slot.attachment;
			var regionTextureAtlas = this.getTextureAtlas(attachment);

			if (slot.data.additiveBlending != additive) {
				if (textureAtlas) {
					textureAtlas.drawQuads();
					textureAtlas.removeAllQuads();
				}
				additive = additive ? undefined : true;
				cc.glBlendFunc(this._blendFunc.src, additive ? gl.ONE : this._blendFunc.dst);
			} else if (regionTextureAtlas != textureAtlas && textureAtlas) {
				textureAtlas.drawQuads();
				textureAtlas.removeAllQuads();
			}
			textureAtlas = regionTextureAtlas;

			if (textureAtlas.getCapacity() == textureAtlas.getTotalQuads() &&
				!textureAtlas.resizeCapacity(textureAtlas.getCapacity() * 2))
				return;

			RegionAttachment_updateQuad(attachment, slot, quad, this.premultipliedAlpha);
			textureAtlas.updateQuad(quad, textureAtlas.getTotalQuads());
		}

		if (textureAtlas) {
			textureAtlas.drawQuads();
			textureAtlas.removeAllQuads();
		}

		if (this.debugSlots) {
			// Slots.
			//ccDrawColor4B(0, 0, 255, 255);
			cc.renderContext.fillStyle = "rgba(0,0,255,1)";
			cc.renderContext.strokeStyle = "rgba(0,0,255,1)";
			//glLineWidth(1);
			var points = [];
			var quad = new cc.V3F_C4B_T2F_Quad();
			for (var i = 0, n = this.skeleton.slots.length; i < n; i++) {
				var slot = this.skeleton.drawOrder[i];
				if (!slot.attachment || !(slot.attachment instanceof spine.RegionAttachment)) continue;
				var attachment = slot.attachment;
				RegionAttachment_updateQuad(attachment, slot, quad);
				points[0] = cc.p(quad.bl.vertices.x, quad.bl.vertices.y);
				points[1] = cc.p(quad.br.vertices.x, quad.br.vertices.y);
				points[2] = cc.p(quad.tr.vertices.x, quad.tr.vertices.y);
				points[3] = cc.p(quad.tl.vertices.x, quad.tl.vertices.y);
				cc.drawingUtil.drawPoly(points, 4, true);
			}
		}

		if (this.debugBones) {
			// Bone lengths.
			//gl.lineWidth(2);
			cc.renderContext.lineWidth = "2";
			//cc.DrawColor4B(255, 0, 0, 255);
			cc.renderContext.fillStyle = "rgba(255,0,0,1)";
			cc.renderContext.strokeStyle = "rgba(255,0,0,1)";
			for (var i = 0, n = this.skeleton.bones.length; i < n; i++) {
				var bone = this.skeleton.bones[i];
				var x = bone.data.length * bone.m00 + bone.worldX;
				var y = bone.data.length * bone.m10 + bone.worldY;
				cc.drawingUtil.drawLine(cc.p(bone.worldX, bone.worldY), cc.p(x, y));
			}
			// Bone origins.
//			cc.pointSize(4);
//			cc.DrawColor4B(0, 0, 255, 255); // Root bone is blue.
			cc.renderContext.fillStyle = "rgba(0,0,255,1)";
			cc.renderContext.strokeStyle = "rgba(0,0,255,1)";
			for (var i = 0, n = this.skeleton.bones.length; i < n; i++) {
				var bone = this.skeleton.bones[i];
				cc.drawingUtil.drawCircle(cc.p(bone.worldX, bone.worldY), 4, 0, 16, false);
				if (i == 0){
					//cc.DrawColor4B(0, 255, 0, 255);
					cc.renderContext.fillStyle = "rgba(0,255,0, 1)";
					cc.renderContext.strokeStyle = "rgba(0,255,0, 1)";
				}
			}
		}
	},
	getTextureAtlas: function (regionAttachment){
		return regionAttachment.rendererObject.page.rendererObject;
	},
	boundingBox: function (){
		var minX = Number.POSITIVE_INFINITY, minY = Number.POSITIVE_INFINITY, maxX = Number.NEGATIVE_INFINITY, maxY = Number.NEGATIVE_INFINITY;
		var scaleX = this.getScaleX();
		var scaleY = this.getScaleY();
		var vertices = [];
		for (var i = 0; i < skeleton.slot.length; ++i) {
			var slot = skeleton.slots[i];
			if (!slot.attachment || !(slot.attachment instanceof spine.RegionAttachment)) continue;
			var attachment = slot.attachment;
			attachment.computeVertices(slot.skeleton.x, slot.skeleton.y, slot.bone, vertices);
			minX = min(minX, vertices[0] * scaleX);
			minY = min(minY, vertices[1] * scaleY);
			maxX = max(maxX, vertices[0] * scaleX);
			maxY = max(maxY, vertices[1] * scaleY);
			minX = min(minX, vertices[6] * scaleX);
			minY = min(minY, vertices[7] * scaleY);
			maxX = max(maxX, vertices[6] * scaleX);
			maxY = max(maxY, vertices[7] * scaleY);
			minX = min(minX, vertices[2] * scaleX);
			minY = min(minY, vertices[3] * scaleY);
			maxX = max(maxX, vertices[2] * scaleX);
			maxY = max(maxY, vertices[3] * scaleY);
			minX = min(minX, vertices[4] * scaleX);
			minY = min(minY, vertices[5] * scaleY);
			maxX = max(maxX, vertices[4] * scaleX);
			maxY = max(maxY, vertices[5] * scaleY);
		}
		var position = this.getPosition();
		return cc.RectMake(position.x + minX, position.y + minY, maxX - minX, maxY - minY);
	},

	// --- Convenience methods for common Skeleton_* functions.
	updateWorldTransform: function (){
		this.skeleton.updateWorldTransform();
	},

	setToSetupPose: function (){
		this.skeleton.setToSetupPose();
	},
	setBonesToSetupPose: function (){
		this.skeleton.setBonesToSetupPose();
	},
	setSlotsToSetupPose: function (){
		this.skeleton.setSlotsToSetupPose();
	},

	/* Returns 0 if the bone was not found. */
	findBone: function (boneName){
		return this.skeleton.findBone(boneName);
	},
	/* Returns 0 if the slot was not found. */
	findSlot: function (slotName){
		return this.skeleton.findSlot(slotName);
	},

	/* Sets the skin used to look up attachments not found in the SkeletonData defaultSkin. Attachments from the new skin are
	 * attached if the corresponding attachment from the old skin was attached. Returns false if the skin was not found.
	 * @param skin May be 0.*/
	setSkin: function (skinName){
		this.skeleton.setSkin(skinName);
	},

	/* Returns 0 if the slot or attachment was not found. */
	getAttachment: function (slotName, attachmentName){
		return this.skeleton.getAttachmentBySlotName(slotName, attachmentName);
	},
	/* Returns false if the slot or attachment was not found. */
	setAttachment: function (slotName, attachmentName){
		this.skeleton.setAttachment(slotName, attachmentName);
	},

	setOpacityModifyRGB: function (value){
		this.premultipliedAlpha = value;
	},
	isOpacityModifyRGB: function (){
		return this.premultipliedAlpha;
	}
});

/* untested */
cc.Skeleton.createWithData = function (skeletonData, ownsSkeletonData) {

	ownsSkeletonData = ownsSkeletonData || false;

	var c = new cc.Skeleton();
    if (c && c.initWithData(skeletonData, ownsSkeletonData)) {
        return c;
    }
    return null;
};

/* untested */
cc.Skeleton.createWithFile = function (skeletonURL, atlasURL, scale){
	scale = scale || 1;
	var c = new cc.Skeleton();

	var atlasText = cc.FileUtils.getInstance().getTextFileData(atlasURL);

	this.atlas = new spine.Atlas(atlasText, {
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

	var json = new spine.SkeletonJson(new spine.AtlasAttachmentLoader(this.atlas));
	json.scale = scale;
	var skeletonDataFile = cc.FileUtils.getInstance().getTextFileData(skeletonURL);

	var skeletonData = json.readSkeletonData(JSON.parse(skeletonDataFile));

    if (c && c.initWithData(skeletonData, true)) {
        return c;
    }
    return null;
};

function RegionAttachment_updateQuad(self, slot, quad, premultipliedAlpha) {

	premultipliedAlpha = premultipliedAlpha || false;

	var vertices = [];

	self.computeVertices(slot.skeleton.x, slot.skeleton.y, slot.bone, vertices);

	var r = slot.skeleton.r * slot.r * 255;
	var g = slot.skeleton.g * slot.g * 255;
	var b = slot.skeleton.b * slot.b * 255;
	var normalizedAlpha = slot.skeleton.a * slot.a;

	if (premultipliedAlpha) {
		r *= normalizedAlpha;
		g *= normalizedAlpha;
		b *= normalizedAlpha;
	}

	var a = normalizedAlpha * 255;

	quad.bl.colors.r = r;
	quad.bl.colors.g = g;
	quad.bl.colors.b = b;
	quad.bl.colors.a = a;
	quad.tl.colors.r = r;
	quad.tl.colors.g = g;
	quad.tl.colors.b = b;
	quad.tl.colors.a = a;
	quad.tr.colors.r = r;
	quad.tr.colors.g = g;
	quad.tr.colors.b = b;
	quad.tr.colors.a = a;
	quad.br.colors.r = r;
	quad.br.colors.g = g;
	quad.br.colors.b = b;
	quad.br.colors.a = a;

	quad.bl.vertices.x = vertices[0];
	quad.bl.vertices.y = vertices[1];
	quad.tl.vertices.x = vertices[2];
	quad.tl.vertices.y = vertices[3];
	quad.tr.vertices.x = vertices[4];
	quad.tr.vertices.y = vertices[5];
	quad.br.vertices.x = vertices[6];
	quad.br.vertices.y = vertices[7];

	quad.bl.texCoords.u = self.uvs[0];
	quad.bl.texCoords.v = self.uvs[1];
	quad.tl.texCoords.u = self.uvs[2];
	quad.tl.texCoords.v = self.uvs[3];
	quad.tr.texCoords.u = self.uvs[4];
	quad.tr.texCoords.v = self.uvs[5];
	quad.br.texCoords.u = self.uvs[6];
	quad.br.texCoords.v = self.uvs[7];
}