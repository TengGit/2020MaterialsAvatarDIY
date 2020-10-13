$(function() {
	var f = {};

	// New element with specified tag or new customized component
	(function(exports) {
		'use strict';

		var registered = {};

		exports.New = function(type) {
			var create = registered[type];
			if (create) {
				return create.apply(undefined, arguments)
			} else {
				var result = $(document.createElement(type));
				if (arguments.length == 2) {
					var attr = arguments[1];
					for (var name in attr) {
						result[name](attr[name]);
					}
				}
				return result;
			}
		}

		exports.Register = function(type, factory) {
			var prev = registered[type];
			registered[type] = factory;
			return prev;
		}

		exports.Unregister = function(type) {
			var prev = registered[type];
			delete registered[type];
			return prev;
		}

		return exports;

	})(f);

	// main logic
	var BG_URL = "img/bg/#1.jpg";
	var PV_URL = "img/car/bg/#1.png";
	var BOTTOM_URL = "img/car/bg/#1.png";
	var TOP_URL = "img/car/fg/#1.png";
	var AVATAR_SIZE = 256;
	var LOADED_TEST_INTERVAL = 100;
	var unfinished = 0;

	function finishOne() {
		unfinished--;
	}

	var avatarImg = undefined;

	function URLize(url) {
		return "url(#1)".replace("#1", url);
	}

	function doRefreshAvatar() {
		var canvas = $("#avatar-canvas").get(0);
		var result = $("#avatar-preview").get(0);
		var ctx = canvas.getContext("2d");

		var carType = $("[name=car-type]:checked");
		var bgImg = $("[name=car-bg]:checked").data("bg");
		var avatarBg = carType.data("bg");
		var avatarFg = carType.data("fg");

		ctx.drawImage(bgImg, 0, 0, AVATAR_SIZE, AVATAR_SIZE);
		ctx.drawImage(avatarBg, 0, 0, AVATAR_SIZE, AVATAR_SIZE);
		if (avatarImg) {
			var posInfo = JSON.parse(carType.attr("data-posinfo"));
			ctx.drawImage(avatarImg, posInfo[0], posInfo[1], posInfo[2], posInfo[2]);
		}
		ctx.drawImage(avatarFg, 0, 0, AVATAR_SIZE, AVATAR_SIZE);

		result.src = canvas.toDataURL();
	}

	var scheduled = null;
	function refreshAvatar() {
		if (unfinished === 0) {
			if (scheduled) {
				clearInterval(scheduled);
				scheduled = null;
			}
			doRefreshAvatar();
		} else {
			scheduled = scheduled || setInterval(refreshAvatar, LOADED_TEST_INTERVAL);
		}
	}

	// change "color selection" controls' background
	unfinished += $(".set-bg").each(function() {
		var img = document.createElement("img");
		var src = BG_URL.replace("#1", this.value);
		img.onload = finishOne;
		img.src = src;
		$(this).parent().css("background-image", URLize(src));
		$(this).data("bg", img);
	}).length;
	unfinished += $(".set-car").each(function() {
		var bgImg = document.createElement("img"), fgImg = document.createElement("img");
		var key = this.value;
		bgImg.onload = finishOne;
		fgImg.onload = finishOne;
		bgImg.src = BOTTOM_URL.replace("#1", key);
		fgImg.src = TOP_URL.replace("#1", key);
		$(this).parent().css("background-image", URLize(PV_URL.replace("#1", key)));
		$(this).data({"bg": bgImg, "fg": fgImg});
	}).length * 2;

	$(".btn.my-picker").on("change", function() {
		refreshAvatar();
	});

	$("#select-avatar").on("click", function () {
		$("#avatar-file").click();
	});

	$("#avatar-file").on("change", function () {
		var files = this.files;
		if (files.length) {
			avatarImg = document.createElement("img");
			avatarImg.src = window.URL.createObjectURL(files.item(0));
			avatarImg.onload = refreshAvatar;
		} else {
			avatarImg = undefined;
			refreshAvatar();
		}
	});

	window.onload = refreshAvatar;
});
