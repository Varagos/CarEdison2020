const express = require('express');
const path = require('path');
const https = require('https');
const querystring = require('querystring');
const Readable = require('stream').Readable;
const FormData = require('form-data');
const session = require('express-session');
const global_const = require('./constants.js')

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
const app = express();

// register view engine
app.set('view engine', 'ejs');

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({
    extended: true
}));

const PORT = process.env.PORT || 5000;
const API_PORT = 8765;
const host = 'localhost'

const battery_states = {}
//set static folder
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'mouse cat',
    resave: false,
    saveUninitialized: false,
}));


app.get('/', (req, res) => {
    const warning = req.session.login_error
    res.render('index', {
        warning
    });
    req.session.login_error = null;
});


app.post('/', (req, res) => {
    const postData = querystring.stringify({
        username: req.body.username,
        password: req.body.passw
    });

    const options = {
        hostname: host,
        port: API_PORT,
        path: '/evcharge/api/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length
        }
    };

    const request = https.request(options, (response) => {

        console.log(`Login attempt:${req.body.username} --> statusCode ${response.statusCode}`);
        response.on('data', (d) => {
            data_res = d.toString('utf8')

            if (response.statusCode !== 200) {
                console.log('login error:', data_res)
                req.session.login_error = data_res
                const warning = req.session.login_error
                res.render('index', {
                    warning
                });
                return
            }

            req.session.logged_username = req.body.username;
            const token = JSON.parse(data_res).token
            req.session.token = token;
            req.session.fullCap = global_const.FULL_CAPACITY;   //70
            req.session.batteryState = global_const.INIT_BATTERY;   //14
            //Keep dictionary backup cause of AJAX-session
            battery_states[token] = global_const.INIT_BATTERY;
            res.redirect('/homepage')
        });
    });

    request.on('error', (e) => {
        console.error(e);
    });

    request.write(postData);
    request.end();
});



app.get('/homepage', (req, res) => {
    // Update session property after ajax call
    req.session.batteryState = battery_states[req.session.token]

    if (!req.session.token) {
        req.session.login_error = "Please login first"
        res.redirect('/')
    } else {
        res.render('homepage')
    }
});


app.post('/logout', (req, res) => {

    const options = {
        hostname: host,
        port: API_PORT,
        path: '/evcharge/api/logout',
        method: 'POST',
        headers: {
            'X-OBSERVATORY-AUTH': req.session.token
        }
    };

    const request = https.request(options, (response) => {
        console.log('Logout statusCode', response.statusCode);
        response.on('data', (d) => {
            data_res = d.toString('utf8')
            console.log(`Logout response: ${data_res}`)

            if (response.statusCode !== 200) {
                res.redirect('/homepage')
                return
            }
            console.log(`${req.session.logged_username} logged out`)

            
            req.session.destroy();
            res.redirect('/')
        });
    });

    request.on('error', (e) => {
        console.error(e);
    });
    request.end();
})


app.get('/payment', (req, res) => {

    if (!req.session.token) {
        req.session.login_error = "Please login first"
        res.redirect('/')
        return;
    }
    const full_cap = req.session.fullCap;
    let battery_state = battery_states[req.session.token]
    res.render('payment', {
        full_cap,
        battery_state
    });

});

app.post('/payment', (req, res) => {
    console.log(req.session.logged_username, req.body)
    const battery_to_fill = req.session.fullCap - req.session.batteryState;
    const slow_kwh = global_const.SLOW_KWH,
        normal_kwh = global_const.NORMAL_KWH,
        fast_kwh = global_const.FAST_KWH;
    switch (req.body.radio1) {
        case 'slow': {
            const charg_minutes = battery_to_fill * 60 / slow_kwh;
            req.session.description = 'Slow charging';
            req.session.total_minutes = charg_minutes;
            req.session.pricingId = 1
            break;
        }
        case 'normal': {
            const charg_minutes = battery_to_fill * 60 / normal_kwh;
            req.session.description = 'Normal charging';
            req.session.total_minutes = charg_minutes;
            req.session.pricingId = 2
            break;
        }
        case 'fast': {
            const charg_minutes = battery_to_fill * 60 / fast_kwh;
            req.session.description = ('Supercharging');
            req.session.total_minutes = charg_minutes;
            req.session.pricingId = 3
            break;
        }
        default:
            break;
    }

    req.session.paymentId = (req.body.radio2 === 'cash') ? 1 : 2;
    res.redirect('/charging');
});


app.get('/charging', (req, res) => {

    if (!req.session.token) {
        req.session.login_error = "Please login first"
        res.redirect('/')
        return;
    }
    const description = req.session.description;
    const total_minutes = req.session.total_minutes
    const battery_percentage = [(req.session.batteryState / req.session.fullCap) * 100]
    
    res.render('charging', {
        description,
        total_minutes,
        battery_percentage
    });
});


app.post('/charging', (req, res) => {

    console.log('/charging ajax received');
    res.sendStatus(200);

    req.session.batteryState += parseFloat(req.body.energy);
    battery_states[req.session.token] += parseFloat(req.body.energy);

    req.body.energy = parseFloat(req.body.energy);
    let extra_properties = {
        point_id: 314,
        vehicle_id: 40,
        payment_id: req.session.paymentId,
        pricing_id: req.session.pricingId
    }
    let obj = req.body;
    Object.assign(obj, extra_properties)

    //json to csv 
    const items = [obj]
    const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
    const header = Object.keys(items[0])
    const csv = [
        header.join(','), // header row first
        ...items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
    ].join('\r\n')

    new_csv = csv.replace(/["]/g, "'")
    console.log('sending csv...\n', new_csv, '\n')

    const readable = new Readable()
    readable._read = () => {}
    readable.push(new_csv)
    readable.push(null)

    //const fileStream = fs.createReadStream('./temppp.csv');
    const formData = new FormData();
    //formData.append('file', fileStream);
    formData.append('file', readable, {
        filename: 'sessions.csv',
        contentType: 'text/csv'
    });
    const options = {
        hostname: host,
        port: API_PORT,
        path: '/evcharge/api/admin/system/sessionsupd',
        protocol: 'https:',
        method: 'POST',
        headers: {
            'X-OBSERVATORY-AUTH': req.session.token,
        },
    };
    (async function () {
        try {
            const response = await makeRequest(formData, options)
            console.log(response)
        } catch (error) {
            console.log("Error uploading file, validate admin role")
            console.log(error)
        }
    })();


});


// abstract and promisify actual network request
async function makeRequest(formData, options) {
    return new Promise((resolve, reject) => {
        const req = formData.submit(options, (err, res) => {
            if (err) {
                return reject(new Error(err.message))
            }

            if (res.statusCode !== 200) {
                return reject(new Error(`HTTP status code ${res.statusCode}`))
            }

            const body = []
            res.on('data', (chunk) => body.push(chunk))
            res.on('end', () => {
                const resString = Buffer.concat(body).toString()
                resolve(resString)
            })
        })
    })
}

app.get('/homepage/select-diagram', (req, res) => {

    if (!req.session.token) {
        req.session.login_error = "Please login first"
        res.redirect('/')
        return;
    } 

    res.render('select-diagram', {warning: null});

});


app.post('/homepage/select-diagram', (req, res) => {
    console.log(req.body)
    const {
        options: option,
        diagramId,
        'initial-date': initial_date,
        'final-date': final_date
    } = req.body;

    const new_init = initial_date.replace(/[-]/g, '')
    const new_final = final_date.replace(/[-]/g, '')
    const options = {
        hostname: host,
        port: API_PORT,
        path: '/evcharge/api',
        method: 'GET',
        headers: {
            'X-OBSERVATORY-AUTH': req.session.token
        }
    };
    let chunks_1 =[]
    if (option === "option3") {
        const temp_options = options;
        temp_options.path += '/ProvidersInfo?format=json'
        const request_1 = https.request(temp_options, (response) => {
            console.log('Fetch data statusCode', response.statusCode);
            response.on('data', (d) => {
                chunks_1.push(d);
            }).on('end', () => {
                if (response.statusCode !== 200) {
                    const warning ="No providers found"
                    res.render('select-diagram', {warning})
                    return
                }
                let data = Buffer.concat(chunks_1)
                let schema = JSON.parse(data);
                console.log(schema)

                const [provider_ids, provider_names] = schema.reduce(([a, b], x) => {
                    a.push(x.provider_id)
                    b.push(x.provider_name)
                    return [a, b]
                }, [[], []])
                var completed_requests = 0;
                const provider_energy = [];
                //Loop through each provider request
                provider_ids.forEach(elem => {
                    const provider_url = `/SessionsPerProvider/${elem}/${new_init}/${new_final}?format=json`
                    options.path = '/evcharge/api' + provider_url
                    let chunks_2 = []

                    const request_2 = https.request(options, (response) => {
                        console.log(`Fetch data for provider ${elem} statusCode ${response.statusCode}`);
                        response.on('data', (d) => {
                            chunks_2.push(d);

                        }).on('end', () => {
                            let data = Buffer.concat(chunks_2);
                            if (response.statusCode == 200) {
                                let schema = JSON.parse(data);
                                const total_energy = schema.reduce((a, x) => {
                                    return a+x.EnergyDelivered
                                }, 0)
                                provider_energy[elem-1] = total_energy
                            } else {
                                //If no data
                                provider_energy[elem-1] = 0
                            }
                            if (completed_requests++ == provider_ids.length -1) {
                                console.log("All provider requests are completed ")
                                const rounded_prov_energ = provider_energy.map(x => (Number(x)).toFixed(3))
                                req.session.prov_case = {
                                    dt: [provider_names, rounded_prov_energ],
                                }
                                console.log('providers [[energy], [providers]]', req.session.prov_case.dt)
                                req.session.diagram_case = 'prov_energy'
                                res.redirect('/homepage/select-diagram/diagram')

                            }
                        });
                    });
                    request_2.on('error', (e) => {
                        console.error(e);
                        const warning ="Please try again"
                        res.render('select-diagram', {warning})
                    });
                    request_2.end();

                    /********* Outer request ended  ******* */
                });


            })
        })
        request_1.on('error', (e) => {
            console.error(e);
            const warning ="Please try again"
            res.render('select-diagram', {warning})
        });
        request_1.end();
        /*********************** */


    } else {
        //Option 1 or 2, same API-CALL
        let chunks = []
        const ev_url = `/SessionsPerEV/${diagramId}/${new_init}/${new_final}?format=json`
        options.path += ev_url
        const request = https.request(options, (response) => {
            console.log('Fetch data statusCode', response.statusCode);
            response.on('data', (d) => {
                chunks.push(d);

            }).on('end', () => {
                // If no data
                if (response.statusCode !== 200) {
                    //categorize error codes
                    const warning = "No data for selected ID or dates";
                    res.render('select-diagram', {warning})
                    return
                }
                let data = Buffer.concat(chunks);
                let json_response = JSON.parse(data);
                if (option === "option1") {
                    let dt = [
                        ['Day', 'Energy (kWh)']
                    ];
                    var sessions = json_response.VehicleChargingSessionsList;
                    var sess;
                    for (sess of sessions) {
                        dt.push([sess.StartedOn.split(" ")[0], sess.EnergyDelivered]);
                    }
                    req.session.ev_case1 = {
                        dt: dt,
                        vehicle_id: diagramId
                    }
                    req.session.diagram_case = 'ev_energy'
                } else {
                    //Option 2 here... process data received
                    console.log(json_response)
                    const sessions = json_response.VehicleChargingSessionsList;
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                    months_cost = {}

                    sessions.forEach(element => {
                        const dt = new Date(element.StartedOn)
                        const date_key = `${months[dt.getMonth()]} ${dt.getFullYear()}`;
                        if (!months_cost[date_key]) {
                            months_cost[date_key] = parseFloat(element.SessionCost)
                        } else {
                            months_cost[date_key] += parseFloat(element.SessionCost)
                        }
                    });
                    // Obtain y and x axis arrays
                    const [vars, vals] = Object.keys(months_cost).reduce(([a, b], k) => {
                        a.push(k)
                        b.push(months_cost[k].toFixed(2))
                        return [a, b]
                    }, [[], []])

                    req.session.ev_case2 = {
                        dt: [vars, vals],
                        vehicle_id: diagramId
                    }
                    req.session.diagram_case = 'ev_cost'
                }
                res.redirect('/homepage/select-diagram/diagram')
            });
        });
        request.on('error', (e) => {
            console.error(e);
        });
        request.end();
    }
})



app.get('/homepage/select-diagram/diagram', (req, res) => {
    /*
    if (!req.session.token) {
        req.session.login_error = "Please login first"
        res.redirect('/')
        return;
    } 
    */        
   
    let dt, vehicle_id;
    const diagram_case = req.session.diagram_case;
    switch(diagram_case) {
        case 'ev_energy':
            dt = req.session.ev_case1.dt;
            vehicle_id = req.session.ev_case1.vehicle_id;
            break;
        case 'ev_cost':
            dt = req.session.ev_case2.dt;
            vehicle_id = req.session.ev_case2.vehicle_id;
            break;
        case 'prov_energy':
            dt = req.session.prov_case.dt;
            break;
        default:
            console.log("Unexpected default switch case");
    }
    
    res.render('diagram', {
        diagram_case,
        dt,
        vehicle_id
    });

});






app.get('/stations', (req, res) => {
    res.render('stations')
})

app.get('/pricing', (req, res) => {
    res.render('pricing')
})


var fs = require('fs');
var http = require('http');
var privateKey = fs.readFileSync('sslcert/server.key', 'utf-8');
var certificate = fs.readFileSync('sslcert/server.cer', 'utf-8');
var credentials = {key: privateKey, cert: certificate};

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(8080);
httpsServer.listen(5000);

/*

app.listen(PORT, () => {
    console.log(`WebApp listening at http://localhost:${PORT}...`);
});

*/