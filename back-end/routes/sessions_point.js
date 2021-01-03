const express=require('express');
const router=express.Router();
const auth=require('../middleware.js').user_auth;
const db=require('../db.js');

router.use(auth);

router.get('/:pointID/:date_from/:date_to',(req,res) => {
    var sql="SELECT operator_title,start,";
    sql+="finish,session_id,charger_title,energy,type,payment_name ";
    sql+="FROM points " 
    sql+="JOIN stations USING (station_id) ";
    sql+="JOIN providers USING (provider_id) ";
    sql+="JOIN operators USING (operator_id) ";
    sql+="JOIN chargers USING (charger_id) ";
    sql+="JOIN sessions USING (point_id) ";
    sql+="JOIN payment_types USING (payment_id) ";
    sql+="JOIN vehicles USING (vehicle_id) ";
    sql+="WHERE point_id="+db.connection.escape(req.params.pointID);
    sql+=" ORDER BY start ASC, finish ASC";
    
    db.connection.query(sql,(err,result)=>{
        if(err){
            console.log(err);
        }
        console.log(result);
    });
    res.sendStatus(200);
});

module.exports=router;