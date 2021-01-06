const express=require('express');
const router=express.Router();
const auth=require('../middleware.js').user_auth;
const db=require('../db.js');
const curr_date=require('../helpers/curr_date.js');
const format_in_dates=require('../helpers/format_in_dates');
const date_format=require('../helpers/date_format.js');

//This route is accessible from logged in users
router.use(auth);

router.get('/:stationID/:date_from/:date_to',(req,res) => {
    var stationID=req.params.stationID;
    var date_from=format_in_dates.from(req.params.date_from);
    var date_to=format_in_dates.to(req.params.date_to);
    var req_time=curr_date();

    var sql="SELECT station_id,operator_title,point_id,COUNT(*) as sessions";
    sql+=",SUM(energy) as energy FROM sessions JOIN points USING (point_id)";
    sql+=" JOIN stations USING (station_id) JOIN operators USING (operator_id)";
    sql+=" WHERE station_id="+db.connection.escape(stationID);
    sql+=" AND (DATE(start) BETWEEN";
    sql+=db.connection.escape(date_from)+ " AND";
    sql+=db.connection.escape(date_to)+") ";
    sql+="GROUP BY point_id";
    db.connection.query(sql,(err,result)=>{
        if(err){
            console.log(err);
            res.status(500).send("Database error");
            return;
        }
        if(result.length===0){
            res.status(402).send("No data for these parameters");
        }
        var energy_sum=0;
        var sessions=0;
        var sessions_list=[];
        result.forEach(point => {
            energy_sum+=point.energy;
            sessions+=point.sessions;
            sessions_list.push({
                "PointID":point.point_id,
                "PointSessions":point.sessions,
                "EnergyDelivered":point.energy
            });

        })
        
        var res_to_send={
            "StationID":stationID,
            "Operator":result[0].operator_title,
            "RequestTimeStamp":req_time,
            "PeriodFrom":date_from,
            "PeriodTo":date_to,
            "TotalEnergyDelivered":energy_sum,
            "NumberOfChargingSessions":sessions,
            "NumberOfActivePoints":result.length,
            "SessionsSummaryList":sessions_list

        }
        res.status(200).send(res_to_send);
    });
});




module.exports=router;