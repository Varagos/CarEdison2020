module.exports=((date) => {
    date=date.toISOString();
    return date.slice(0,10)+" "+date.slice(11,19);
   
});