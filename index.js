var OWMID, OWMAPI, GCALID, GCALAPI;

$(document).ready(() => {
  clock();
  currentWeather();
  forecastWeather();
});

function clock() {
  let today = new Date();
  let ampm = today.getHours() >= 12 ? 'PM' : 'AM';
  let h = today.getHours() % 12 ? today.getHours() % 12 : 12;
  h = h < 10 ? "0" + h : h;
  let m = today.getMinutes() < 10 ? "0" + today.getMinutes() : today.getMinutes();
  let s = today.getSeconds() < 10 ? "0" + today.getSeconds() : today.getSeconds();
  $("#clock").html(h + ':' + m + ':' + s + ampm).textFit({reProcess: true, widthOnly: true, maxFontSize: 400});
  let date = today.toString().replace(/\s\d\d:.*$/,'');
  $("#today").text(date).textFit({reProcess: true, widthOnly: true, maxFontSize: 400});
  let t = setTimeout(clock, 500); //0.5 seconds
}

async function currentWeather() {
  //temporary start
  //temporary end
  let direction = deg => {
    if (deg <= 22 || deg > 337) return 'N';
    else if (deg <= 67) return 'NE';
    else if (deg <= 112) return 'E';
    else if (deg <= 157) return 'SE';
    else if (deg <= 202) return 'S';
    else if (deg <= 247) return 'SW';
    else if (deg <= 292) return 'W';
    else if (deg <= 337) return 'NW';
  }
  let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?id=${OWMID}&units=imperial&appid=${OWMAPI}`);
  let body = await response.json();
  let describe = body.weather[0].description[0].toUpperCase() + body.weather[0].description.slice(1);
  let temp = body.main.temp.toString() + '\xB0' + 'F';
  let feels = body.main.feels_like.toString() + '\xB0' + 'F';
  let humid = body.main.humidity.toString() + '%';
  let wind = body.wind.speed.toString() + 'mph';
  let dir = direction(body.wind.deg);
  let icon = 'http://openweathermap.org/img/wn/' + body.weather[0].icon + '@2x.png';
  $("#actual").html(temp).textFit({reProcess: true, widthOnly: true, maxFontSize: 400});
  $("#feels").text("Feels like " + feels).textFit({reProcess: true, widthOnly: true, maxFontSize: 400});
  $("#describe").html('<img class="icon" src="' + icon + '"><br>' + describe + "<br>Humidity: " + humid + "<br>Wind: " + wind + " " + dir).textFit({reProcess: true, maxFontSize: 400});
  let t = setTimeout(currentWeather, 900000); //15 minutes
}

async function forecastWeather() {
  //temporary start
  //temporary end
  let response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?id=${OWMID}&units=imperial&appid=${OWMAPI}`);
  let body = await response.json();
  let eightAm = [];
  let twoPm = [];
  let eightPm = [];
  let first;
  body.list.forEach((time, i) => {
    if (time.dt_txt.endsWith("12:00:00")) {
      eightAm.push(time);
      if (i === 0) first = 1;
    } else if (time.dt_txt.endsWith("18:00:00")) {
      twoPm.push(time);
      if (i === 0) first = 2;
    } else if (time.dt_txt.endsWith("00:00:00")) {
      eightPm.push(time);
      if (i === 0) first = 3;
    }
  });
  let adjust = 0;
  eightAm.forEach((day, i) => {
    if (first > 0) {
      eightAm.pop();
      first = 0;
      adjust = 1;
    }
    let dayCount = (i + 1 + adjust).toString();
    $("#day-" + dayCount + "-1").find(".daily-temp").html("8AM<br>" + day.main.temp.toString() + '\xB0' + 'F').textFit({reProcess: true, widthOnly: true, maxFontSize: 23});
    $("#day-" + dayCount + "-1").find(".daily-icon").html('<img class="daily-icon" src="http://openweathermap.org/img/wn/' + day.weather[0].icon + '@2x.png">');
  });
  adjust = 0;
  twoPm.forEach((day, i) => {
    if (first > 1) {
      twoPm.pop();
      first = 0;
      adjust = 1;
    }
    let dayCount = (i + 1 + adjust).toString();
    $("#day-" + dayCount + "-2").find(".daily-temp").html("2PM<br>" + day.main.temp.toString() + '\xB0' + 'F').textFit({reProcess: true, widthOnly: true, maxFontSize: 23});
    $("#day-" + dayCount + "-2").find(".daily-icon").html('<img class="daily-icon" src="http://openweathermap.org/img/wn/' + day.weather[0].icon + '@2x.png">');
  });
  let dayLetter = dayNumber => {
    switch (dayNumber) {
      case 1: return 'M';
      case 2: case 4: return 'T';
      case 3: return 'W';
      case 5: return 'F';
      case 6: case 0: return 'S';
    }
  }
  eightPm.forEach((day, i) => {
    let date = new Date(day.dt * 1000);
    let dayCount = (i + 1).toString();
    $("#day-" + dayCount + "-date").html(dayLetter(date.getDay()) + ' ' + (date.getMonth() + 1).toString() + '/' + date.getDate().toString()).textFit({reProcess: true, widthOnly: true, maxFontSize: 23});
    $("#day-" + dayCount + "-3").find(".daily-temp").html("8PM<br>" + day.main.temp.toString() + '\xB0' + 'F').textFit({reProcess: true, widthOnly: true, maxFontSize: 23});
    $("#day-" + dayCount + "-3").find(".daily-icon").html('<img class="daily-icon" src="http://openweathermap.org/img/wn/' + day.weather[0].icon + '@2x.png">');
  });
  let t = setTimeout(forecastWeather, 3600000); //1 hour
}