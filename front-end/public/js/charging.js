const timestamps = []

$(document).ready( () => {
  timestamps.push(formatedTimestamp())
  console.log(timestamps[0])
});


let total_minutes = parseInt(document.currentScript.getAttribute('one'));
let battery_percentage = parseInt(document.currentScript.getAttribute('two'));
let cost_minute;
let current_cost = 0;
console.log('total minutes:', total_minutes)
console.log('initial batter percentage:', battery_percentage)

$('.bat-percentage').html(`${battery_percentage.toFixed()} %`)
$(".Time-rem").html(beautify_mins(total_minutes))
$(".cur-session").html('0 €');

/*switch tou descreption gia na vroume ipolipomenes kwh -> to vima(gia xrimata) */
const chargingType = $('.Type-charge').text()
switch(chargingType) {
  case 'Supercharging': {
    cost_minute = (0.2 * 43) / 60;
    break;
  }
  case 'Normal charging': {
    cost_minute =( 0.1 * 22 )/ 60;
    break;
  }
  case 'Slow charging': {
    cost_minute =( 0.05 * 7 )/ 60;
    break;
  }
  default:
    console.log('Error-invalid charging type?')
    break;
}



function battery(charge) {
  var index = 0;
  $(".battery .bar").each(function() {
    var power = Math.round(charge / 10);
    if (index != power) {
      $(this).addClass("active");
      index++;
    } else {
      $(this).removeClass("active");
    }
  });
}

$(".battery .bar").click(function() {
  battery(parseInt($(this).data("power")));
});

battery(battery_percentage); // (67%) Any number 100 or lower will work, Including decimals.


const remaining_perc = 100 - battery_percentage;
const step_per_min = remaining_perc / total_minutes;



$(".stop-btn").click(function() {
  clearTimeout(t);

  $(".pay-btn").text(`Pay ${current_cost.toFixed(2)} €`)
  timestamps.push(formatedTimestamp());
  complete_charging();
});

/*
$(" button[data-bs-dismiss*='modal'").click(function() {
});
*/

function startTime() {

  //Update time
  total_minutes -= 1
  $(".Time-rem").html(beautify_mins(total_minutes))

  //Update battery
  battery_percentage += step_per_min;
  battery_str = Math.floor(battery_percentage).toString();
  $('.bat-percentage').html(`${battery_str} %`)
  battery(battery_percentage);

  //Update current cost
  current_cost += cost_minute;
  $(".cur-session").html(`${current_cost.toFixed(2)} €`);

  if (battery_percentage + step_per_min < 101) {
    t = setTimeout(function() { startTime() }, 200)
  } else {
    t = setTimeout(function() { 
      $(".Time-rem").html(beautify_mins(0))
      $('.bat-percentage').html('100 %');
      $(".stop-btn").click()
    }, 200)
  }
}


function complete_charging() {
  const [init_timestamp, final_timestamp] = timestamps;
  console.log(final_timestamp)
  
  const energy = (find_energy(current_cost)).toFixed(3);
  $.ajax({ 
    url: '/charging',
    type: 'POST',
    cache: false, 
    data: { 
      'start': init_timestamp,
      'finish': final_timestamp,
      'energy': energy 
    }, 
    success: function(data){
       console.log('Ajax sent')
    }
    , error: function(jqXHR, textStatus, err){
        console.log('text status '+textStatus+', err '+err)
    }
 })
}


function find_energy(total_cost){
  const chargingType = $('.Type-charge').text()
  let energy;
  switch(chargingType) {
    case 'Supercharging': {
      energy = total_cost / 0.2;
      break;
    }
    case 'Normal charging': {
      energy = total_cost / 0.15;
      break;
    }
    case 'Slow charging': {
      energy = total_cost / 0.05;
      break;
    }
    default:
      console.log('Error-invalid charging type?')
      break;
  }
  console.log(`total energy: ${energy}`)
  return energy;
}
var t;
t = setTimeout(function() { startTime() }, 2000)

