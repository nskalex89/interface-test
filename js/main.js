function normalDistribution(mean, sd) {
    var g = (Math.random() * 2 - 1) + (Math.random() * 2 - 1) + (Math.random() * 2 - 1);
    return Math.abs(g * sd + mean);
}

function expDistribution(lambda) {
    return Math.abs(-(1 / lambda) * Math.log(Math.random()));
}

function maxInArray(n) {
    var max = -Infinity;
    for (var i = 0; i < n.length; i++) {
        if (n[i] > max) max = n[i];
    }
    return max;
}

function minInArray(n) {
    var min = Infinity;
    for (var i = 0; i < n.length; i++) {
        if (n[i] < min) min = n[i];
    }
    return min;
}

function sumAllArrayElementsExceptLast(n) {
    var sum = 0;
    for (var i = 0; i < n.length - 1; i++) {
        sum += n[i];
    }
    return sum;
}

function sumAllArrayElements(n) {
    var sum = 0;
    for (var i = 0; i < n.length; i++) {
        sum += n[i];
    }
    return sum;
}

function printObject(obj) {
    var result = "";

    for (var key in obj) {
        result += key + " = " + obj[key] + "<br>";
    }

    return result;
}

function getTime(vertex) {
    switch (vertex.time.distribution) {
        case "Constant":
            return vertex.time.value;
        case "Normal":
            return normalDistribution(vertex.time.mean, vertex.time.sd);
        case "Exp":
            return expDistribution(vertex.time.lambda);
    }
}

function getFailureProbability(vertex) {
    var epsilon = 0.0001;
    switch (vertex.failure.distribution) {
        case "Constant":
            return vertex.failure.value;
        case "Normal":
            return normalDistribution(vertex.failure.mean, vertex.failure.sd) / (3 * vertex.failure.sd);
        case "Exp":
            return (expDistribution(vertex.failure.lambda) / (-Math.log(epsilon) / vertex.failure.lambda));
    }
}

function getVertexById(id, vertices) {
    for (var i = 0; i < vertices.length; i++) {
        if (vertices[i].id == id) {
            return vertices[i];
        }
    }
}

function getRoute(r, sp) {
    var len = sp.length;
    var intervalDivides = new Array(len + 1);
    intervalDivides[0] = 0;

    var sum = 0;
    for (var i = 0; i < len; i++) {
        sum += sp[i];
        intervalDivides[i + 1] = sum;

        if (r > intervalDivides[i] && r < intervalDivides[i + 1]) return i;
    }
}

$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "xml/TestCases.xml",
        dataType: "xml",
        success: function(xml) {
            var caseCounter = 0;

            $(xml).find("case").each(function() {
                var n = parseInt($(this).attr("n"));
                var selectionProbabilities;
                var routes;
                var vertices;
                var solvingTime = new Array(n);
                var averageSolvingTime;

                caseCounter++;

                $("div.main").append('<div class="container" id="container' + caseCounter + '">' +
                        '<h2>Тест №' + caseCounter + '</h2>' +
                        '<div class="input-data" id="input-data' + caseCounter + '">' +
                        '<p>N = ' + n + '</p>' +
                        '<h3>Матрица маршрутов</h3>' +
                        '<table id="route-matrix' + caseCounter + '"><tbody></tbody></table>' +
                        '<h3>Вероятности выбора маршрутов</h3>' +
                        '<table id="selection-probability' + caseCounter + '"><tbody><tr id="rn"><td>№ маршрута</td></tr><tr id="sp"><td>P<sub>выбора</sub></td></tr></tbody></table>' +
                        '<h3>Параметры вершин</h3>' +
                        '<table id="vertices' + caseCounter + '"><tbody><tr><td>Вершина</td><td>t</td><td>q</td><td>При ошибке</td></tr></tbody></table>' +
                        '</div>' +
                        '<h3>Среднее время выполнения маршрутов</h3>' +
                        '<table id="route-performing-average' + caseCounter + '"><tbody><tr id="rn"><td>№ маршрута</td></tr><tr id="pt"><td>t<sub>ср</sub></td></tr></tbody></table>' +
                        '<h3>Среднее время решения задачи</h3>' +
                        '<p id="average-solving-time' + caseCounter + '"></p>' +
                        '<h3>Гистограмма для времени решения задачи</h3>' +
                        '<div class="chart" id="chart' + caseCounter + '"></div>' +
                        '</div>');

                selectionProbabilities = new Array($(this).find("route").length);
                var routeCounter = 0;
                var routeNumber = $(this).find("route").length;
                routes = new Array(routeNumber);
                $(this).find("route").each(function() {
                    routeCounter++;

                    // вероятности выбора маршрутов
                    // если текущий маршрут последний и не является единственным
                    if (routeCounter == routeNumber && routeNumber != 1) {
                        selectionProbabilities[routeCounter - 1] =
                                Number(1 - sumAllArrayElementsExceptLast(selectionProbabilities));
                    } else {
                        selectionProbabilities[routeCounter - 1] = parseFloat($(this).attr("selectionProbability"));
                    }
                    $("#selection-probability" + caseCounter + " #rn").append("<td>" + routeCounter + "</td>");
                    $("#selection-probability" + caseCounter + " #sp").append("<td>" + selectionProbabilities[routeCounter - 1].toFixed(2) + "</td>");

                    $("#route-matrix" + caseCounter + " tbody").append('<tr id="r' + routeCounter + '"></tr>');

                    // матрица маршрутов
                    routes[routeCounter - 1] = new Array($(this).find("item").length);
                    var itemCount = 0;
                    $(this).find("item").each(function() {
                        itemCount++;

                        routes[routeCounter - 1][itemCount - 1] = parseInt($(this).attr("vertex"));
                        $("#route-matrix" + caseCounter + " #r" + routeCounter).append("<td>" +
                                routes[routeCounter - 1][itemCount - 1] + "</td>");
                    });
                });

                // параметры вершин
                vertices = new Array($(this).find("vertex").length);
                var vertexCount = 0;
                $(this).find("vertex").each(function() {
                    vertexCount++;

                    var tmpTime;
                    switch ($(this).find("time").attr("distribution")) {
                        case "Constant":
                            tmpTime = {distribution: "Constant", value: parseFloat($(this).find("time").attr("value"))};
                            break;
                        case "Normal":
                            tmpTime = {distribution: "Normal", mean: parseFloat($(this).find("time").attr("mean")),
                                sd: parseFloat($(this).find("time").attr("sd"))};
                            break;
                        case "Exp":
                            tmpTime = {distribution: "Exp", lambda: parseFloat($(this).find("time").attr("lambda"))};
                            break;
                    }
                    var tmpFailure;
                    switch ($(this).find("failure").attr("distribution")) {
                        case "Constant":
                            tmpFailure = {distribution: "Constant", value: parseFloat($(this).find("failure").attr("value"))};
                            break;
                        case "Normal":
                            tmpFailure = {distribution: "Normal", mean: parseFloat($(this).find("failure").attr("mean")),
                                sd: $(this).find("failure").attr("sd")};
                            break;
                        case "Exp":
                            tmpFailure = {distribution: "Exp", lambda: parseFloat($(this).find("failure").attr("lambda"))};
                            break;
                    }

                    vertices[vertexCount - 1] = {id: parseInt($(this).attr("id")),
                        failureBehaviour: $(this).attr("failureBehaviour"),
                        time: tmpTime, failure: tmpFailure};

                    $("#vertices" + caseCounter + " tbody").append('<tr>' +
                            '<td>' + vertices[vertexCount - 1].id + '</td>' +
                            '<td>' + printObject(vertices[vertexCount - 1].time) + '</td>' +
                            '<td>' + printObject(vertices[vertexCount - 1].failure) + '</td>' +
                            '<td>' + vertices[vertexCount - 1].failureBehaviour + '</td>' +
                            '</tr>');
                });

                //среднее время выполнения маршрутов
                var routeCount = 0;
                $(routes).each(function() {
                    var sum = 0;

                    routeCount++;

                    for (var i = 0; i < n; i++) {
                        var vertexNumber = 0;

                        // обход вершин в маршруте
                        for (var j = 0; j < this.length; j++) {
                            //debugger;
                            var vertex = getVertexById(this[j], vertices);
                            sum += getTime(vertex);

                            var failurePtrobability = getFailureProbability(vertex);
                            // произошла ошибка
                            if (failurePtrobability > Math.random()) {
                                switch (vertex.failureBehaviour) {
                                    case "StayOnCurrentVertex":
                                        continue;
                                    case "GoToPreviousVertex":
                                        vertexNumber--;
                                        continue;
                                    case "GoToFirstVertex":
                                        vertexNumber = 0;
                                        continue;
                                }
                            } else {
                                vertexNumber++;
                            }
                        }
                    }
                    $("#route-performing-average" + caseCounter + " #rn").append("<td>" + routeCount + "</td>");
                    $("#route-performing-average" + caseCounter + " #pt").append("<td>" + (sum / n).toFixed(2) + "</td>");
                });

                // заполнение solvingTime
                for (var i = 0; i < n; i++) {
                    var tmp = 0;
                    // выбор маршрута
                    var route = routes[getRoute(Math.random(), selectionProbabilities)];

                    // обход вершин в маршруте
                    var vertexNumber = 0;
                    for (var j = 0; j < route.length; j++) {
                        var vertex = getVertexById(route[j], vertices);
                        tmp += getTime(vertex);

                        var failurePtrobability = getFailureProbability(vertex);
                        // произошла ошибка
                        if (failurePtrobability > Math.random()) {
                            switch (vertex.failureBehaviour) {
                                case "StayOnCurrentVertex":
                                    continue;
                                case "GoToPreviousVertex":
                                    vertexNumber--;
                                    continue;
                                case "GoToFirstVertex":
                                    vertexNumber = 0;
                                    continue;
                            }
                        } else {
                            vertexNumber++;
                        }
                    }
                    solvingTime[i] = tmp;
                }

                // среднее время решения задачи
                averageSolvingTime = sumAllArrayElements(solvingTime) / n;
                $("#average-solving-time" + caseCounter).append(averageSolvingTime.toFixed(2));

                // гистограмма
                var intervalCount = Math.floor(1 + 3.22 * Math.log(n));
                var histData = new Array(intervalCount);
                var min = minInArray(solvingTime);
                var max = maxInArray(solvingTime);
                var histStep = (max - min) / intervalCount;

                for (var i = 0; i < intervalCount; i++) {
                    histData[i] = new Array(i, 0);
                }

                var counter = 0;
                for (var i = min; i < max; i += histStep) {
                    for (var j = 0; j < solvingTime.length; j++) {
                        if (solvingTime[j] >= i && solvingTime[j] <= (i + histStep))
                            if (counter < intervalCount) histData[counter][1]++;
                    }
                    counter++;
                }

                $.plot($("#chart" + caseCounter), [
                    { data: histData, color: "green" }
                ],
                {
                    bars: { show: true, barWidth: 0.9, fill: 0.7 },
                    xaxis: { ticks: [], autoscaleMargin: 0.02 }
                });
            });
        }
    });
});