module.exports={
    from:(date)=>{
        return date.slice(0,4)+"-"+date.slice(4,6)+"-"+date.slice(6,8)+" 00:00:00";
    },
    to:(date)=>{
        return date.slice(0,4)+"-"+date.slice(4,6)+"-"+date.slice(6,8)+" 23:59:59";
    }

}