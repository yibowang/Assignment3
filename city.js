
var margin = 20,
    diameter = 960;

var color = d3.scale.linear()
    .domain([-1, 8])
    .range(["rgb(255,255,255)", "rgb(128,128,0)"])
    .interpolate(d3.interpolateHcl);

var pack = d3.layout.pack()
    .padding(2)
    .size([diameter - margin, diameter - margin])
    .value(function(d) { return d.value; })

var svg = d3.select("body").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .append("g")
    .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

d3.json("city.json", function(error, root) {
    if (error) return console.error(error);

    var focus = root;
    var      nodes = pack.nodes(root),
        view;
    console.log(view) ;
    var circle = svg.selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root";
        })
        .style("fill", function(d) { return d.children ? color(d.depth) : null; })
        .on("mouseover",function(d,i){
            d3.select(this)
                .style("fill","yellow");
        })
        .on("mouseout",function(d,i){
            d3.select(this)
                .style("fill", function(d) { return d.children ? color(d.depth) : null; })
        })
        .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });
    console.log();
    var text = svg.selectAll("text")
        .data(nodes)
        .enter().append("text")
        .attr("class", "label")
        .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
        .style("display", function(d) { return d.parent === root ? null : "none"; })
        .text(function(d) { return d.name+d.value+"亿"; });

    var node = svg.selectAll("circle,text");

    d3.select("body")
        .style("background", color(-1))
        .on("click", function() { zoom(root); });

    zoomTo([root.x, root.y, root.r * 2 + margin]);

    function zoom(d) {
        var focus0 = focus; focus = d;

        var transition = d3.transition()
            .duration(d3.event.altKey ? 7500 : 750)
            .tween("zoom", function(d) {
                var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
                return function(t) { zoomTo(i(t)); };
            });

        transition.selectAll("text")
            .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
            .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
            .each("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
            .each("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
    }

    function zoomTo(v) {
        var k = diameter / v[2]; view = v;
        node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
        circle.attr("r", function(d) { return d.r * k; });
    }
});

d3.select(self.frameElement).style("height", diameter+"px");
