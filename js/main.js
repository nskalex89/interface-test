$(document).ready(function() {
    d1 = [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 5],
        [5, 4],
        [6, 3],
        [7, 2],
        [8, 1]
    ];

    $.plot($("#chart1"), [
        { data: d1, color: "green" }
    ],
    {
        bars: { show: true, barWidth: 0.9, fill: 0.7 },
        xaxis: { ticks: [], autoscaleMargin: 0.02 }
    });
});