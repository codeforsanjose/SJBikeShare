
// Specify number formats 
var formatPercent = d3.format("%");
var numberWithCommas = d3.format("0,f");

/* Define parameters */
var width = 850,
    height = 750,
    outerRadius = Math.min(width, height) / 2 - 100, // why?
    innerRadius = outerRadius - 22; // why?

// create arc path data generator for the groups
var arc = d3.svg.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

// create the chord path data generator for the chords
var path = d3.svg.chord()
  .radius(innerRadius);

// construct chord layout  
var layout = d3.layout.chord()
    .padding(.02)
 //   .sortSubgroups(d3.ascending)
 //   .sortChords(d3.ascending);

/*
var fill = d3.scale.ordinal()
    .domain(d3.range(4))
    .range(["#000000", "#FFDD89", "#957244", "#F26223"]);
*/

/*** Initialize the visualization ***/
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("id", "circle")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
// the entire graphic is drawn within this svg element
// all coordinates are relative to the center of the circle

svg.append("circle")
    .attr("r", outerRadius);

/*** Read in station data and create layout ***/

d3.csv("data/sj_stations_sorted.csv", function(stations) {    
    d3.json("data/sj_92trips_matrix_sorted.json", function(matrix) {
      /* Set input data matrix used by this layout. */
      layout.matrix(matrix);
      /* Create/update "group" elements */
      var group = svg.selectAll(".group")   
      .data(layout.groups)
      .enter().append("g")
      .attr("class", "group")
      .on("mouseover", mouseover);

      // Add mouseover title
      group.append("title").text(function(d,i) {
        return numberWithCommas(d.value)
          + " trips started from "
          + stations[i].name;
        });

    // Add the group arc
    var groupPath = group.append("path")
      .attr("id", function (d,i) {
        return "group" + d.index;
      })
      .attr("d", arc)
      .style("fill", function(d, i) {
        return stations[i].color; 
      });
  
    // Add group labels
    var groupText = group.append("text")
      .attr("xlink:href", function (d) {
        return "#group" + d.index;
      })
      .attr("dy", ".37em")
      .attr("color", "#909090")
      .text(function(d) {
        return stations[d.index].name;
      });

    // position group labels
    group.select("text")
      .transition()
      .duration(1500)
      .attr("transform", function(d) {
        d.angle = (d.startAngle + d.endAngle) / 2;
       //store the midpoint angle in the data object
                
        return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" +
             " translate(" + (innerRadius + 26) + ")" + 
             (d.angle > Math.PI ? " rotate(180)" : " rotate(0)"); 

//include the rotate zero so that transforms can be interpolated
            })
       .attr("text-anchor", function (d) {
                return d.angle > Math.PI ? "end" : "begin";
        });

// Create  the chord paths 

    var chord = svg.selectAll(".chord")
      .data(layout.chords)
      .enter().append("path")
      .attr("class", "chord")
      .style("fill", function (d) {
        return stations[d.source.index].color;})
      .attr("d", path);


   // Update all chord title texts
    chord.append("title").text(function(d) {
            if (stations[d.target.index].name !== stations[d.source.index].name) {
                return [numberWithCommas(d.source.value),
                        " trips from ",
                        stations[d.source.index].name,
                        " to ",
                        stations[d.target.index].name,
                        "\n",
                        numberWithCommas(d.target.value),
                        " trips from ",
                        stations[d.target.index].name,
                        " to ",
                        stations[d.source.index].name
                        ].join(""); 
            } 
            else { //source and target are the same
                return numberWithCommas(d.source.value) 
                    + " trips started and ended in " 
                    + stations[d.source.index].name;
            }
        });

        function mouseover(d, i) {
          chord.classed("fade", function(p) {
          return p.source.index != i
              && p.target.index != i;
          });
        }
  });
});
