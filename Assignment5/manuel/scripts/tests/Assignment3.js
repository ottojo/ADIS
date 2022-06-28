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
//                    utility functions                   //
////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////
//                    setup function                      //
////////////////////////////////////////////////////////////

export function setup() {
    if (!["read", "write", "mixed"].includes(scen.exec))
        return;

    // Get CSRF token
    const response = http.get(`http://${__ENV.HOST}/accounts/login/`);
    const regex = /name="csrfmiddlewaretoken"\s+value="([^"]+)"/;
    const match = response.body.match(regex);
    const csrftoken = match[1];

    // Login
    const res = http.post(`http://${__ENV.HOST}/accounts/login/`, {
        username: "jonas",
        password: "jonasjonas",
        csrfmiddlewaretoken: csrftoken,
    }, { redirects: 0 });

    const sessionid = res.cookies["sessionid"][0].value;
    return sessionid;
}

////////////////////////////////////////////////////////////
//            actual scenario functions                   //
////////////////////////////////////////////////////////////

export function index() {
    http.get(`http://${__ENV.HOST}`)
}

export function login() {
    // Get CSRF token
    const response = http.get(`http://${__ENV.HOST}/accounts/login/`);
    const regex = /name="csrfmiddlewaretoken"\s+value="([^"]+)"/;
    const match = response.body.match(regex);
    const csrftoken = match[1];

    http.post(`http://${__ENV.HOST}/accounts/login`, {
        email: (exec.scenario.iterationInTest % 100) + "@b.c",
        password: "test",
        csrfmiddlewaretoke: csrftoken,
    })
}

export function read(cookie) {
    http.cookieJar().set(`http://${__ENV.HOST}`, "sessionid", cookie)
    http.get(`http://${__ENV.HOST}/api/roars/html`)
}

export function write(cookie) {
    http.cookieJar().set(`http://${__ENV.HOST}`, "sessionid", cookie)

    http.post(`http://${__ENV.HOST}/action/post`, {
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, [...]"
    })
}

export function mixed(cookie) {
    http.cookieJar().set(`http://${__ENV.HOST}`, "sessionid", cookie)
    if (exec.scenario.iterationInTest % 10 == 0) {
        http.post(`http://${__ENV.HOST}/action/post`, {
            text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, [...]"
        },
        )
    } else {
        const res = http.get(`http://${__ENV.HOST}/api/roars/html`)
    }
}
