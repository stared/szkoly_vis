var dane = [];
var wybrane = 0;

d3.json("gim_bb.json", function (error, data) {
  dane = data;
  main();
});

function main () {

  d3.select("div#wybor select#szkola")
    .on("change", function () {
      wybrane = parseInt(this.value, 10);
      main();
      // update();
    })
    .selectAll("option")
    .data(dane)
    .enter()
      .append("option")
        .attr("value", function (d, i) { return i; } )
        .text(function (d) {return d.nazwa; });

  demog = d3.select("div#demografia").append("svg")
    .attr("width", 100)
    .attr("height", 20);

  demog.append("rect")
    .attr("fill", "#f00")
    .attr("width", dane[wybrane].procent_dziewczat)
    .attr("height", 20);

  demog.append("rect")
    .attr("fill", "#00f")
    .attr("x", dane[wybrane].procent_dziewczat)
    .attr("width", (100 - dane[wybrane].procent_dziewczat))
    .attr("height", 20);

  var mult = 3;
  var skala = d3.scale.linear()
    .domain([100 - 100/mult, 100 + 100/mult])
    .range([0, 200]);

  porownania = d3.select("div#porownania").append("svg")
    .attr("width", 200)
    .attr("height", 200)
      .selectAll('ellipse')
      .data(dane)
      .enter()
        .append('ellipse')
          .attr("cx", function (d) { return skala(d.sr_wynik_egz_hum); })
          .attr("cy", function (d) { return skala(d.sr_wynik_egz_mp); })
          .attr("rx", function (d) { return mult * d.bs_sr_wynik_egz_hum; })
          .attr("ry", function (d) { return mult * d.bs_sr_wynik_egz_hum; })
          .style("fill", function (d, i) {
            return i == wybrane ? "#a00" : "#0a0";
          })
          .style("opacity", 0.1);

  kolejnosc_hum = range(dane.length).sort(function (i, j) {
    return - dane[i].sr_wynik_egz_hum + dane[j].sr_wynik_egz_hum; });
  kolejnosc_hum = reverse_permutation(kolejnosc_hum);

  porownania2 = d3.select("div#porownania2").append("svg")
    .attr("width", 200)
    .attr("height", 500)
      .selectAll('ellipse')
      .data(dane)
      .enter()
        .append('rect')
          .attr("x", function (d) { return skala(d.sr_wynik_egz_hum - d.stdev_wynik_egz_hum); })
          .attr("y", function (d, i) { return 10 * kolejnosc_hum[i]; } )
          .attr("width", function (d) { return 2 * mult * d.stdev_wynik_egz_hum; })
          .attr("height", 8)
          .style("fill", function (d, i) {
            return i == wybrane ? "#a00" : "#0a0";
          })
          .style("opacity", 0.5);


}


function update () {

// 

}


function range (n) {
  var res = [];
  for (var i=0; i < n; i++) {
    res[i] = i;
  }
  return res;
}

function reverse_permutation (perm) {
  var res = [];
  for (var i=0; i < perm.length; i++) {
    res[perm[i]] = i;
  }
  return res;
}