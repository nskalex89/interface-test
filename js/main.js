function normalDistribution(mean, sd) {
    var g = (Math.random() * 2 - 1) + (Math.random() * 2 - 1) + (Math.random() * 2 - 1);
    return Math.abs(g * sd + mean);
}

function expDistribution(lambda) {
    return -(1 / lambda) * Math.log(Math.random());
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

function printObject(obj) {
    var result = "";

    for (var key in obj) {
        result += key + " = " + obj[key] + "<br>";
    }

    return result;
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
                        '<table id="route-performing-average' + caseCounter + '"><tbody></tbody></table>' +
                        '<h3>Среднее время решения задачи</h3>' +
                        '<p id="average-solving-time"' + caseCounter + '></p>' +
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
                                (1 - sumAllArrayElementsExceptLast(selectionProbabilities)).toPrecision(2);
                    } else {
                        selectionProbabilities[routeCounter - 1] = parseFloat($(this).attr("selectionProbability"));
                    }
                    $("#selection-probability" + caseCounter + " #rn").append("<td>" + routeCounter + "</td>");
                    $("#selection-probability" + caseCounter + " #sp").append("<td>" + selectionProbabilities[routeCounter - 1] + "</td>");

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
            });

//            var routeCount = routes.length;
//            var routeMatrix = new Array(routeCount);
//            var n = 5000;
//            var solvingTime = new Array(n);
//
//            var i = 0;
//            routes.each(function() {
//                var vertexCount = $(this).find("vertex").length;
//
//                $("#root-matrix tbody").append('<tr>');
//                routeMatrix[i] = new Array(vertexCount);
//                var j = 0;
//                $(this).find("vertex").each(function() {
//                    $("#root-matrix tbody").append('<td>' + $(this).attr("id") + '</td>');
//                    routeMatrix[i][j] = parseFloat($(this).attr("id"));
//                    j++;
//                });
//                $("#root-matrix tbody").append('</tr>');
//                i++;
//            });
//
//            i = 0;
//            cases.each(function() {
//                var t;
//                if ($(this).attr("time") != null) {
//                    t = $(this).attr("time");
//                }
//                else {
//                    t = $(this).attr("timeDistribution");
//                }
//
//                var q;
//                if ($(this).attr("failureProbability") != null) {
//                    q = $(this).attr("failureProbability");
//                }
//                else {
//                    q = $(this).attr("failureDistribution");
//                }
//
//                var onFailure = $(this).attr("failureBehaviour");
//
//                var selectionProbability = new Array($(this).find("selectionProbability").length + 1);
//                var k = 0;
//                var sum = 0;
//                $(this).find("selectionProbability").each(function() {
//                    sum += parseFloat($(this).attr("value"));
//                    selectionProbability[k] = parseFloat($(this).attr("value"));
//                    k++;
//                });
//                selectionProbability[k] = 1 - sum;
//
//                // среднее время решения задачи
//                var averageSolvingTime;
//                sum = 0;
//                var tmp;
//                var qq;
//                for (k = 0; k < n; k++) {
//                    var rt = routeMatrix[getRoute(Math.random(), selectionProbability)];
//                    j = 0;
//                    tmp = 0;
//                    while (j < rt.length) {
//                        switch (t) {
//                            case "Normal":
//                                tmp += normalDistribution(1, 1);
//                                break;
//                            case "Exp":
//                                tmp += expDistribution(1);
//                                break;
//                            default:
//                                tmp += Number(t);
//                                break;
//                        }
//
//                        switch (q) {
//                            case "Normal":
//                                qq = normalDistribution(0, 1) / 3;
//                                break;
//                            case "Exp":
//                                qq = expDistribution(1) / 3;
//                                break;
//                            default:
//                                qq = Number(q);
//                                break;
//                        }
//
//                        // произошла ошибка
//                        if (Math.random() < qq) {
//                            switch (onFailure) {
//                                case "StayOnCurrentVertex":
//                                    continue;
//                                case "GoToFirstVertex":
//                                    j = 0;
//                                    continue;
//                                case "GoToPreviousVertex":
//                                    j--;
//                                    continue;
//                            }
//                        }
//                        else {
//                            j++;
//                        }
//                    }
//                    sum += tmp;
//                    solvingTime[k] = tmp;
//                }
//                averageSolvingTime = (sum / n).toFixed(2);
//
//                $("div.main").append('<div class="container" id="container' + (i + 1) + '">' +
//                        '<h2>Тест №' + (i + 1) + '</h2>' +
//                        '<div class="input-data" id="input-data' + (i + 1) + '">' +
//                        '<table>' +
//                        '<tbody>' +
//                        '<tr>' +
//                        '<td>t</td><td>q</td><td>При ошибке</td>' +
//                        '</tr>' +
//                        '<tr>' +
//                        '<td>' + t + '</td><td>' + q + '</td><td>' + onFailure + '</td>' +
//                        '</tr>' +
//                        '</tbody>' +
//                        '</table>' +
//                        '<table id="selection-probability' + (i + 1) + '"><tbody></tbody></table>' +
//                        '</div>' +
//                        '<h3>Среднее время выполнения маршрутов</h3>' +
//                        '<table id="subtopic-average' + (i + 1) + '"><tbody></tbody></table>' +
//                        '<h3>Среднее время решения задачи</h3>' +
//                        '<p>' + averageSolvingTime + '</p>' +
//                        '<h3>Гистограмма для времени решения задачи</h3>' +
//                        '<div class="chart" id="chart' + (i + 1) + '"></div>' +
//                        '</div>');
//
//                $("#selection-probability" + (i + 1) + " tbody").append('<tr>');
//                $("#selection-probability" + (i + 1) + " tbody").append('<td>№ маршрута</td>');
//                $("#subtopic-average" + (i + 1) + " tbody").append('<tr>');
//                $("#subtopic-average" + (i + 1) + " tbody").append('<td>№ маршрута</td>');
//                counter = 1;
//                routes.each(function() {
//                    $("#selection-probability" + (i + 1) + " tbody").append('<td>' + counter + '</td>');
//                    $("#subtopic-average" + (i + 1) + " tbody").append('<td>' + counter + '</td>');
//                    counter++;
//                });
//                $("#selection-probability" + (i + 1) + " tbody").append('</tr>');
//                $("#subtopic-average" + (i + 1) + " tbody").append('</tr>');
//
//                $("#selection-probability" + (i + 1) + " tbody").append('<tr>');
//                $("#selection-probability" + (i + 1) + " tbody").append('<td>P<sub>выбора</sub></td>');
//                sum = 0;
//                k = 0;
//                $(this).find("selectionProbability").each(function() {
//                    sum += parseFloat($(this).attr("value"));
//                    $("#selection-probability" + (i + 1) + " tbody").append('<td>' + $(this).attr("value") + '</td>');
//                    selectionProbability[k] = parseFloat($(this).attr("value"));
//                    k++;
//                });
//                $("#selection-probability" + (i + 1) + " tbody").append('<td>' + (1 - sum).toFixed(2) + '</td>');
//                $("#selection-probability" + (i + 1) + " tbody").append('</tr>');
//                selectionProbability[k] = 1 - sum;
//
//                // среднее время выполнения подтем
//                $("#subtopic-average" + (i + 1) + " tbody").append('<tr>');
//                $("#subtopic-average" + (i + 1) + " tbody").append('<td>t<sub>ср</sub></td>');
//                $(routeMatrix).each(function() {
//                    sum = 0;
//                    for (k = 0; k < n; k++) {
//                        j = 0;
//                        while (j < $(this).length) {
//                            switch (t) {
//                                case "Normal":
//                                    sum += normalDistribution(1, 1);
//                                    break;
//                                case "Exp":
//                                    sum += expDistribution(1);
//                                    break;
//                                default:
//                                    sum += Number(t);
//                                    break;
//                            }
//
//                            switch (q) {
//                                case "Normal":
//                                    qq = normalDistribution(0, 1) / 3;
//                                    break;
//                                case "Exp":
//                                    qq = expDistribution(1) / 3;
//                                    break;
//                                default:
//                                    qq = Number(q);
//                                    break;
//                            }
//
//                            // произошла ошибка
//                            if (Math.random() < qq) {
//                                switch (onFailure) {
//                                    case "StayOnCurrentVertex":
//                                        continue;
//                                    case "GoToFirstVertex":
//                                        j = 0;
//                                        continue;
//                                    case "GoToPreviousVertex":
//                                        j--;
//                                        continue;
//                                }
//                            }
//                            else {
//                                j++;
//                            }
//                        }
//                    }
//                    $("#subtopic-average" + (i + 1) + " tbody").append('<td>' + (sum / n).toFixed(2) + '</td>');
//                });
//                $("#subtopic-average" + (i + 1) + " tbody").append('</tr>');
//
//                //гистограмма
//                intervalCount = Math.floor(1 + 3.22 * Math.log(n));
//                histData = new Array(intervalCount);
//                var min = minInArray(solvingTime);
//                var max = maxInArray(solvingTime);
//                histStep = (max - min) / intervalCount;
//
//                //st = solvingTime;
//
//                for (k = 0; k < intervalCount; k++) {
//                    histData[k] = new Array(k, 0);
//                }
//
//                counter = 0;
//                for (k = min; k < max; k += histStep) {
//                    for (var j = 0; j < solvingTime.length; j++) {
//                        if (solvingTime[j] >= k && solvingTime[j] <= (k + histStep))
//                            if (counter < intervalCount) histData[counter][1]++;
//                    }
//                    counter++;
//                }
//
//                $.plot($("#chart" + (i + 1)), [
//                    { data: histData, color: "green" }
//                ],
//                {
//                    bars: { show: true, barWidth: 0.9, fill: 0.7 },
//                    xaxis: { ticks: [], autoscaleMargin: 0.02 }
//                });
//
//
//                i++;
//            });
        }
    });
});