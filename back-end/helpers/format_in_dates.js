//Both functions take as input a date as a string in YYYMMDD format
//and transform it. Used for formatting dates from req.params
//From: YYYYMMDD --> YYYY-MM-DD 00:00:00
//To: YYYYMMDD --> YYYY-MM-DD 23:59:59

module.exports={
    from:(date)=>{
        return date.slice(0,4)+"-"+date.slice(4,6)+"-"+date.slice(6,8)+" 00:00:00";
    },
    to:(date)=>{
        return date.slice(0,4)+"-"+date.slice(4,6)+"-"+date.slice(6,8)+" 23:59:59";
    }

}