function getNormalDistributedNumber(mean, sd) {
    var G = (Math.random() * 2 - 1) + (Math.random() * 2 - 1) + (Math.random() * 2 - 1);
    return Math.abs(G * sd + mean);
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

function getMax(n) {
    var max = -Infinity;
    for (var i = 0; i < n.length; i++) {
        if (n[i] > max) max = n[i];
    }
    return max;
}

function getMin(n) {
    var min = Infinity;
    for (var i = 0; i < n.length; i++) {
        if (n[i] < min) min = n[i];
    }
    return min;
}

$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "xml/RouteList.xml",
        dataType: "xml",
        success: function(xml) {
            routes = $(xml).find("route");
        }
    });

    $.ajax({
        type: "GET",
        url: "xml/TestCases.xml",
        dataType: "xml",
        success: function(xml) {
            cases = $(xml).find("case");

            var routeCount = routes.length;
            var routeMatrix = new Array(routeCount);
            var N = 5000;
            var solvingTime = new Array(N);

            var i = 0;
            routes.each(function() {
                var vertexCount = $(this).find("vertex").length;

                $("#root-matrix tbody").append('<tr>');
                routeMatrix[i] = new Array(vertexCount);
                var j = 0;
                $(this).find("vertex").each(function() {
                    $("#root-matrix tbody").append('<td>' + $(this).attr("id") + '</td>');
                    routeMatrix[i][j] = parseFloat($(this).attr("id"));
                    j++;
                });
                $("#root-matrix tbody").append('</tr>');
                i++;
            });

            i = 0;
            cases.each(function() {
                var t;
                if ($(this).attr("time") != null) {
                    t = $(this).attr("time");
                }
                else {
                    t = $(this).attr("timeDistribution");
                }

                var q;
                if ($(this).attr("failureProbability") != null) {
                    q = $(this).attr("failureProbability");
                }
                else {
                    q = $(this).attr("failureDistribution");
                }

                var onFailure = $(this).attr("failureBehaviour");

                var selectionProbability = new Array($(this).find("selectionProbability").length + 1);
                var k = 0;
                var sum = 0;
                $(this).find("selectionProbability").each(function() {
                    sum += parseFloat($(this).attr("value"));
                    selectionProbability[k] = parseFloat($(this).attr("value"));
                    k++;
                });
                selectionProbability[k] = 1 - sum;

                // среднее время решения задачи
                var averageSolvingTime;
                sum = 0;
                var tmp;
                var qq;
                for (k = 0; k < N; k++) {
                    var rt = routeMatrix[getRoute(Math.random(), selectionProbability)];
                    j = 0;
                    tmp = 0;
                    while (j < rt.length) {
                        switch (t) {
                            case "Normal":
                                tmp += getNormalDistributedNumber(1, 1);
                                break;
                            case "Exp":
                                tmp += getNormalDistributedNumber(1, 1);
                                break;
                            default:
                                tmp += Number(t);
                                break;
                        }

                        switch (q) {
                            case "Normal":
                                qq = getNormalDistributedNumber(0, 1) / 3;
                                break;
                            case "Exp":
                                qq = getNormalDistributedNumber(0, 1) / 3;
                                break;
                            default:
                                qq = Number(q);
                                break;
                        }

                        // произошла ошибка
                        if (Math.random() < qq) {
                            switch (onFailure) {
                                case "StayOnCurrentVertex":
                                    continue;
                                case "GoToFirstVertex":
                                    j = 0;
                                    continue;
                                case "GoToPreviousVertex":
                                    j--;
                                    continue;
                            }
                        }
                        else {
                            j++;
                        }
                    }
                    sum += tmp;
                    solvingTime[k] = tmp;
                }
                averageSolvingTime = (sum / N).toFixed(2);

                $("div.main").append('<div class="container" id="container' + (i + 1) + '">' +
                        '<h2>Тест №' + (i + 1) + '</h2>' +
                        '<div class="input-data" id="input-data' + (i + 1) + '">' +
                        '<table>' +
                        '<tbody>' +
                        '<tr>' +
                        '<td>t</td><td>q</td><td>При ошибке</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td>' + t + '</td><td>' + q + '</td><td>' + onFailure + '</td>' +
                        '</tr>' +
                        '</tbody>' +
                        '</table>' +
                        '<table id="selection-probability' + (i + 1) + '"><tbody></tbody></table>' +
                        '</div>' +
                        '<h3>Среднее время выполнения подтем</h3>' +
                        '<table id="subtopic-average' + (i + 1) + '"><tbody></tbody></table>' +
                        '<h3>Среднее время решения задачи</h3>' +
                        '<p>' + averageSolvingTime + '</p>' +
                        '<h3>Гистограмма для времени решения задачи</h3>' +
                        '<div class="chart" id="chart' + (i + 1) + '"></div>' +
                        '</div>');

                $("#selection-probability" + (i + 1) + " tbody").append('<tr>');
                $("#selection-probability" + (i + 1) + " tbody").append('<td>№ подтемы</td>');
                $("#subtopic-average" + (i + 1) + " tbody").append('<tr>');
                $("#subtopic-average" + (i + 1) + " tbody").append('<td>№ подтемы</td>');
                counter = 1;
                routes.each(function() {
                    $("#selection-probability" + (i + 1) + " tbody").append('<td>' + counter + '</td>');
                    $("#subtopic-average" + (i + 1) + " tbody").append('<td>' + counter + '</td>');
                    counter++;
                });
                $("#selection-probability" + (i + 1) + " tbody").append('</tr>');
                $("#subtopic-average" + (i + 1) + " tbody").append('</tr>');

                $("#selection-probability" + (i + 1) + " tbody").append('<tr>');
                $("#selection-probability" + (i + 1) + " tbody").append('<td>P<sub>выбора</sub></td>');
                sum = 0;
                k = 0;
                $(this).find("selectionProbability").each(function() {
                    sum += parseFloat($(this).attr("value"));
                    $("#selection-probability" + (i + 1) + " tbody").append('<td>' + $(this).attr("value") + '</td>');
                    selectionProbability[k] = parseFloat($(this).attr("value"));
                    k++;
                });
                $("#selection-probability" + (i + 1) + " tbody").append('<td>' + (1 - sum).toFixed(2) + '</td>');
                $("#selection-probability" + (i + 1) + " tbody").append('</tr>');
                selectionProbability[k] = 1 - sum;

                // среднее время выполнения подтем
                $("#subtopic-average" + (i + 1) + " tbody").append('<tr>');
                $("#subtopic-average" + (i + 1) + " tbody").append('<td>t<sub>ср</sub></td>');
                $(routeMatrix).each(function() {
                    sum = 0;
                    for (k = 0; k < N; k++) {
                        j = 0;
                        tmp = 0;
                        while (j < $(this).length) {
                            switch (t) {
                                case "Normal":
                                    sum += getNormalDistributedNumber(1, 1);
                                    break;
                                case "Exp":
                                    sum += getNormalDistributedNumber(1, 1);
                                    break;
                                default:
                                    sum += Number(t);
                                    break;
                            }

                            switch (q) {
                                case "Normal":
                                    qq = getNormalDistributedNumber(0, 1) / 3;
                                    break;
                                case "Exp":
                                    qq = getNormalDistributedNumber(0, 1) / 3;
                                    break;
                                default:
                                    qq = Number(q);
                                    break;
                            }

                            // произошла ошибка
                            if (Math.random() < qq) {
                                switch (onFailure) {
                                    case "StayOnCurrentVertex":
                                        continue;
                                    case "GoToFirstVertex":
                                        j = 0;
                                        continue;
                                    case "GoToPreviousVertex":
                                        j--;
                                        continue;
                                }
                            }
                            else {
                                j++;
                            }
                        }
                    }
                    $("#subtopic-average" + (i + 1) + " tbody").append('<td>' + (sum / N).toFixed(2) + '</td>');
                });
                $("#subtopic-average" + (i + 1) + " tbody").append('</tr>');

                //гистограмма
                intervalCount = Math.floor(1 + 3.22 * Math.log(N));
                histData = new Array(intervalCount);
                var min = getMin(solvingTime);
                var max = getMax(solvingTime);
                histStep = (max - min) / intervalCount;

                //st = solvingTime;

                for (k = 0; k < intervalCount; k++) {
                    histData[k] = new Array(k, 0);
                }

                counter = 0;
                for (k = min; k < max; k += histStep) {
                    for (var j = 0; j < solvingTime.length; j++) {
                        if (solvingTime[j] >= k && solvingTime[j] <= (k + histStep))
                            if (counter < intervalCount) histData[counter][1]++;
                    }
                    counter++;
                }

                $.plot($("#chart" + (i + 1)), [
                    { data: histData, color: "green" }
                ],
                {
                    bars: { show: true, barWidth: 0.9, fill: 0.7 },
                    xaxis: { ticks: [], autoscaleMargin: 0.02 }
                });


                i++;
            });
        }
    });

//$("h1").html("<b>sdgfdfsggfdsg</b>");
});