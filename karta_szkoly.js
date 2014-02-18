var dane = [];
var wybraneId = 0;
var wybranaDana = {};
var mult, skala;
var tooltip;

d3.json("gim_bb.json", function (error, data) {
  dane = data;
  init();
  update();
});

function init () {

  tooltip = d3.select('div.tooltip');

  d3.select("div#wybor select#szkola")
    .on("change", function () {
      wybraneId = parseInt(this.value, 10);
      update();
    })
    .selectAll("option")
    .data(dane)
    .enter()
      .append("option")
        .attr("value", function (d, i) { return i; } )
        .text(function (d) {return d.nazwa; });

  // demog = d3.select("div#demografia").append("svg")
  //   .attr("width", 100)
  //   .attr("height", 20);

  // demog.append("rect")
  //   .attr("id", "xx")
  //   .attr("fill", "#f88")
  //   .attr("height", 20);

  // demog.append("rect")
  //   .attr("id", "xy")
  //   .attr("fill", "#88f")
  //   .attr("height", 20);

  mult = 3;
  skala = d3.scale.linear()
    .domain([100 - 100/mult, 100 + 100/mult])
    .range([0, 200]);

  var xAxis = d3.svg.axis()
    .scale(skala)
    .orient("bottom")
    .ticks(6)
    .tickSize(1);
    // .tickFormat(d3.format(".2g"));

  porownania = d3.select("div#porownania").append("svg")
    .attr("width", 400)
    .attr("height", 200);
      

  kolejnosc_hum = range(dane.length).sort(function (i, j) {
    return - dane[i].sr_wynik_egz_hum + dane[j].sr_wynik_egz_hum; });
  kolejnosc_hum = reverse_permutation(kolejnosc_hum);

  d3.select("div#porownania_paski_hum").append("svg")
    .attr("width", 210)
    .attr("height", 220)
      .append('g')
        .attr('class', 'osx')
        .attr("transform", "translate(" + 0 + "," + 200 + ")")
        .call(xAxis);

  kolejnosc_mp = range(dane.length).sort(function (i, j) {
    return - dane[i].sr_wynik_egz_mp + dane[j].sr_wynik_egz_mp; });
  kolejnosc_mp = reverse_permutation(kolejnosc_mp);

  d3.select("div#porownania_paski_mp").append("svg")
    .attr("width", 210)
    .attr("height", 220)
      .append('g')
        .attr('class', 'osx')
        .attr("transform", "translate(" + 0 + "," + 200 + ")")
        .call(xAxis);

  wskaznik_hum = new widget_wskaznik("#wskazniki #hum", "Egz. humanistyczny");
  wskaznik_mp = new widget_wskaznik("#wskazniki #mp", "Egz. mat-przyr.");
  wskaznik_ewd_hum = new widget_wskaznik_ewd("#wskazniki #ewd_hum", "EWD hum.");
  wskaznik_ewd_mp = new widget_wskaznik_ewd("#wskazniki #ewd_mp", "EWD m.-p.");

  w_czasie = new wynikiWLatach("#w_czasie");

}



function update () {

  wybranaDana = dane[wybraneId];

  d3.select("#adres #nazwa").html(wybranaDana.nazwa);
  d3.select("#adres #adres").html(wybranaDana.adres);
  d3.select("#adres #kod_pocztowy").html(wybranaDana.pna);
  d3.select("#adres #poczta").html(wybranaDana.poczta);
  d3.select("#adres #www")
    .attr('href', wybranaDana.www)
    .html(wybranaDana.www);
  d3.select("#adres #tel").html(wybranaDana.telefon);

  d3.select("#plakietki").html(plakietki(wybranaDana));

  d3.select("#demografia #uczniowie").html("Liczba uczniów: " + (wybranaDana.liczba_uczniow || "(brak danych)"));
  d3.select("#demografia #klasy").html("Liczba klas: " + (wybranaDana.oddzialy  || "(brak danych)"));
  if (wybranaDana.liczba_uczniow != null) {
    d3.select("#demografia #wielkosc_klasy").html("Śr. wielkość klasy: " + (wybranaDana.liczba_uczniow/wybranaDana.oddzialy).toFixed(1));
    // d3.select("#demografia #dziewczeta").html("Dziewcząt: " + wybranaDana.procent_dziewczat.toFixed(1) + "%");
    // d3.select("#demografia #chlopcy").html("Chłopców: " + (100 - wybranaDana.procent_dziewczat).toFixed(1) + "%");
  } else {
    d3.select("#demografia #wielkosc_klasy").html("Śr. wielkość klasy: (brak danych)");
    // d3.select("#demografia #dziewczeta").html("Dziewcząt: (brak danych)");
    // d3.select("#demografia #chlopcy").html("Chłopcy: (brak danych)");
  }

  // if (wybranaDana.procent_dziewczat != null) {

  //   demog.select("#xx").transition().duration(500)
  //     .style("opacity", 1)
  //     .attr("width", wybranaDana.procent_dziewczat);
  
  //   demog.select("#xy").transition().duration(500)
  //     .style("opacity", 1)
  //     .attr("x", wybranaDana.procent_dziewczat)
  //     .attr("width", (100 - wybranaDana.procent_dziewczat));
  // } else {
  //   demog.selectAll('rect').transition().duration(500)
  //     .style("opacity", 0);
  // }

  porownania = d3.select("div#porownania svg").selectAll('ellipse').data(dane);

  var skala2d = d3.scale.linear()
    .domain([100 - 100/3, 100 + 100/3])
    .range([0, 400]);

  porownania.enter()
    .append('ellipse')
      .attr('class', 'pasek')
      .attr("cx", function (d) { return skala2d((d.sr_wynik_egz_hum + d.sr_wynik_egz_mp)/2); })
      .attr("cy", function (d) { return -skala2d(d.sr_wynik_egz_hum - d.sr_wynik_egz_mp) +  skala2d(0) + 50; })
      .attr("rx", function (d) { return 5; })
      .attr("ry", function (d) { return 5; })
      .style("opacity", 0.3);

  porownania
    .style("fill", function (d, i) {
      return i == wybraneId ? "#a00" : "#0a0";
    })
    .on('mouseover', function (d) {
      var wklad = d.nazwa + "<br>" +
        "Śr. wyniku z obu egzaminów:</br>" +
        ((d.sr_wynik_egz_hum + d.sr_wynik_egz_mp)/2).toFixed(1) + "<br>" +
        "Różnica wyniku hum. względem mat.-przyr.:<br>" +
        (d.sr_wynik_egz_hum - d.sr_wynik_egz_mp).toFixed(1);
      tooltipShow(wklad);
    })
    .on('mouseout', function () { tooltipOut(); })
    .on('click', function (d, i) {
      wybraneId = i;
      update();
    });

  //
  // Wyniki human
  //

  paskownia_hum = d3.select("div#porownania_paski_hum svg").selectAll('rect')
    .data(dane);

  paskownia_hum
    .enter()
      .append('rect')
        .attr('class', 'pasek');

  var odl_paskowa = 200 / Math.max(dane.length, 20);

  paskownia_hum
    .attr("x", function (d) { return skala(d.sr_wynik_egz_hum - d.stdev_wynik_egz_hum); })
    .attr("y", function (d, i) { return odl_paskowa * kolejnosc_hum[i]; } )
    .attr("width", function (d) { return 2 * mult * d.stdev_wynik_egz_hum; })
    .attr("height", 0.8 * odl_paskowa)
    .style("fill", function (d, i) {
      return i == wybraneId ? "#a55" : "#5a5";
    })
    .on('mouseover', function (d) {
      var wklad = d.nazwa + "<br>" +
        "Śr. wynik: " +  d.sr_wynik_egz_hum.toFixed(1) + "<br>" +
        "Ponad połowa uczniów w przedziale:<br>od " +
        (d.sr_wynik_egz_hum - d.stdev_wynik_egz_hum).toFixed(1) + " do " +
        (d.sr_wynik_egz_hum  +d.stdev_wynik_egz_hum).toFixed(1);
      tooltipShow(wklad);
    })
    .on('mouseout', function () { tooltipOut(); })
    .on('click', function (d, i) {
      wybraneId = i;
      update();
    });

  paskownia_hum.exit().remove();

  //
  // Wyniki matematyczno-przyrodnicze
  //

  paskownia_mp = d3.select("div#porownania_paski_mp svg").selectAll('rect')
    .data(dane);

  paskownia_mp
    .enter()
      .append('rect')
        .attr('class', 'pasek');

  var odl_paskowa = 200 / Math.max(dane.length, 20);

  paskownia_mp
    .attr("x", function (d) { return skala(d.sr_wynik_egz_mp - d.stdev_wynik_egz_mp); })
    .attr("y", function (d, i) { return odl_paskowa * kolejnosc_mp[i]; } )
    .attr("width", function (d) { return 2 * mult * d.stdev_wynik_egz_mp; })
    .attr("height", 0.8 * odl_paskowa)
    .style("fill", function (d, i) {
      return i == wybraneId ? "#a55" : "#5a5";
    })
    .on('mouseover', function (d) {
      var wklad = d.nazwa + "<br>" +
        "Śr. wynik: " +  d.sr_wynik_egz_mp.toFixed(1) + "<br>" +
        "Ponad połowa uczniów w przedziale:<br>od " +
        (d.sr_wynik_egz_mp - d.stdev_wynik_egz_mp).toFixed(1) + " do " +
        (d.sr_wynik_egz_mp + d.stdev_wynik_egz_mp).toFixed(1);
      tooltipShow(wklad);
    })
    .on('mouseout', function () { tooltipOut(); })
    .on('click', function (d, i) {
      wybraneId = i;
      update();
    });

  paskownia_mp.exit().remove();

  //
  // Wskaźniki
  //
  wskaznik_hum.uaktualnij(wybranaDana.sr_wynik_egz_hum);
  wskaznik_mp.uaktualnij(wybranaDana.sr_wynik_egz_mp);
  wskaznik_ewd_hum.uaktualnij(wybranaDana.ewd_min90_hum, wybranaDana.ewd_max90_hum);
  wskaznik_ewd_mp.uaktualnij(wybranaDana.ewd_min90_mp, wybranaDana.ewd_max90_mp);

  w_czasie.uaktualnij(wybranaDana.wyniki_z_lat);

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

function plakietki (d) {
  var res = [];

  if (d.typ_szkoly == "gimn.") {
    res.push("<span class='plakietka'>gimnazjum</span>");
  } else if (d.typ_szkoly == "SP") {
    res.push("<span class='plakietka'>szkoła podstawowa</span>");
  }

  if (d.publiczna === false) {
    res.push("<span class='plakietka'>szkoła prywatna</span>");
  }
  if (d.dla_doroslych === true) {
    res.push("<span class='plakietka'>szkoła dla dorosłych</span>");
  }
  if (d.specjalna === true) {
    res.push("<span class='plakietka'>szkoła specjalna</span>");
  }
  if (d.przyszpitalna === true) {
    res.push("<span class='plakietka'>szkoła przyszpitalna</span>");
  }

  if (d.procent_dziewczat != null) {
    if (d.procent_dziewczat > 99) {
      res.push("<span class='plakietka'>szkoła żeńska</span>");
    } else if (d.procent_dziewczat < 1) {
      res.push("<span class='plakietka'>szkoła męska</span>");
    }
  }

  if (d.sr_wynik_egz_obu_gwiazdki_pow == 4) {
    res.push("<span class='plakietka'>szkoła b. dobra</span>");
  } else if (d.sr_wynik_egz_obu_gwiazdki_pow == 5) {
    res.push("<span class='plakietka'>szkoła wybitna</span>");
  }
  // też braki wyników itd?

  return res.join("</br></br>\n");
}


function widget_wskaznik (selector, nazwa) {

  var zakres = [60, 140];

  this.etykieta = d3.select(selector).append("span");
  d3.select(selector).append("br");
  d3.select(selector).append("br");
  this.nazwa = nazwa;

  this.svg = d3.select(selector).append("svg")
    .attr("width", 150)
    .attr("height", 20);

  this.skala = d3.scale.linear()
    .domain(zakres)
    .range([0, 150]);

  this.kolorki = d3.scale.linear()
    .domain([zakres[0], 100, zakres[1]])
    .range(['#faa', '#fff', '#afa']);

  var skala = this.skala;
  var kolorki = this.kolorki;

  this.svg.selectAll('.tlo')
    .data([60,70,80,90,100,110,120,130])
    .enter()
      .append('rect')
        .attr('class', 'tlo')
        .attr('x', function (d, i) { return skala(d); })
        .attr('y', 0)
        .attr('width', skala(10) - skala(0))
        .attr('height', 10)
        .style('fill', function (d, i) { return kolorki(d + 5); });

  this.svg.append('rect')
    .attr('class', 'wskaznik')
    .attr('x', this.skala(100))
    .attr('y', 0)
    .attr('width', 2)
    .attr('height', 10)
    .style('fill','#000');

  this.uaktualnij = function (wartosc) {

    if (wartosc != null) {

      this.etykieta.html(this.nazwa + ": " + wartosc.toFixed(1));

      this.svg.select(".wskaznik")
        .transition().duration(500)
          .style('opacity', 1)
          .attr('x', this.skala(wartosc));
    } else {

      this.etykieta.html(this.nazwa + ": (brak danych)");

      this.svg.select(".wskaznik")
        .transition().duration(500)
          .style('opacity', 0);
    }
  };
}


function widget_wskaznik_ewd (selector, nazwa) {

  var zakres = [-10, 10];

  this.etykieta = d3.select(selector).append("span");
  d3.select(selector).append("br");
  d3.select(selector).append("br");
  this.nazwa = nazwa;

  this.svg = d3.select(selector).append("svg")
    .attr("width", 150)
    .attr("height", 20);

  this.skala = d3.scale.linear()
    .domain(zakres)
    .range([0, 150]);

  this.kolorki = d3.scale.linear()
    .domain([zakres[0], 0, zakres[1]])
    .range(['#faa', '#fff', '#afa']);

  var skala = this.skala;
  var kolorki = this.kolorki;

  this.svg.selectAll('.tlo')
    .data([-10,-7.5,-5,-2.5,0,2.5,5,7.5])
    .enter()
      .append('rect')
        .attr('class', 'tlo')
        .attr('x', function (d, i) { return skala(d); })
        .attr('y', 0)
        .attr('width', skala(2.5) - skala(0))
        .attr('height', 10)
        .style('fill', function (d, i) { return kolorki(d + 2.5); });

  this.svg.append('rect')
    .attr('class', 'wskaznik')
    .attr('x', this.skala(100))
    .attr('y', 0)
    .attr('width', 2)
    .attr('height', 10)
    .style('fill','#000');

  this.uaktualnij = function (wartosc1, wartosc2) {

    if (wartosc1 != null) {

      this.etykieta.html(this.nazwa + ": od " + wartosc1.toFixed(1) + " do " + wartosc2.toFixed(1));

      this.svg.select(".wskaznik")
        .transition().duration(500)
          .style('opacity', 0.5)
          .attr('x', this.skala(wartosc1))
          .attr('width', this.skala(wartosc2) - this.skala(wartosc1));
    } else {

      this.etykieta.html(this.nazwa + ": (brak danych)");

      this.svg.select(".wskaznik")
        .transition().duration(500)
          .style('opacity', 0);
    }
  };
}


function wynikiWLatach (selektor) {

  this.svg = d3.select(selektor).append("svg")
    .attr("width", 400)
    .attr("height", 250);

  var skalaCzas = d3.time.scale()
    .domain([new Date(2002, 0, 1), new Date(2013, 0, 1)])
    .range([0, 250]);

  var skalaWynik = d3.scale.linear()
    .domain([100 - 100/2, 100 + 100/2])
    .range([200, 0]);

  var xAxis = d3.svg.axis()
    .scale(skalaCzas)
    .orient("bottom")
    // .ticks(6)
    .tickSize(1);
    // .tickFormat(d3.format(".2g"));

  var yAxis = d3.svg.axis()
    .scale(skalaWynik)
    .orient("left")
    .ticks(6)
    .tickSize(1);
    // .tickFormat(d3.format(".2g"));
      

  this.svg
    .append('g')
      .attr('class', 'os_x')
      .attr("transform", "translate(" + 40 + "," + 200 + ")")
      .call(xAxis)
    .selectAll("text")
      .attr("y", 0)
      .attr("x", 9)
      .attr("dy", ".35em")
      .attr("transform", "rotate(90)")
      .style("text-anchor", "start");

  this.svg
    .append('g')
      .attr('class', 'os_y')
      .attr("transform", "translate(" + 40 + "," + 0 + ")")
      .call(yAxis);

  this.sciezki = this.svg.append('g')
      .attr('class', 'sciezki')
      .attr("transform", "translate(" + 40 + "," + 0 + ")")

  this.sciezka_hum =  this.sciezki.append("path")
    .attr("class", "sciezka_hum");

  this.sciezka_mp =  this.sciezki.append("path")
    .attr("class", "sciezka_mp");

  this.uaktualnij  = function (wyniki_z_lat) {

    var sciezka_hum_punkty = d3.svg.area()
      .x(function(d) { return skalaCzas(new Date(d.rok, 0)); })
      .y0(function(d) {
        if (d.rok < 2012) {
          return skalaWynik(d.gh.egz_norm_sr - d.gh.egz_norm_std);
          // a tylko niepewnosc pomaru? tj. dzielic przez Math.sqrt(d.gh.probka - 1)
        } else {
          return skalaWynik((d.gh_h.egz_norm_sr + d.gh_p.egz_norm_sr)/2 - (d.gh_h.egz_norm_std + d.gh_p.egz_norm_std)/2);
        }
      })
      .y1(function(d) {
        if (d.rok < 2012) {
          return skalaWynik(d.gh.egz_norm_sr + d.gh.egz_norm_std);
        } else {
          return skalaWynik((d.gh_h.egz_norm_sr + d.gh_p.egz_norm_sr)/2 + (d.gh_h.egz_norm_std + d.gh_p.egz_norm_std)/2);
        }
      });

    this.sciezka_hum
      .datum(wyniki_z_lat.filter(function (d) {return d.gh || d.gh_h;}))
      // .transition().duration(500)
      .attr("d", sciezka_hum_punkty);

    var sciezka_mp_punkty = d3.svg.area()
      .x(function(d) { return skalaCzas(new Date(d.rok, 0)); })
      .y0(function(d) {
        if (d.rok < 2012) {
          return skalaWynik(d.gm.egz_norm_sr - d.gm.egz_norm_std);
        } else {
          return skalaWynik((d.gm_m.egz_norm_sr + d.gm_p.egz_norm_sr)/2 - (d.gm_m.egz_norm_std + d.gm_p.egz_norm_std)/2);
        }
      })
      .y1(function(d) {
        if (d.rok < 2012) {
          return skalaWynik(d.gm.egz_norm_sr + d.gm.egz_norm_std);
        } else {
          return skalaWynik((d.gm_m.egz_norm_sr + d.gm_p.egz_norm_sr)/2 + (d.gm_m.egz_norm_std + d.gm_p.egz_norm_std)/2);
        }
      });

    this.sciezka_mp
      .datum(wyniki_z_lat.filter(function (d) {return d.gm || d.gm_m;}))
      // .transition().duration(500)
      .attr("d", sciezka_mp_punkty);

  };
 
}


function tooltipShow  (html) {
  tooltip.style("opacity", 0.8)
    .style("left", (d3.event.pageX + 15) + "px")
    .style("top", (d3.event.pageY + 8) + "px")
    .html(html);
}

function tooltipOut () {
    tooltip.style("opacity", 1e-6);
}
