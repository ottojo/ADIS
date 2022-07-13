# Assignment 6: Benchmarking setup (mostly identical to Assignment 5)

## Folder structure

We conducted our tests for our new and old Node.JS Roary implementation. The folder structure is as follows:

* The **db-defaults** folder contains default database files for the tests.
* The **scripts** folder contains test scripts and R scripts for plot generation.
* The **results** folder contains raw *k6* CSV logs and the generated plots.

## Setup for reproducing the results

### Docker setup
* Build and run the container and ensure that this folder is mounted to /tests

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
* Aditionally, for plot generation, install R and the R tidyverse package. Easiest is using a package manager, e.g. using `apt install r-base r-cran-tidyverse`
    
### Running the tests

In general, for both assignments we provide the following test parameters:

* **HOST**: Specifies the target host (e.g. "localhost:8080")
* **MODE**: *count* (run a fixed number of requests), *duration* (run for a fixed number of time) and *rate* (run a fixed request rate). The former two follow a closed model and we only use the duration test in order to determine the maximum request rate the server can handle. The rate test follows an open model and ensures the specified request rate. This should be used for latency measurements due to the reasons explained above.
* **SCENARIO**: *index*, *login*, *read*, *write* or *mixed*. *index* simply fetches the index page, *login* performs logins, *read* fetches 200 Roars from the server, *write* posts a Roar, and *mixed* combines *read* and *write* such that every tenth request is a write and all others are reads.
* **DURATION**: The test duration in seconds (only for *rate* and *duration* modes)
* **COUNT**: The number of requests (only for the *count* mode)
* **RATE**: The request rate (only for *rate* mode)
* **VUS**: The number of constant VUs (only for *count* and *duration* modes)

All of these parameters are mandatory except if not used by a mode (e.g. *COUNT* being only used in *count* mode). These test parameters are passed using k6's `-e` flag, e.g. `-e MODE=count`. Apart from these test parameters, there are some additional k6 flags which we'll use. In general, an running a test is done something like this:

```console
k6 run \
    --out csv=./results/raw/<LOG_NAME>.csv \
    # --http-debug=headers oder --http-debug=full, optional for debug output
    -e HOST=<HOST> \
    -e MODE=<MODE> -e SCENARIO=<SCENARIO> \
    -e DURATION=<DUR> -e COUNT=<CNT> \
    -e RATE=<RATE> -e VUS=<VUS> \
    ./scripts/tests/roary-(new|old).js
```

Note, before running, the target should be reset into a comparable state. The easiest way to do this is by running the Roary implementations in a Docker container and resetting this container. Alternatively, with a manual setup, restarting the server process and resetting persistent data is also acceptable. For Roary, the only persistent types of data is the database file for which we provide defaults. 

We provide *mixed-read.db* and *write-login.db* for database defaults. The first one is intended for the mixed and read scenarios and contains a bunch of sample Roars so that the dbms actually has to do something. The second one only contains pre-defined users but no Roars. The database file must be copied to the "data" folder in the "roary" directory (for both the new and old implementations).

For executing the tests, we provide a convencience script *run-tests.sh* inside the scripts folder which executs one test at a time and prompts for an input before contiinuing. Resetting the target server to an initial state must still be done manually. This script can be used as follows:

```console
./scripts/run-tests.sh <OLD-HOST> <NEW-HOST>
```

Here, `OLD-HOST` and `NEW-HOST` must be the host and port numbers for the target servers of the old and new implementations (e.g. "localhost:8000" and "localhost:8001").

### Generating the plots

We provide two scripts for generating plots. The first one creates a bar chart showing the average request rate for *duration* test by scenario and VU count. To create this plot, one must run the *rps.R* script and pipe a CSV file to its stdin with three columns *type*, *scenario* *count* and *file*. The first column is either "old" or "new", the second column is a scenario, the third column is the constant number of VUs which was used and the last column is a path to the k6 log file for those parameters. The script generates an SVG file and outputs it to stdout. For example, the script can be used something like this:

```console
echo "type,scenario,count,file
old,index,10,../results/raw/old-index-u10-d30.csv
new,index,10,../results/raw/new-index-u10-d30.csv
" | Rscript --vanilla ./plots/rps.R > "../results/plots/rps.svg" 2>/dev/null
```

The second script generates a latency percentile plot by VU rate and implementation type (new or old, different scenarios are intended to be display in separate plots). The usage is similar but here, there's no *scenario* column and the *count* column becomes the *rate* column. Aditionally, the script accepts a command line argument to specify the plot title. E.g. this could something like this:

```console
echo "type,rate,file
old,50,../results/raw/old-login-r50-d30.csv
new,50,../results/raw/new-login-r50-d30.csv
" | Rscript --vanilla ./plots/latency.R "login test" > "../results/plots/latency-login.svg" 2>/dev/null
```

Assuming the convenience script for running the test was used and each of the tests in that script executed sucessfully, another convenience script can be used to generate plots from the CSV results. This convenience script is the *gen-plots.sh* script in the scripts folder and it can simply be invoked without any parameters:

```console
./scripts/gen-plots.sh
```

