function getNormalDistributedNumber() {
    var mean = 1;
    var sd = 1;
    var G = (Math.random() * 2 - 1) + (Math.random() * 2 - 1) + (Math.random() * 2 - 1);
    return Math.abs(G * sd + mean);
}

function getRoute(r) {
    var len = selectionProbability.length;
    var intervalDivides = new Array(len + 1);
    intervalDivides[0] = 0;

    var sum = 0;
    for (var i = 0; i < len; i++) {
        sum += selectionProbability[i];
        intervalDivides[i + 1] = sum;
        if (r > intervalDivides[i] && r < intervalDivides[i + 1]) return i;
    }
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
            var N = 1000;

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

                selectionProbability = new Array($(this).find("selectionProbability").length + 1);
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
                for (k = 0; k < N; k++) {
                    $(routeMatrix[getRoute(Math.random())]).each(function() {
                        switch (t) {
                            case "Normal":
                                sum += getNormalDistributedNumber();
                                break;
                            case "Exp":
                                sum += getNormalDistributedNumber();
                                break;
                            default:
                                sum += Number(t);
                                break;
                        }
                    });
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
                var counter = 1;
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
                        $(this).each(function() {
                            switch (t) {
                                case "Normal":
                                    sum += getNormalDistributedNumber();
                                    break;
                                case "Exp":
                                    sum += getNormalDistributedNumber();
                                    break;
                                default:
                                    sum += Number(t);
                                    break;
                            }
                        });
                    }
                    $("#subtopic-average" + (i + 1) + " tbody").append('<td>' + (sum / N).toFixed(2) + '</td>');
                });
                $("#subtopic-average" + (i + 1) + " tbody").append('</tr>');

                i++;
            });
        }
    });

//$("h1").html("<b>sdgfdfsggfdsg</b>");
})
        ;