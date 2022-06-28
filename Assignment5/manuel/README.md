# Assignment 5

## Preface: Load Models and Coordinated Omission
Since one of the Software Projects I conducted was concerned with the evaluation of open source load testing tools I have some experience in this area. I will give a quick motivation and a reason why I chose [k6](https://k6.io) as the load testing tool to conduct these tests.

First and foremost, one of the most important aspects of load testing is that the load test should mirror real user behaviour. Many well-known HTTP benchmarking tools follow a so-called **closed model** approach. To see what this means consider the relation between response times and request rate. Simply put, the average request rate is the reciprocal of the average response time. If a server is under high load, response times will increase. Due to the sequential nature of HTTP where, over a single connection, a client waits for a response before sending the next request, the actual request rate - and thus the generated load - is controlled indirectly by the server via response times.

Now assume a simple load spike, where 1 out of 100 requests takes much longer than all the others. This response time spike wouldn't be seen in a 99th latency percentile, thus omitting problematic behaviour because all subsequent requests get delayed too. This behaviour is called **Coordinated Omission**, *Coordinated* because the load generator implicity coordinates the actual load with the server through response times and *Omission* because it omits problematic behaviour (the delay of subsequent requests).

Of course, a *delay* of subsequent requests requires a notion of an expected point in time where a request is sent. This requires an "execution plan" which determines when requests are sent. The most simple type of such a plan is a constant request rate. A constant rate implies that a request must be finished within a maxmimum response time - the interval between requests. If this is not the case for a request, subsequent requests will be delayed and the overall request rate is not the one we intend.

There are two ways to solve this problem: The first one is **Latency Correction**. This is a simple approach: Just add the delays from the expected send time to the actual response time. However, this is not actually realistic behaviour since in reality, request are still not sent at the expected rate. This may impact server behaviour because a reduced request rate decreases load on the server and may allow it to recover. In reality, users will arrive independent of the server load (the extreme case being DoS attacks). To simulate this behaviour we have to create a new connection and send the request using this connection. This implies that the total number of active connections is variable and driven by response times.

This leads to two broad types of load models: **Closed Models** where we specify a fixed number of connections. The request rate is driven by response times and such tools may suffer from Coordinated Omission. This may be mitigated via Latency Correction but this is still not realistic behaviour. The *wrk2* tool proposed by the assignment is a latency-corrected closed model tool. The other type is **Open Model** tools where we specify a constant request rate and if necessary, new connections are created to compensate for long response times. Since requests will never get delayed this way, there's no need for latency correction.

Lastly, real user behaviour doesn't match both of these types exactly. Most of the times, in reality we have a situation which matches the *open model* scenario in terms of **users**, e.g. users might arrive at a website, click a few links and then leave the website. Thus, we have a scenario where users come at a certain rate (might vary over time), therefore following an open model. However, each user individually follows a closed model. For example, if a user clicks a link, the user must wait for the response before the next link can be clicked (since it's contained in the html response), this implies a closed model.

For this reason, many advanced tools follow an open model in terms of the connection count. A "load profile" in terms of the user rate is specified (e.g. simply a constant rate). Each user then executes a "scenario" which e.g. consists of fetching the main HTML page, then logging in, etc. These users are called "virtual users" and these tools can be called VU-based tools. VU-based tools (in comparison to "benchmarking" tools) are generally more complex so they don't achieve quite the same level of performance, however they offer many convenience features e.g. Cookies (crucial e.g. for session management) and scripting which is essential to define realistic scenarios.

As I stated in the beginning, I conducted a project where multiple open source load testing tools were compared. Given our Roary application, there are some requirements which a load testing tool for Roary requires. Namely, since we use cookies for session management, Cookie support is essential. Second, an open model is desirable since Roary represents a publicly accessible website where users arrive independently of response times. These simple requirements already eliminate a lot of tools. The example tool in the assignment description, *wrk2* can be scripted and with a lot of effort, Cookies can be implemented but this requires extracting the Set-Cookie header and is generally really cumbersome. It's also not an open model tool. 

In my project, I found the best open model tools to be **Gatling** and **k6**. The former one is generally a bit more annoying to set up and also doesn't provide the same amount of detailed metrics. Performace wise, both of them are similar. For this reason I chose *k6* as the tool of choice.

## Setup

### Docker setup
* Build and run the container and ensure that this folder is mounted to /root

    ```console
    docker build -t <NAME> .
    docker run --network=host -v "$(pwd):/tests" -it --rm <NAME>
    ```
* The container opens a console, see the "Running the tests" section below for details how to run the tests
* In theory, for k6, the k6 container provided by grafana (`docker pull grafana/k6`) can also be used but our container
also contains the R environment for generating the plots
* Note that this solution mounts this folder in the container's "/tests" directory, so all results will be available locally too. However, they will all be owned by root. To own them after being done, simply use `chown -R <USER>:<GROUP> .`
* The test scripts accept the host as an argument (k6's "-e" option), *localhost* won't work because that refers to the container's environment. However, using the `--network=host` option as shown above but this will only work on Linux.
Alternatively use a manual setup or use the "host.docker.internal" address (see [here](https://stackoverflow.com/questions/24319662/from-inside-of-a-docker-container-how-do-i-connect-to-the-localhost-of-the-mach)). Even better is executing the load generator and the target on different machines and then use proper host names or IP adresses.

### Manual setup

* Install k6 as described [here](https://k6.io/docs/getting-started/installation/)
* Note the "Troubleshooting" section below, sometimes there is an error because of a missing gpg directory which is not created by default
    
## Running the tests

We conducted our tests for our implementations of Assignment 3 and 4. (**TODO**: Maybe add impl 2 ?)
First, we'll briefly describe the folder structure:

* The **impls** folder simply contains our solutions for Assignments 3 and 4. For Assignment 4, this is
necessary, because we forgot to submit that one... (and for completeness, Assignment 3 is there as well).
* The **db-defaults** folder contains instructions and default database files for the tests.
* The **scripts** folder contains test scripts and R scripts for plot generation.
* The **results** folder contains raw *k6* CSV logs and the generated plots.

In general, for both assignments we provide the following test parameters:

* **HOST**: Specifies the target host (e.g. "localhost:8080")
* **MODE**: *count* (run a fixed number of requests), *duration* (run for a fixed number of time) and *rate* (run a fixed request rate). The former two follow a closed model and we only use the duration test in order to determine the maximum request rate the server can handle. The rate test follows an open model and ensures the specified request rate. This should be used for latency measurements due to the reasons explained above.
* **SCENARIO**: *index*, *login*, *read*, *write* or *mixed*. *index* simply fetches the index page, *login* performs logins, *read* fetches 50 Roars from the server, *write* posts a Roar, and *mixed* combines *read* and *write* such that every tenth request is a write and all others are reads.
* **DURATION**: The test duration in seconds (only for *rate* and *duration* modes)
* **COUNT**: The number of requests (only for the *count* mode)
* **RATE**: The request rate (only for *rate* mode)

All of these parameters are mandatory except if not used by a mode (e.g. *COUNT* being only used in *count* mode). These test parameters are passed using k6's `-e` flag, e.g. `-e MODE=count`. Apart from these test parameters, there are some additional k6 flags which we'll use. In general, an running a test is done something like this:

```console
k6 run \
    --out csv=./results/raw/Assignment<X>/<LOG_NAME>.csv \
    # --http-debug=headers oder --http-debug=full, optional for debug output
    -e HOST=<HOST> \
    -e MODE=<MODE> -e SCENARIO=<SCENARIO> \
    -e DURATION=<DUR> -e COUNT=<CNT> -e RATE=<RATE> \
    ./scripts/tests/Assignment<X>.js
```

Note, before running, the target should be reset into a comparable state. The easiest way to do this is by running the Roary implementations in a Docker container and resetting this container. Alternatively, with a manual setup, restarting the server process and resetting persistent data is also acceptable. For Roary, the only persistent data is database defaults which are provided in the *db-defaults* folder.

## Generating the plots

To generate the plots using the R script, do the following:

```console
TODO
```

**TODO**: Maybe generate plots using another library (plotly, matplotlib, etc.) ?

## Performance Results

**TODO**
