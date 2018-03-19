mdot.maps.plugins.trafficland = mdot.maps.plugins.trafficland || {};
mdot.maps.plugins.trafficland.Cameras = mdot.maps.plugins.trafficland.Cameras || function (b, d) {
    //alert("JSON: " + JSON.stringify(d));
    //alert($(d.selectBox).value);
    //alert("this.MarkerClusterer" + this.MarkerClusterer);
    var a = this,
        k = $(d.selectBox),
        h = $(d.button),
        l = $(d.checkBox).change(function () {
            //alert("checkBox change");
            var c = a.MarkerClusterer;
            //alert("c Value: " + JSON.stringify(c));
            $(this).prop("checked") ? (c.addMarkers(a), c.repaint(), k[0].disabled = !1, h[0].disabled = !1) : (c.clearMarkers(), c.repaint(),
            e.owner == a && (e.setAnchor(null), a.stopRefreshing(), e.owner = null),
            k[0].disabled = !0, h[0].disabled = !0)
        }),
        e = b.infoWindow, p = "", q, r = 0, n = null; this.MarkerClusterer = null; k[0].disabled = h[0].disabled = !l.prop("checked");
    var that = this;
   // alert("var a = this value : " + JSON.stringify(a.MarkerClusterer));
    this.minRefreshRate = 0 === d.minRefreshRate % 1 ? d.minRefreshRate : 2E3;
    this.length = 0;
    this.refresh = function (c) {
        var d = p + "&refreshVersion=" + Math.random(),
            b = new Image(352, 240);
        a.image = b;
        b.onload = function () {
            e.owner == a && null != n && a.image == b ? (n.attr("src", d),
            q = setTimeout(function () { a.refresh(c) }, c)) : b = null
        }; b.src = d
    };
    this.image = null;
    this.startRefreshing = function (b) {
        r && clearTimeout(q);
        a.image = null;
        r = 1;
        b = Math.max(a.minRefreshRate, 0 === b % 1 ? b : 0); n = $("#camFullImg"); a.refresh(b)
    };
    this.stopRefreshing = function () {
        clearTimeout(q);
        r = 0; n = null; a.image = null; a.activeCamera = null
    };
    this.createTLCameras = function (c) {
        a.length += c.length; var f = null != (l.prop("checked") ? b : null); $.each(c, function (b, c) {
            var t = new google.maps.LatLng(c.location.latitude, c.location.longitude);
            a[b] = new google.maps.Marker({
                title: c.name,
                position: t,
                clickable: !0,
                icon: d.imagesFolder + (0 != c.status.isDisabled ? d.cameraActiveIcon : d.cameraDisabledIcon),
                height: 24,
                width: 24,
                //camFullImage: "/DesktopModules/MassDOT/MapPlugins/TrafficLand/TLImageHandler.ashx?mdotId=" + c.mdotId,
                camFullImage: "http://testapi/TLImageHandler.ashx?mdotId=" + c.mdotId + "&fullJpeg=" + c.content.fullJpeg,
                //camFullImage: "http://wwwt1.massdot.state.ma.us/DesktopModules/MassDOT/MapPlugins/TrafficLand/TLImageHandler.ashx?mdotId=n6CAwfdQarwg0JXLLXYz4RmyTZtwNb5WgZW8U9BXH6tzR17qhG",
                camName: c.name,
                index: b, anchor: new google.maps.Point(12, 12), refreshRate: c.policy.refreshRate, infoWindow: e
            });
            a[b].setVisible(f);
            //alert("1");
            k.append('<option value="' + b + '">' + a[b].camName + "</option>");
            //alert("2");
            google.maps.event.addListener(a[b], "click", function () {

                //alert("Drop box selection for new camera data");
                //alert(this.camFullImage);
                if (e.owner != a || a.activeCamera != this)
                    e.owner = a,
                a.activeCamera = this, e.setContent(""),
                e.setContent('<div style="width:354px;height:240px;display:table-cell;vertical-align:middle;text-align:center;"><img id="camFullImg" alt="' + this.camName + '" src="loading.gif"></div><div>' +
            this.camName + "</div>"),
                        p = this.camFullImage,
                        e.open(this.map, this),
                        a.startRefreshing(this.refreshRate)
                //alert('<div style="width:354px;height:240px;display:table-cell;vertical-align:middle;text-align:center;"><img id="camFullImg" alt="' + this.camName + '" src="/images/loading.gif"></div><div>' +
                //this.camName + "</div>");
            }
            )
        })
    };
    google.maps.event.addListener(e, "closeclick", function () {
        //alert("close");
        e.owner == a && a.stopRefreshing()
    });
    //alert(JSON.stringify(d.data.tlCamerasJSON));
    null != d.data.tlCamerasJSON && (this.createTLCameras(d.data.tlCamerasJSON),
    d.data.tlCamerasJSON = null);
    null != d.data.oldCamerasJSON && (this.createOldCameras(d.data.oldCamerasJSON.TrafficCams.Cam),
    d.data.oldCamerasJSON = null);
    for (var g = [], m = d.selectBox, f = 0; f < m.options.length - 1; f++)
        g[f] = [], g[f][0] = m.options[f + 1].text, g[f][1] = m.options[f + 1].value;
    for (g.sort() ; 1 < m.options.length;)
        m.options[1] = null;
    for (f = 0; f < g.length; f++) {
        var u = new Option(g[f][0], g[f][1]);
        m.options[f + 1] = u
    }
    this.getSelectedMarker = function () {
        var b = $("option:selected", k).val();
        return 0 <= b + 0 ? a[b] : null
    };
    this.openSelectedMarker = function () {
        var c = a.getSelectedMarker(); null == c ? alert("Please select a camera to view first.") : (null == c.getMap() && (a.MarkerClusterer.setMaxZoom(b.maxZoom - 1), b.setZoom(b.maxZoom), c.setMap(b)), google.maps.event.trigger(c, "click"), b.panTo(c.position))
    };
    h.click(this.openSelectedMarker)
};
mdot.maps.plugins.trafficland.applyToMap = mdot.maps.plugins.trafficland.applyToMap || function (b, d) {
    //alert(JSON.stringify(d));
    //alert(d.imagesFolder + d.cameraClusterIcon);
    var a = [{ textColor: "white", url: d.imagesFolder + d.cameraClusterIcon, height: 32, width: 32 }],
        k = b.defaultZoom,
        h = []
    //alert(url);
    h.push(24);
    var l = b.tlCameras = new mdot.maps.plugins.trafficland.Cameras(b, d);
    //alert(JSON.stringify(JSON.decycle(l)));
    if (0 < l.length) {
        var e = new MarkerClusterer(b, l, { gridSize: 32, averageCenter: !0, styles: a, minimumClusterSize: 10, maxZoom: b.maxZoom - 1, imageSizes: h });
        l.MarkerClusterer = e;
        google.maps.event.addListener(e, "clusterclick", function (a) { e.setMaxZoom(b.getZoom()) });
        google.maps.event.addListener(b, "zoom_changed", function () {
            var a = b.getZoom(); a <= k && e.setMaxZoom(b.maxZoom - 1); k = a
        })
    }
};