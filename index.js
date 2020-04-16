var ZIP, OWMAPI;

$(document).ready(() => {
  urlCheck();
});

function urlCheck() {
  let url = new URL(window.location.href);
  if (url.searchParams.has('zip') && url.searchParams.has('owmapi')) {
    ZIP = url.searchParams.get('zip');
    OWMAPI = url.searchParams.get('owmapi');
  } else {
    ZIP = prompt("Please enter ZIP code.");
    OWMAPI = prompt("Please enter OpenWeatherMap API key.");
  }
  clock();
  currentWeather();
  forecastWeather();
  calendar();
}

function clock() {
  let today = new Date();
  let ampm = today.getHours() >= 12 ? 'PM' : 'AM';
  let h = today.getHours() % 12 ? today.getHours() % 12 : 12;
  h = h < 10 ? "0" + h : h;
  let m = today.getMinutes() < 10 ? "0" + today.getMinutes() : today.getMinutes();
  let s = today.getSeconds() < 10 ? "0" + today.getSeconds() : today.getSeconds();
  $("#clock").html(h + ':' + m + ':' + s + ampm).textFit({reProcess: true, widthOnly: true, alignVert: true, maxFontSize: 400});
  let t = setTimeout(clock, 500); //0.5 seconds
}

async function currentWeather() {
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
  let response, body;
  try {
    response = await fetch(`https://api.openweathermap.org/data/2.5/weather?zip=${ZIP},us&units=imperial&appid=${OWMAPI}`);
    body = await response.json();
  } catch (err) {
    console.log(err);
    $("#current").html("Error fetching weather data.")
  }
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
  let response, body;
  try {
    response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?zip=${ZIP},us&units=imperial&appid=${OWMAPI}`);
    body = await response.json();
  } catch (err) {
    console.log(err);
    $("#forecast").html("Error fetching weather data.")
  }
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

function calendar() {
  $("#day-labels").find(".day-name").textFit({reProcess: true, alignHoriz: true, alignVert: true});
  let date = new Date();
  let year = date.getFullYear();
  let numberOfDays;
  let monthName = monthNumber => {
    switch (monthNumber) {
      case 0: numberOfDays = 31; return 'JAN';
      case 1: numberOfDays = year % 4 ? 28 : 29; return 'FEB';
      case 2: numberOfDays = 31; return 'MAR';
      case 3: numberOfDays = 30; return 'APR';
      case 4: numberOfDays = 31; return 'MAY';
      case 5: numberOfDays = 30; return 'JUN';
      case 6: numberOfDays = 31; return 'JUL';
      case 7: numberOfDays = 31; return 'AUG';
      case 8: numberOfDays = 30; return 'SEP';
      case 9: numberOfDays = 31; return 'OCT';
      case 10: numberOfDays = 30; return 'NOV';
      case 11: numberOfDays = 31; return 'DEC';
    }
  }
  $('#month-year').html(monthName(date.getMonth()) + ' ' + year.toString()).textFit({reProcess: true, alignVert: true});
  let todayDate = date.getDate();
  let todayDay = date.getDay();
  let dayDiff = (todayDate - 1) % 7;
  let dayOne = todayDay - dayDiff;
  dayOne = dayOne < 0 ? dayOne += 7 : dayOne;
  let todayPlace, lastDay;
  for (let i = 1; i <= numberOfDays; i++) {
    let calID = dayOne + i;
    if (i === numberOfDays) lastDay = calID;
    if (i === todayDate) todayPlace = calID; 
    let el = '#cal-' + calID.toString();
    $(el).html(i.toString()).textFit({reProcess: true, alignVert: true, alignHoriz: true});
    if ($(el).hasClass("today")) $(el).removeClass("today");
    $(el).addClass("not-today");
  }
  $(".day-name").css("color", "#4FC1E8");
  $("#day-label-" + todayDay.toString()).css("color", "#ED5564");
  $('#cal-' + todayPlace.toString()).removeClass("not-today").addClass("today");
  if (lastDay < 36) $("#week-6").css("height", "0%");
  else $("#week-6").css("height", "13%");
  let t = setTimeout(forecastWeather, 3600000); //1 hour
}