//Endpoint which returns information about 
//charging sessions for one specific provider
const express=require('express');
const router=express.Router();
const auth=require('../middleware.js').user_auth;
const db=require('../db.js');
const curr_date=require('../helpers/curr_date.js');
const format_in_dates=require('../helpers/format_in_dates');
const date_format=require('../helpers/date_format.js');
const json2csv=require('../helpers/j2on2csv.js');

//This route is acc1essible from logged in users
router.use(auth);

router.get('/:providerID/:date_from/:date_to', (req,res)=>{
    var providerID=req.params.providerID;
    var date_from=format_in_dates.from(req.params.date_from);
    var date_to=format_in_dates.to(req.params.date_to);
    var req_time=curr_date();  

    var sql="SELECT * FROM sessions_per_provider WHERE provider_id=";
    sql+=db.connection.escape(providerID) + " AND (DATE(start) BETWEEN";
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

        var sessions_list=[]
        result.forEach(session => {
            sessions_list.push({
                "ProviderID":session.provider_id,
                "ProviderName":session.provider_name,
                "StationID":session.station_id,
                "SessionID":session.session_id,
                "VehicleID":session.vehicle_id,
                "StartedOn":date_format(session.start),
                "FinishedOn":date_format(session.finish),
                "EnergyDelivered":session.energy,
                "PricePolicyRef":session.pricing_name,
                "CostPerKWh":session.cost,
                "TotalCost":(session.energy*session.cost).toFixed(6)
            })
        })
        if(req.query.format==='csv'){
            csv=json2csv(sessions_list);
            res.status(200).send(csv);
        }
        else{
            res.status(200).send(sessions_list);
        }
    });
});

module.exports=router;