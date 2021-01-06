//Endpoint that returns information about 
//charging sessions in one specific point
const express=require('express');
const router=express.Router();
const auth=require('../middleware.js').user_auth;
const db=require('../db.js');
const curr_date=require('../helpers/curr_date.js');
const format_in_dates=require('../helpers/format_in_dates');
const date_format=require('../helpers/date_format.js');

//This route is accessible from logged in users
router.use(auth);

router.get('/:pointID/:date_from/:date_to',(req,res) => {
    var pointID=req.params.pointID;
    var date_from=format_in_dates.from(req.params.date_from);
    var date_to=format_in_dates.to(req.params.date_to);
    var req_time=curr_date();

    var sql="SELECT * FROM sessions_per_point ";
    sql+="WHERE point_id="+db.connection.escape(pointID);
    sql+=" AND (DATE(start) BETWEEN ";
    sql+=db.connection.escape(date_from)+" AND ";
    sql+=db.connection.escape(date_to)+")";
    sql+=" ORDER BY start ASC, finish ASC";
    db.connection.query(sql,(err,result)=>{
        if(err){
            console.log(err);
            res.status(500).send("Database error");
            return;
        }
        if(result.length===0){
            res.status(402).send("No data for these parameters");
            return;
        }
        var res_to_send={
            "Point":pointID,
            "PointOperator":result[0].operator_title,
            "RequestTimestamp":req_time,
            "PeriodFrom":date_from,
            "PeriodTo":date_to,
            "NumberOfChargingSessions":result.length
        };
        sessions_list=[];
        i=1;
        result.forEach((session)=>{
            sess={
                "SessionIndex":i,
                "SessionID":session.session_id,
                "StartedOn":date_format(session.start),
                "FinishedOn":date_format(session.finish),
                "Protocol":session.charger_title,
                "EnergyDelivered":session.energy,
                "Payment":session.payment_name,
                "VehicleType":session.type
            };
            sessions_list.push(sess);
            i++;

        });
        res_to_send['ChargingSessionsList']=sessions_list;
        res.status(200).send(res_to_send);


    });
});

module.exports=router;