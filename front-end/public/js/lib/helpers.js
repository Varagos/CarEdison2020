function beautify_mins(minutes_input) {
    if (minutes_input < 0) { 
        return "0 mins";
    }
    const hours = Math.floor(minutes_input/60)
    let minutes = Math.floor(minutes_input - hours*60)
    if (hours > 0) {
        return (minutes > 0) ? `${hours} hrs ${minutes} mins`: `${hours} hrs`
    } else {
        return `${minutes} mins`
    }
}

const formatedTimestamp = ()=> {
    const d = new Date()
    const date = d.toISOString().split('T')[0];
    const time = d.toTimeString().split(' ')[0];
    return `${date} ${time}`
  }