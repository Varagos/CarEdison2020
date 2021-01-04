const date_format=require('./date_format.js');

module.exports=(()=>{
    date=new Date();

    date.setHours(date.getHours()-(date.getTimezoneOffset()/60));
    return date_format(date);
});