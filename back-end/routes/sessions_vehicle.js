//Endpoint which returns information about 
//charging sessions gor one secific vehicle

const express=require('express');
const router=express.Router();
const auth=require('../middleware.js').user_auth;
const db=require('../db.js');
const curr_date=require('../helpers/curr_date.js');
const format_in_dates=require('../helpers/format_in_dates');
const date_format=require('../helpers/date_format.js');

//This route is accessible from logged in users
router.use(auth);

router.get('/:vehicleID/:date_from/:date_to',(req,res) => {
    var vehicleID=req.params.vehicleID;
    var date_from=format_in_dates.from(req.params.date_from);
    var date_to=format_in_dates.to(req.params.date_to);
    var req_time=curr_date();

    var sql="SELECT * FROM sessions_per_vehicle WHERE vehicle_id=";
    sql+=db.connection.escape(vehicleID) + " AND (DATE(start) BETWEEN";
    sql+=db.connection.escape(date_from)+ " AND";
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
            return
        }
        console.log(result);
        var points_set=new Set();
        var total_energy=0;
        var sessions_list=[];
        var i=0;
        result.forEach(session => {
            i++;
            total_energy+=session.energy;
            points_set.add(session.point_id)
            sessions_list.push({
                "SessionIndex":i,
                "SessionID":session.session_id,
                "EnergyProvider":session.provider_name,
                "StartedOn":date_format(session.start),
                "FinishedOn":date_format(session.finish),
                "EnergyDelivered":session.energy,
                "PricePolicyRef":session.pricing_name,
                "CostPerKWh":session.cost,
                "SessionCost":(session.cost*session.energy).toFixed(6)
            })

        })
        res.status(200).send({
            "VehicleID":result[0].vehicle_id,
            "RequestTimestamp":req_time,
            "PeriodFrom":date_from,
            "PeriodTo":date_to,
            "TotalEnergyConsumed":total_energy.toFixed(6),
            "NumberOfVisitedPoints":points_set.size,
            "NumberOfVehicleChargingSessions":result.length,
            "VehicleChargingSesionsList":sessions_list
        });
    });
});

module.exports=router;
