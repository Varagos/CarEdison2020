
console.log(document.currentScript.getAttribute('one'))
console.log(document.currentScript.getAttribute('two'))

let full_cap = parseInt(document.currentScript.getAttribute('one'));
let init_state = parseInt(document.currentScript.getAttribute('two'));
const battery_to_fill = full_cap - init_state;
console.log(`Goal is to charge ${battery_to_fill} kwh`)

let estimated_cost, full_charge_time;

const labels = document.querySelectorAll('.speed-event');
const output_text = document.querySelectorAll('.bold-text');
const slow_kwh = 7, normal_kwh = 22, fast_kwh =43;
const cost_slow = 0.05, cost_normal = 0.1, cost_fast = 0.2;

labels.forEach((element) => {

    element.addEventListener("click", handleClick);

});

function handleClick() {

    console.log(this.getAttribute('for'))

    switch(this.getAttribute('for')) {
        case 'free':{
            const charg_minutes = battery_to_fill * 60 / slow_kwh
            const cost = battery_to_fill * cost_slow
            output_text[0].innerHTML = beautify_mins(charg_minutes) ;
            output_text[1].innerHTML = cost.toFixed(2) + " &euro;";
            break;
        }
        case 'basic': {
            const charg_minutes = battery_to_fill * 60 / normal_kwh
            const cost = battery_to_fill * cost_normal
            output_text[0].innerHTML = beautify_mins(charg_minutes);
            output_text[1].innerHTML = cost.toFixed(2) + " &euro;";
            break;
        }
        case 'premium': {
            const charg_minutes = battery_to_fill * 60 / fast_kwh
            const cost = battery_to_fill * cost_fast
            output_text[0].innerHTML = beautify_mins(charg_minutes);
            output_text[1].innerHTML = cost.toFixed(2) + " &euro;";
            break;
        }
        default:
            break;
    }
}

function beautify_mins(minutes_input) {
    const hours = Math.floor(minutes_input/60)
    let minutes = Math.floor(minutes_input - hours*60)
    console.log(minutes_input, '=', `${hours} hrs and ${minutes} mins`)
    if (hours > 0) {
        return (minutes > 0) ? `${hours} and ${minutes} mins`: `${hours} hrs`
    } else {
        return `${minutes} mins`
    }
}