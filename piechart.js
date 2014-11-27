/**
 * Create an <svg> element and draw a pie chart into it.
 * Arguments:
 *   data: an array of numbers to chart, one for each wedge of the pie.
 *   cx, cy, r: the center and radius of the pie
 *   colors: an array of HTML color strings, one for each wedge
 *   labels: an array of labels to appear in the legend, one for each wedge
 *   title: the label for the chart 
 * Returns: 
 *    An <svg> element that holds the pie chart.
 *    The caller must insert the returned element into the document.
 */


$(document).ready(function () {
    // Find all x-pie elements and loop through
    $('x-pie').each(function (index) {
        // read the data
        var pc = $(this).attr('chart');
        // parse
        pc = pc.replace(/'/g, "\"");
        pc = JSON.parse(pc);
        // create title
        var title = pc.title;
        // create chart: pass in the container and the data. Size of the pie is based off the the size of the container.
        pc = pieChart(this, pc,index);
        $(this).append($("<h1 class='pie'>" + title + "</h1>"));
        $(this).append(pc);
    });
    
})
function pieChart(el,cd,index) {
    
    var data = cd.data;
    var doughnut = (cd.doughnut)? cd.doughnut : false;
    var tilt = (cd.tilt) ? 0.2 : 0;
    var width = $(el).width();
    var height = $(el).height();
    var cx = (width / 2);
    var cy = (height/2);
    var r = width/4;
    var colors = cd.colours;
    var labels = cd.labels;
    var lx = cd.lx;
    var ly = cd.ly;
    // This is the XML namespace for svg elements
    var svgns = "http://www.w3.org/2000/svg";    // Create the <svg> element, and specify pixel size and user coordinates
    var chart = document.createElementNS(svgns, "svg:svg");
    chart.setAttribute("width", width);
    chart.setAttribute("height", height);
    chart.setAttribute("viewBox", "0 0 " + width + " " + height);

    // Add up the data values so we know how big the pie is
    var total = 0;
    for (var i = 0; i < data.length; i++) total += data[i];

    // Now figure out how big each slice of pie is. Angles in radians.
    var angles = []
    for (var i = 0; i < data.length; i++) angles[i] = data[i] / total * Math.PI * 2;

    

    // Loop through each slice of pie.
    startangle = tilt;
    for (var i = 0; i < data.length; i++) {
        // This is where the wedge ends
        var endangle = startangle + angles[i];
        var halfangle = startangle + (angles[i] / 2);

        // Compute the two points where our wedge intersects the circle
        // These formulas are chosen so that an angle of 0 is at 12 o'clock
        // and positive angles increase clockwise.
        var x1 = cx + r * Math.sin(startangle);
        var y1 = cy - r * Math.cos(startangle);
        var x2 = cx + r * Math.sin(endangle);
        var y2 = cy - r * Math.cos(endangle);
        // see if the label will be placed beyone 180 degrees
        var degrees = halfangle * (180 / Math.PI);
        
        // Calculate the middle of the wedge
        var offset = (degrees > 180) ? (r + 30 + (labels[i].length*9)) : r + 30; // we need an offset if the label is beyond 180 degrees 
        var lx = (degrees > 180) ? cx + (r + 30) * Math.sin(halfangle) : cx + (r + 30) * Math.sin(halfangle);
        var ly = (degrees > 180) ? cy - (r+20) * Math.cos(halfangle) : cy - (r + 30) * Math.cos(halfangle);

        var line_start_x = cx + r * Math.sin(halfangle);
        var line_start_y = cy - r * Math.cos(halfangle);

        var line_end_x = cx + (r+20) * Math.sin(halfangle);
        var line_end_y = cy - (r + 20) * Math.cos(halfangle);
        console.log(labels[i].length + r)

        // This is a flag for angles larger than than a half circle
        // It is required by the SVG arc drawing component
        var big = 0;
        if (endangle - startangle > Math.PI) big = 1;

        // We describe a wedge with an <svg:path> element
        // Notice that we create this with createElementNS()
        var path = document.createElementNS(svgns, "path");

        // This string holds the path details
        var d = "M " + cx + "," + cy +  // Start at circle center
            " L " + x1 + "," + y1 +     // Draw line to (x1,y1)
            " A " + r + "," + r +       // Draw an arc of radius r
            " 0 " + big + " 1 " +       // Arc details...
            x2 + "," + y2 +             // Arc goes to to (x2,y2)
            " Z";                       // Close path back to (cx,cy)

        // Now set attributes on the <svg:path> element
        path.setAttribute("d", d);              // Set this path 
        path.setAttribute("fill", colors[i]);   // Set wedge color
        path.setAttribute("stroke", "white");   // Outline wedge in black
        path.setAttribute("stroke-width", "1"); // 2 units thick   
        path.setAttribute("class", "wedge");
        path.setAttribute("label", "label_" +index +"_"+ i);
        $(path).on("mouseover", function () {
            var label = $("#" + $(this).attr("label"));
            label.attr('font-weight','bold');
            console.log(label);
        });
        $(path).on("mouseout", function () {
            var label = $("#" + $(this).attr("label"));
            label.attr('font-weight','normal');
            console.log(label);
        });
        chart.appendChild(path);                // Add wedge to chart

        // The next wedge begins where this one ends
        

        // Now draw a little matching square for the key
        /*var icon = document.createElementNS(svgns, "rect");
        icon.setAttribute("x", lx);             // Position the square
        icon.setAttribute("y", ly + 30 * i);
        icon.setAttribute("width", 20);         // Size the square
        icon.setAttribute("height", 20);
        icon.setAttribute("fill", colors[i]);   // Same fill color as wedge
        icon.setAttribute("stroke", "black");   // Same outline, too.
        icon.setAttribute("stroke-width", "2");
        chart.appendChild(icon);                // Add to the chart*/

        // And add a label next to the middle of the wedge
        var label = document.createElementNS(svgns, "text");
        
        if (degrees > 180)
            label.setAttribute("text-anchor", "end");
        label.setAttribute("x", lx);
        label.setAttribute("y", ly);
        // Text style attributes could also be set via CSS
        label.setAttribute("font-family", "inherit");
        label.setAttribute("font-size", "16");
        label.setAttribute('id', "label_" + index + "_" + i);
        // Add a DOM text node to the <svg:text> element
        label.appendChild(document.createTextNode(labels[i]));
        chart.appendChild(label);               // Add text to the chart
        if(doughnut !== false){
            var doughnut = document.createElementNS(svgns, "circle");
            doughnut.setAttribute('stroke', 'white');
            doughnut.setAttribute('stroke-width', '1');
            doughnut.setAttribute('cx', cx);
            doughnut.setAttribute('cy', cy);
            doughnut.setAttribute('fill', 'white');
            doughnut.setAttribute('r', '30');
            chart.appendChild(doughnut);
        }
        //<circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />


        //<line x1="0" y1="0" x2="200" y2="200" style="stroke:rgb(255,0,0);stroke-width:2" />
        var line = document.createElementNS(svgns, "line");
        
        line.setAttribute("x1", line_start_x);
        line.setAttribute("y1", line_start_y);
        line.setAttribute("x2", line_end_x);
        line.setAttribute("y2", line_end_y);
        line.setAttribute("style", "stroke:black;stroke-width:1;");
        chart.appendChild(line);
        startangle = endangle;
    }

    return chart;
}

function angle(center, p1) {
    var p0 = {
        x: center.x, y: center.y - Math.sqrt(Math.abs(p1.x - center.x) * Math.abs(p1.x - center.x)
                + Math.abs(p1.y - center.y) * Math.abs(p1.y - center.y))
    };
    return (2 * Math.atan2(p1.y - p0.y, p1.x - p0.x)) * 180 / Math.PI;
}