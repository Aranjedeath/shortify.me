app.controller('urlStatistics', function($scope, $rootScope, $http) {
    
    $rootScope.notStatisticsView = true;
    $rootScope.textUrlStatistics = "Inspect a Shortify URL";
    
    //x
    $rootScope.labels = [];
    //Casistiche
    $rootScope.series = [];
    //y
    $rootScope.data = [];
    
    /**Funzione per la richiesta delle informazioni riguardanti uno
    specifico shorturl e la visualizzazione del grafuico associato*/
    $rootScope.showStatistics = function(urlforstat) {
        if (urlforstat == null) {
            return; //Campo non avvalorato
        } else {
            if($rootScope.notStatisticsView) {
                
                //Richiesta delle informazioni associate ad uno specifico shorturl
                $http.post("http://localhost:4567/api/v1/stats", {shorturl: urlforstat})
                .success(function(response) {
                    
                    
                    //Ottengo dati per statistiche dalla response
                    var hourCounters = response.hourCounters;
                    $scope.uniqueCounter = response.uniqueCounter;
                    var countryCounters = response.countryCounters;
                    dayCounters = response.dayCounters;
                    
                    /*console.log(hourCounters);
                    console.log(uniqueCounter);
                    console.log(countryCounters);
                    console.log(dayCounters);*/
                    
                    
                    //BAR CHART statistiche intervalli orari
                    var labels = Object.keys(hourCounters).sort();
                    var perHour = [];   //Visite per ora
                    
                    //Riepimento delle liste di valori per la rappresentazione grafica
                    for (var i = 0; i < labels.length; i++) {
                        perHour.push(hourCounters[labels[i]]);
                    }
                    
                    //Dati utili per il grafico canvas
                    $rootScope.labels = labels;
                    $rootScope.series = ['Hour'];
                    $rootScope.data = [perHour];
                    
                   
                    //TABELLA VISITE GIORNALIERE
                    var days = Object.keys(dayCounters).reverse();
                    for (var i = 0; i < days.length; i++) {
                        var count = dayCounters[days[i]];
                        var table = document.getElementById("days-table-rows");
                        var row = table.insertRow(i);
                        row.setAttribute("class", "success");
                        var d = row.insertCell(0);
                        var v = row.insertCell(1);

                        d.innerHTML = days[i];
                        v.innerHTML = count;
                    }
                    
                    //TABELLA VISITE PER NAZIONE
                    var countries = Object.keys(countryCounters);
                    for (var i = 0; i < countries.length; i++) {
                        var count = countryCounters[countries[i]];
                        var table = document.getElementById("country-table-rows");
                        var row = table.insertRow(i);
                        row.setAttribute("class", "success");
                        var c = row.insertCell(0);
                        var v = row.insertCell(1);
                        
                        if (countries[i] != "NULL") {
                            c.innerHTML = '<span class="flag-icon flag-icon-' + 
                                countries[i].toLowerCase() + '"></span>';
                            v.innerHTML = count;
                            
                        } else {
                            c.innerHTML = "UNDEFINED";
                            v.innerHTML = count;
                            
                        }
                    }
                    
                    
                    
                })    
                .error(function(response) {
                    console.log("Error");
                    
                });
                
                
                $rootScope.notStatisticsView = false;
                document
                    .getElementById("container")
                    .setAttribute("class", "centered-statistics-view animated fadeIn");
                
            } else {
                //PULIZIA ELIMINANDO RIGHE AGGIUNTE ALLE TABELLE
                var countryTableRows = document.getElementById("country-table-rows");
                while (countryTableRows.firstChild) {
                    countryTableRows.removeChild(countryTableRows.firstChild);
                }
                
                var daysTableRows = document.getElementById("days-table-rows");
                while (daysTableRows.firstChild) {
                    daysTableRows.removeChild(daysTableRows.firstChild);
                }
                
                $rootScope.notStatisticsView = true;
                document
                    .getElementById("container")
                    .setAttribute("class", "centered animated fadeIn");
            
            }
            
        }
    }
    
});