//Funciton that takes as input a Date object and returns it in 
//YYYY-MM-DD HH:MM:SS format

module.exports=((date) => {
    if(!date){
        return date;
    }
    date=date.toISOString();
    return date.slice(0,10)+" "+date.slice(11,19);
   
});