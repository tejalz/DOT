//Define the namespaces we'll be using
window.mdot = window.mdot || {};
window.mdot.maps = window.mdot.maps || {};
window.mdot.maps.plugins = window.mdot.maps.plugins || {};

function toggleFullScreen(map) {
    var center;
    var $mapCanvas = $(map.getDiv());
    var $mapWrapper = $mapCanvas.parent();

    if (map.fullscreen == false) {
        center = map.getCenter();

        $mapCanvas.css("position", "fixed")
            .css("top", 0)
            .css("left", 0)
            .css("width", "100%")
            .css("height", "100%");

        google.maps.event.trigger(map, "resize");
        map.setCenter(center);
        map.fullscreen = true;
    } else {
        center = map.getCenter();
        $mapCanvas.css("position", "relative");
        $mapCanvas.width($mapWrapper.width());
        $mapCanvas.height(map.defaultHeight);
        google.maps.event.trigger(map, "resize");
        map.setCenter(center);
        map.fullscreen = false;
    }
}

(function($) {
    var methods = {
        init: function() {
            return this.each(function(index) {
                var map,
                    $mapWrapper = $(this),
                    $mapCanvas = $mapWrapper.find(".map_canvas"),
                    modID = $mapCanvas.find("input:hidden").val(),
                    options = mdot["maps"]["map" + modID]["options"],
                    defaultHeight = options["height"] + "px",
                    defaultLat = options["latitude"],
                    defaultLon = options["longitude"],
                    defaultZoom = options["zoom"],
                    minZoom = options["minZoom"],
                    maxZoom = options["maxZoom"],
                    defaultStyles = options["styles"],
                    mapTypeId = options["mapTypeId"],
                    panDistance = 128; // Pan distance is half a tile's width

                //Size the map's div to the height from the module settings
                $mapCanvas.css("height", defaultHeight);

                // Create the map
                map = new google.maps.Map(document.getElementById($mapCanvas.attr("id")), {
                    disableDefaultUI: true,
                    //CJM 
                    //disableDoubleClickZoom: true,
                    //CJM
                    scrollwheel: false,
                    mapTypeId: google.maps.MapTypeId[mapTypeId],
                    center: new google.maps.LatLng(defaultLat, defaultLon),
                    zoom: defaultZoom,
                    minZoom: minZoom,
                    maxZoom: maxZoom,
                    disableAutoPan: true,
                    styles: defaultStyles
                });

                //Add custom properties to the map
                map.defaultHeight = defaultHeight;
                map.fullscreen = false;
                map.defaultZoom = defaultZoom;
                var infoWindowHeight = 240; //50;
                var infoWindowWidth = 352; //150;
                map.infoWindow = new google.maps.InfoWindow({ size: new google.maps.Size(infoWindowWidth, infoWindowHeight) });

                //Create the map's controls collection
                var $controlsPan = $("<div />", {
                        'class': "pan"
                    }),
                    $controlsUp = $("<button />", {
                        'name': "pan-up",
                        'class': "pan-up",
                        click: function(e) {
                            e.preventDefault();
                            map.panBy(0, -panDistance);
                        }
                    }),
                    $controlsLeft = $("<button />", {
                        'name': "pan-left",
                        'class': "pan-left",
                        click: function(e) {
                            e.preventDefault();
                            map.panBy(-panDistance, 0);
                        }
                    }),
                    $controlsRight = $("<button />", {
                        'name': "pan-right",
                        'class': "pan-right",
                        click: function(e) {
                            e.preventDefault();
                            map.panBy(panDistance, 0);
                        }
                    }),
                    $controlsDown = $("<button />", {
                        'name': "pan-down",
                        'class': "pan-down",
                        click: function(e) {
                            e.preventDefault();
                            map.panBy(0, panDistance);
                        }
                    }),
                    $controlsCenter = $("<button />", {
                        'name': "pan-center",
                        'class': "pan-center",
                        click: function(e) {
                            e.preventDefault();
                            map.setZoom(defaultZoom);
                            map.setCenter(new google.maps.LatLng(defaultLat, defaultLon));
                        }
                    }),
                    $controlsSpan = $("<span style=\"display:block\" />"),
                    $controlsZoom = $("<div />", {
                        'class': "zoom"
                    }),
                    $controlsOut = $("<button />", {
                        'name': "zoom-out",
                        'class': "zoom-out",
                        click: function(e) {
                            e.preventDefault();
                            map.setZoom(map.getZoom() - 1);
                        }
                    }),
                    $controlsIn = $("<button />", {
                        'name': "zoom-in",
                        'class': "zoom-in",
                        click: function(e) {
                            e.preventDefault();
                            map.setZoom(map.getZoom() + 1);
                        }
                    }),
                    $controlsFullScreen = $("<button />", {
                        'name': "full-screen",
                        'class': "map_toggle_fullscreen",
                        click: function(e) {
                            e.preventDefault();
                            toggleFullScreen(map);
                            if (map.fullscreen == true) {
                                $(this).find("img").attr("alt", "Exit full screen").attr("src", window.mdot["mapImagesURL"] + "Images/fsExit.png");
                            } else {
                                $(this).find("img").attr("alt", "Viewe full screen").attr("src", window.mdot["mapImagesURL"] + "Images/fsEnter.png");
                            }
                        }
                    });

                // Create the controls
                $mapCanvas.attr("tabIndex", 0);
                // Pan controls
                $controlsUp.append("<img src=\"Images/pan-up.png\" alt=\"Pan map up\">");
                $controlsLeft.append("<img src=\"Images/pan-left.png\" alt=\"Pan map left\">");
                $controlsCenter.append("<img src=\"Images/center.png\" alt=\"Center map\">");
                $controlsRight.append("<img src=\"Images/pan-right.png\" alt=\"Pan map right\">");
                $controlsDown.append("<img src=\"Images/pan-down.png\" alt=\"Pan map down\">");
                //alert(window.mdot["mapImagesURL"]);
                $controlsSpan.append($controlsLeft, $controlsCenter, $controlsRight);
                $controlsPan.append($controlsUp, $controlsSpan, $controlsDown);

                // Zoom controls
                $controlsIn.append("<img src=\"Images/zoom-in.png\" alt=\"Zoom in on map\">");
                $controlsOut.append("<img src=\"Images/zoom-out.png\" alt=\"Zoom out of map\">");

                //Full Screen control
                $controlsFullScreen.append("<img src=\"Images/fsEnter.png\" alt=\"View full screen\">");

                $controlsZoom.append($controlsFullScreen, $controlsIn, $controlsOut);

                // Add to the page
                map.controls[google.maps.ControlPosition.TOP_LEFT].push($controlsPan[0]);
                map.controls[google.maps.ControlPosition.TOP_RIGHT].push($controlsZoom[0]);

                $mapCanvas.keydown(function(e) {
                    // If the keycode isn't in this group, stop right here
                    if ([37, 38, 39, 40, 109, 189, 219, 107, 187, 221].indexOf(e.keyCode) == -1) {
                        return;
                    }

                    e.preventDefault();
                    e.stopPropagation();

                    switch (e.keyCode) {
                    case 37: // left arrow
                        map.panBy(-panDistance, 0);
                        break;
                    case 38: // up arrow
                        map.panBy(0, -panDistance);
                        break;
                    case 39: // right arrow
                        map.panBy(panDistance, 0);
                        break;
                    case 40: // down arrow
                        map.panBy(0, panDistance);
                        break;
                    case 109: // numpad -
                    case 189: // minus
                    case 219: // open bracket
                        map.setZoom(map.getZoom() - 1);
                        break;
                    case 107: // numpad +
                    case 187: // equal
                    case 221: // close bracket
                        map.setZoom(map.getZoom() + 1);
                        break;
                    }
                });

                mdot["maps"]["map" + modID]["initPlugins"](map);
                google.maps.event.addDomListener(window, "resize", function() {
                    var center = map.getCenter();
                    $mapCanvas = $mapWrapper.find(".map_canvas");
                    if (map.fullscreen == false)
                        $mapCanvas.width($mapWrapper.width());
                    google.maps.event.trigger(map, "resize");
                    map.setCenter(center);
                });
                window.mdot["maps"]["map" + modID] = map;
            });
        }
    };

    $.fn.map = function(method) {
        var $map = this;

        // Method calling logic
        if (methods[method]) {
            return methods[method].apply($map, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === "object" || !method) {
            return methods.init.apply($map, arguments);
        } else {
            $.error("Method " + method + " does not exist on jQuery.map");
        }
    };
})(jQuery);

function buildMaps() {
    $(".map").map();
}
