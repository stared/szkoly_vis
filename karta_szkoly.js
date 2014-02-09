var dane = [];
var wybraneId = 0;
var wybranaDana = {};
var mult, skala;

d3.json("gim_bb.json", function (error, data) {
  dane = data;
  wybranaDana = data[wybraneId];
  init();
  update();
});

function init () {

  d3.select("div#wybor select#szkola")
    .on("change", function () {
      wybraneId = parseInt(this.value, 10);
      wybranaDana = dane[wybraneId];
      update();
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
    .attr("id", "xx")
    .attr("fill", "#f88")
    .attr("height", 20);

  demog.append("rect")
    .attr("id", "xy")
    .attr("fill", "#88f")
    .attr("height", 20);

  mult = 3;
  skala = d3.scale.linear()
    .domain([100 - 100/mult, 100 + 100/mult])
    .range([0, 200]);

  porownania = d3.select("div#porownania").append("svg")
    .attr("width", 200)
    .attr("height", 200)
      .selectAll('ellipse')
      .data(dane);
      

  kolejnosc_hum = range(dane.length).sort(function (i, j) {
    return - dane[i].sr_wynik_egz_hum + dane[j].sr_wynik_egz_hum; });
  kolejnosc_hum = reverse_permutation(kolejnosc_hum);

  paskownia_hum = d3.select("div#porownania_paski").append("svg")
    .attr("width", 200)
    .attr("height", 500)
      .selectAll('rect');

}


function update () {

  console.log(wybranaDana);

  if (wybranaDana.procent_dziewczat != null) {
    demog.selectAll('rect')
      .style('opacity', 1);

    demog.select("#xx")
      .attr("width", wybranaDana.procent_dziewczat);
  
    demog.select("#xy")
      .attr("x", wybranaDana.procent_dziewczat)
      .attr("width", (100 - wybranaDana.procent_dziewczat));
  } else {
    demog.selectAll('rect')
      .style('opacity', 0);
  }

  porownania.enter()
    .append('ellipse')
      .attr("cx", function (d) { return skala(d.sr_wynik_egz_hum); })
      .attr("cy", function (d) { return skala(d.sr_wynik_egz_mp); })
      .attr("rx", function (d) { return mult * d.bs_sr_wynik_egz_hum; })
      .attr("ry", function (d) { return mult * d.bs_sr_wynik_egz_hum; })
      .style("fill", function (d, i) {
        return i == wybraneId ? "#a00" : "#0a0";
      })
      .style("opacity", 0.1);

  paskownia_hum = d3.select("div#porownania_paski svg").selectAll('rect')
    .data(dane);

  paskownia_hum
    .enter()
      .append('rect');

  paskownia_hum
    .attr("x", function (d) { return skala(d.sr_wynik_egz_hum - d.stdev_wynik_egz_hum); })
    .attr("y", function (d, i) { return 10 * kolejnosc_hum[i]; } )
    .attr("width", function (d) { return 2 * mult * d.stdev_wynik_egz_hum; })
    .attr("height", 8)
    .style("fill", function (d, i) {
      return i == wybraneId ? "#a55" : "#5a5";
    })
    .style("opacity", 0.5);

  paskownia_hum.exit().remove();

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