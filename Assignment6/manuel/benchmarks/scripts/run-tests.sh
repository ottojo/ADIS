#!/bin/bash
cd $(dirname "$0")
OLDHOST="$1"
NEWHOST="$2"

if [ "x$OLDHOST" = "x" ]; then
    echo "Missing OLD host"
    exit 1
fi

if [ "x$NEWHOST" = "x" ]; then
    echo "Missing NEW host"
    exit 1
fi


for version in "old" "new"; do

    if [ "$version" = "old" ]; then
        HOST="$OLDHOST"
    else
        HOST="$NEWHOST"
    fi
    
    ####################################################################
    #                       closed model tests                         #
    ####################################################################

    for scenario in "index" "login" "write" "read" "mixed"; do
    for vus in 1 10 25 50; do
        spec="$version-$scenario-u$vus-d30"
        file="../results/raw/$spec.csv"
        
        
        read -r -p "Prepare target for test: $spec. Press ENTER to run test."
        
        k6 run \
            --out "csv=$file" \
            -e "HOST=$HOST" \
            -e "MODE=duration" \
            -e "DURATION=30" \
            -e "SCENARIO=$scenario" \
            -e "VUS=$vus" \
            "./tests/roary-$version.js"
        
        echo ""
    done
    done
    
    ####################################################################
    #                       open model tests                           #
    ####################################################################
    ### TODO: Remove redundancy

    ## index test
    for rate in 3000 4000 5000; do
        spec="$version-index-r$rate-d30"
        file="../results/raw/$spec.csv"
        read -r -p "Prepare target for test: $spec. Press ENTER to run test"
        
        k6 run \
            --out "csv=$file" \
            -e "HOST=$HOST" \
            -e "MODE=rate" \
            -e "DURATION=30" \
            -e "SCENARIO=index" \
            -e "RATE=$rate" \
            "./tests/roary-$version.js"
        
        echo ""
    done

    ## login test
    for rate in 50 75 100; do
        spec="$version-login-r$rate-d30" # two requests sent in this scenario
        file="../results/raw/$spec.csv"
        read -r -p "Prepare target for test: $spec. Press ENTER to run test"
        
        k6 run \
            --out "csv=$file" \
            -e "HOST=$HOST" \
            -e "MODE=rate" \
            -e "DURATION=30" \
            -e "SCENARIO=login" \
            -e "RATE=$rate" \
            "./tests/roary-$version.js"
        
        echo ""
    done

    ## write test
    for rate in 200 350 500; do
        spec="$version-write-r$rate-d30"
        file="../results/raw/$spec.csv"
        read -r -p "Prepare target for test: $spec. Press ENTER to run test"
        
        k6 run \
            --out "csv=$file" \
            -e "HOST=$HOST" \
            -e "MODE=rate" \
            -e "DURATION=30" \
            -e "SCENARIO=write" \
            -e "RATE=$rate" \
            "./tests/roary-$version.js"
        
        echo ""
    done

    ## read test
    for rate in 100 150 200; do
        spec="$version-read-r$rate-d30"
        file="../results/raw/$spec.csv"
        read -r -p "Prepare target for test: $spec. Press ENTER to run test"
        
        k6 run \
            --out "csv=$file" \
            -e "HOST=$HOST" \
            -e "MODE=rate" \
            -e "DURATION=30" \
            -e "SCENARIO=read" \
            -e "RATE=$rate" \
            "./tests/roary-$version.js"
        
        echo ""
    done

    ## mixed test
    for rate in 100 150 200; do
        spec="$version-mixed-r$rate-d30"
        file="../results/raw/$spec.csv"
        read -r -p "Prepare target for test: $spec. Press ENTER to run test"
        
        k6 run \
            --out "csv=$file" \
            -e "HOST=$HOST" \
            -e "MODE=rate" \
            -e "DURATION=30" \
            -e "SCENARIO=mixed" \
            -e "RATE=$rate" \
            "./tests/roary-$version.js"
        
        echo ""
    done

done

