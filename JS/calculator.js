// 计算年金现值
function PA(i, n) {
    let total = 0;
    let interest = 1 / (1 + i);
    for (let k = 1; k <= n; k++) {
        total += interest;
        interest *= 1 / (1 + i);
    }
    return total;
}
// 计算年金终值
function FA(i, n) {
    let total = 0;
    let interest = 1;
    for (let k = 1; k <= n; k++) {
        total += interest;
        interest *= 1 + i;
    }
    return total;
}
// 计算复利现值
function PF(i, n) {
    return 1 / (1 + i) ** n;
}
// 计算复利终值
function FP(i, n) {
    return (1 + i) ** n;
}

function bondNetValue(present_time, expiration_time, interest, discount, nominal_value, freq) {
    // present_time：目前时间 [2012, 1]代表2012年1月1日
    // expiration_time：到期时间
    // interest：票面利率（%）
    // discount：折现率（%）
    // nominal_value：面值（元）
    // freq：付息频率（年）
    // 计算剩余流通时间
    let left_year = expiration_time[0] - present_time[0];
    let left_month = expiration_time[1] - present_time[1];
    if (left_month < 0) {
        left_year -= 1;
        left_month = 12 - present_time[1] + 1 + expiration_time[1] - 1;
    }
    let left_time = left_year + left_month / 12;
    // 付息期数
    let n = Math.ceil(left_time / freq);
    // 付息期实际利率
    let i = interest * freq;
    // 折现期
    let discount_time = left_time - n * freq;
    // 债券现值
    let value = (nominal_value * interest * PA(discount, n) + nominal_value * PF(discount, n)) *
        PF(discount, discount_time);
    return value;
}

function calBondNetValue(release_time, expiration_time, interest, discount, nominal_value, freq) {
    let arrayNetValue = [];
    let years = [];
    let release_year = release_time[0];
    let release_month = release_time[1];
    let expiration_year = expiration_time[0];
    let expiration_month = expiration_time[1];
    while (release_year <= expiration_year) {
        if (release_year == expiration_year)
            if (release_month > expiration_month)
                break;
        years.push([release_year, release_month]);
        arrayNetValue.push(bondNetValue([release_year, release_month], [expiration_year, expiration_month],
            interest, discount, nominal_value, freq));
        if (release_month == 12) {
            release_month = 1;
            release_year += 1;
        } else {
            release_month += 1;
        }
    }
    return [arrayNetValue, years];
}
var flowCash = calBondNetValue([2011, 5], [2016, 5], 0.08, 0.1, 1000, 1);
var chartDom = document.getElementById('netvalue');
var myChart = echarts.init(chartDom);
var option1;
let date = flowCash[1];
let value = flowCash[0];
const dateList = date.map(function(item) {
    return item[0].toString() + '-' + item[1].toString();
});
option1 = {
    xAxis: {
        type: 'category',
        data: dateList,
    },
    yAxis: {
        type: 'value',
        min: 800,
        max: 1200
    },
    series: [{
        data: value,
        type: 'line',
        smooth: true
    }]
};
option1 && myChart.setOption(option1);