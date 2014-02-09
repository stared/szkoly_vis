var dane = [];

d3.json("gim_bb.json", function (error, data) {
  dane = data;
  main(); });

function main(){
  console.log(dane);
  d3.select("div#wybor select#szkola").selectAll("option")
    .data(dane)
    .enter()
      .append("option")
        .attr("value", function (d, i) { return i; } )
        .text(function (d) {return d.nazwa; });

  
}