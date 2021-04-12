/// <reference path="jquery-vsdoc.js" />
/// <reference path="//ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min.js" />
/// <reference path="maps.googleapis.com/maps/api/js?v=3&sensor=false" />
/// <reference path="google-maps-3-vs-1-0.js" />
mdot["maps"]["plugins"]["ers"] = mdot["maps"]["plugins"]["ers"] || {};
mdot["maps"]["plugins"]["ers"]["Incidents"] = mdot["maps"]["plugins"]["ers"]["Incidents"] || function (map, options)
{
    "use strict";
    var
        that = this, //used in internal methods
        $plannedCheckbox = $(options["plannedCheckbox"])
        .change(function ()
        {
            if ($(this).prop("checked"))
            {
                for (var i = that.currentCount; i < that.length; i++)
                {
                    that[i].setMap(map);
                }
            } else
            {

                for (var i = that.currentCount; i < that.length; i++)
                {
                    that[i].setMap(null);
                }
                //Determine if the infoWindow is opened by a planned marker
                if (infoWindow["owner"] == that && that.activeIndex >= that.currentCount)
                {
                    infoWindow.setAnchor(null);
                    infoWindow["owner"] = null;
                    that.activeIndex = -1;
                }
            }
        }),
        $currentCheckbox = $(options["currentCheckbox"])
        .change(function ()
        {
            if ($(this).prop("checked"))
            {
                for (var i = 0; i < that.currentCount; i++)
                {
                    that[i].setMap(map);
                }
            } else
            {
                for (var i = 0; i < that.currentCount; i++)
                {
                    that[i].setMap(null);
                }
                if (infoWindow["owner"] == that && that.activeIndex > -1 && that.activeIndex < that.currentCount)
                {
                    infoWindow.setAnchor(null);
                    infoWindow["owner"] = null;
                    that.activeIndex = -1;
                }
            }
        }),
        infoWindow = map["infoWindow"];

    this.activeIndex = -1;
    this.plannedCount = 0;
    this.currentCount = 0;
    this.length = 0;

    function capitalizeFirstLetter(string)
    {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function getinfoWindowHtml(smarker)
    {
        //alert("@@@@@@ getinfo  " + smarker.EventCreatedDate);
        var newRowColor = "white";

        function addRow(colname, data)
        {
            if (data != null && data.length > 0)
            {
                var rowHTML = "<div style=\"width:300px\" class=\"clearfix\"><h5 style=\"vertical-align:top;margin:0;display:inline;float:left;color:black !important\">" + colname + "&nbsp;</h5><ul class=\"clearfix\" style=\"max-width:200px;vertical-align:top;margin:-1px 0 0 0;padding:0;display:inline;float:left;\"><li style=\"list-style-image:none !important;margin:0 !important;font-size:0;color:white\"><span style=\"line-height:18px;color:black;font-size:13px;\">" + data + "</span></li></ul></div>";
                newRowColor = newRowColor == "white" ? "whitesmoke" : "white";
                table += rowHTML;
            }
        }


        var isCurrent = (smarker["EventCategory"] == "Current Event");
        //var startDate = smarker.EventStartDate;
        var startDate = smarker.EventCreatedDate;
        var endDate = smarker.EventEndDate;
        var days = smarker.RecurrenceDescription.replace(/\n/g, "<br/>");
        var location = smarker.LocationDescription;
        var header = "<h2 style=\"color:black !important;vertical-align:top;text-align:center;margin:0 0 10px 0\">&nbsp;";
        //header += smarker.EventType;
        header += isCurrent ? "Incident" : "Road&nbsp;Work";
        header += "&nbsp;</h2>";
        var eventType = (smarker.EventSubType.length > 0 && smarker.EventSubType != "Other") ? (smarker.EventSubType) : "";

        var table = "<div style=\"\" class=\"clearfix\">";
        table += header;
        addRow("Type:", eventType);
        var date = new Date(startDate);
        
        if (isCurrent)
        {
            //alert(((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '/' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '/' + date.getFullYear());
            //alert("@@@@@@ iscurrent  " + startDate);
            var startDateFormat = ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '/' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '/' + date.getFullYear();
            addRow("Date&nbsp;Reported:", startDateFormat);
        }
        else
        {
            addRow("Start&nbsp;Date:", startDate);
            addRow("End&nbsp;Date:", endDate);
            addRow("Days/Times:", days);
        }
        addRow("Location:", location);
        return table + "</div>";
    }


    var ers_markers = options["data"];

    //Loops through ersJSON and adds the markers to the map
    that.length = ers_markers.length;
    var plannedStartValue = $plannedCheckbox.prop("checked") ? map : null;
    var currentStartValue = $currentCheckbox.prop("checked") ? map : null;

    $.each(ers_markers, function (i, value)
    {
        //alert("@@@@@@ ers_markersvalue  " + value["EventCreatedDate"]);
        var
            isCurrent = value["EventCategory"] == "Current Event",
            image = options["imagesFolder"] + (isCurrent ? options["currentImage"] : options["plannedImage"]),
            myLatLng = new google.maps.LatLng(value.PrimaryLatitude, value.PrimaryLongitude),
            marker = new google.maps.Marker({
                position: myLatLng,
                title: value.RoadwayName + ((value.EventSubType.length > 0 && value.EventSubType != "Other") ? (" (" + value.EventSubType) + ")" : ""),
                clickable: true,
                map: isCurrent?currentStartValue:plannedStartValue,
                icon: image,
                height: 24,//50,
                width: 24,//22,
                index: i,
                anchor: new google.maps.Point(12, 12)
            });

        //Allow overriding of marker click by specifying a click function in the constructor options
        if (typeof options["click"] !== "undefined")
        {
            google.maps.event.addListener(marker, 'click', options["click"]);
        } else //Default marker click behavior
        {
            google.maps.event.addListener(marker, 'click', function ()
            {
                var content = getinfoWindowHtml(value);
                infoWindow.setContent(content);
                infoWindow.open(map, marker);
                infoWindow["owner"] = that;
                that.activeIndex = i;
            });
        }

        //Add optional mouse events if specified in constructor options
        if (typeof options["mouseover"] !== "undefined")
        {
            google.maps.event.addListener(marker, 'mouseover', options["mouseover"]);
        }
        if (typeof options["mouseout"] !== "undefined")
        {
            google.maps.event.addListener(marker, 'mouseout', options["mouseout"]);
        }

        that[i] = marker;
        if (isCurrent) { that.currentCount++; }
    });

    
    that.plannedCount = that.length - that.currentCount;
    //Remove references to large JSON objects (so they can be collected as garbage)
    options["data"] = null;

};

mdot["maps"]["plugins"]["ers"]["applyToMap"] = mdot["maps"]["plugins"]["ers"]["applyToMap"] || function (map, options)
{
    "use strict";
    map["ersIncidents"] = new mdot["maps"]["plugins"]["ers"]["Incidents"](map, options);
};
