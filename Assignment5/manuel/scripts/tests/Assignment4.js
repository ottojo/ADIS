import http from 'k6/http';
import exec from 'k6/execution';

////////////////////////////////////////////////////////////
//                Possible scenarios                      //
////////////////////////////////////////////////////////////

const scenarios = {
    rate: {
        executor: "constant-arrival-rate",
        duration: parseInt(__ENV.DURATION) + "s",
        rate: parseInt(__ENV.RATE),
        timeUnit: "1s",
        preAllocatedVUs: 50,
        maxVUs: 500,
        exec: "index"
    },
    duration: {
        executor: "constant-vus",
        duration: parseInt(__ENV.DURATION) + "s",
        vus: parseInt(__ENV.VUS),
        exec: "index"
    },
    count: {
        executor: "shared-iterations",
        iterations: parseInt(__ENV.COUNT),
        vus: parseInt(__ENV.VUS),
        exec: "index"
    }
}

////////////////////////////////////////////////////////////
//                 Enabled scenarios                      //
////////////////////////////////////////////////////////////

let scen = scenarios[__ENV.MODE];

if (scen === undefined)
    throw "Missing mode. Must be rate, duration or count";

scen.exec = __ENV.SCENARIO;

if (!["index", "login", "read", "write", "mixed"].includes(scen.exec))
    throw "Invalid Scenario. Must be index, login, read, write or mixed"

export const options = {
    scenarios: {
        test: scen
    }
}

////////////////////////////////////////////////////////////
//                    setup function                      //
////////////////////////////////////////////////////////////

export function setup() {
    if (!["read", "write", "mixed"].includes(scen.exec))
        return;
        
    const res = http.post(`http://${__ENV.HOST}/api/login`, {
        email: "0@b.c",
        password: "test"
    })
    
    return res.cookies["connect.sid"][0].value
}

////////////////////////////////////////////////////////////
//            actual scenario functions                   //
////////////////////////////////////////////////////////////

export function index() {
    http.get(`http://${__ENV.HOST}`)
}

export function login() {
    http.post(`http://${__ENV.HOST}/api/login`,  {
        email: (exec.scenario.iterationInTest % 100) + "@b.c",
        password: "test"
    })
}

export function read(cookie) {
    http.cookieJar().set(`http://${__ENV.HOST}`, "connect.sid", cookie)
    http.get(`http://${__ENV.HOST}/api/getRoars?upTo=0&limit=200`)
}

export function write(cookie) {
    http.cookieJar().set(`http://${__ENV.HOST}`, "connect.sid", cookie)
    http.post(`http://${__ENV.HOST}/api/postRoar`, 
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, [...]",
        {headers: {"Content-Type": "text/plain"}})
}

export function mixed(cookie) {
    http.cookieJar().set(`http://${__ENV.HOST}`, "connect.sid", cookie)
    
    if (exec.scenario.iterationInTest % 10 == 0)
        http.post(`http://${__ENV.HOST}/api/postRoar`, 
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, [...]",
            {headers: {"Content-Type": "text/plain"}})
    else
        http.get(`http://${__ENV.HOST}/api/getRoars?upTo=0&limit=50`)
}
