/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"syncea/salesai/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
