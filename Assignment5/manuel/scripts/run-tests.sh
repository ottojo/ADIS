#!/bin/bash
cd $(dirname "$0")
A3HOST="$1"
A4HOST="$2"

if [ "x$A3HOST" = "x" ]; then
    echo "Missing A3 host"
    exit 1
fi

if [ "x$A4HOST" = "x" ]; then
    echo "Missing A4 host"
    exit 1
fi

####################################################################
#                       closed model tests                         #
####################################################################

for assignment in "Assignment3" "Assignment4"; do
for scenario in "index" "login" "write" "read" "mixed"; do
for vus in 1 10 25 50; do
    spec="$assignment-$scenario-u$vus-d30"
    file="../results/raw/$spec.csv"
    
    if [ "$assignment" = "Assignment3" ]; then
        HOST="$A3HOST"
    else
        HOST="$A4HOST"
    fi
    
    read -r -p "Prepare target for test: $spec. Press ENTER to run test."
    
    k6 run \
        --out "csv=$file" \
        -e "HOST=$HOST" \
        -e "MODE=duration" \
        -e "DURATION=30" \
        -e "SCENARIO=$scenario" \
        -e "VUS=$vus" \
        "./tests/$assignment.js"
    
    echo ""
done
done

####################################################################
#               Assignment 3  open model tests                     #
####################################################################
### TODO: Remove redundancy

## index test
for rate in 100 250 500; do
    spec="Assignment3-index-r$rate-d30"
    file="../results/raw/$spec.csv"
    read -r -p "Prepare target for test: $spec. Press ENTER to run test"
    
    k6 run \
        --out "csv=$file" \
        -e "HOST=$A3HOST" \
        -e "MODE=rate" \
        -e "DURATION=30" \
        -e "SCENARIO=index" \
        -e "RATE=$rate" \
        "./tests/Assignment3.js"
    
    echo ""
done

## login test
for rate in 25 50 100; do
    spec="Assignment3-login-r$((rate * 2))-d30" # two requests sent in this scenario
    file="../results/raw/$spec.csv"
    read -r -p "Prepare target for test: $spec. Press ENTER to run test"
    
    k6 run \
        --out "csv=$file" \
        -e "HOST=$A3HOST" \
        -e "MODE=rate" \
        -e "DURATION=30" \
        -e "SCENARIO=login" \
        -e "RATE=$rate" \
        "./tests/Assignment3.js"
    
    echo ""
done

## write test
for rate in 10 50 100; do
    spec="Assignment3-write-r$rate-d30"
    file="../results/raw/$spec.csv"
    read -r -p "Prepare target for test: $spec. Press ENTER to run test"
    
    k6 run \
        --out "csv=$file" \
        -e "HOST=$A3HOST" \
        -e "MODE=rate" \
        -e "DURATION=30" \
        -e "SCENARIO=write" \
        -e "RATE=$rate" \
        "./tests/Assignment3.js"
    
    echo ""
done

## read test
for rate in 1 2 5; do
    spec="Assignment3-read-r$rate-d30"
    file="../results/raw/$spec.csv"
    read -r -p "Prepare target for test: $spec. Press ENTER to run test"
    
    k6 run \
        --out "csv=$file" \
        -e "HOST=$A3HOST" \
        -e "MODE=rate" \
        -e "DURATION=30" \
        -e "SCENARIO=read" \
        -e "RATE=$rate" \
        "./tests/Assignment3.js"
    
    echo ""
done

## mixed test
for rate in 2 5; do
    spec="Assignment3-mixed-r$rate-d30"
    file="../results/raw/$spec.csv"
    read -r -p "Prepare target for test: $spec. Press ENTER to run test"
    
    k6 run \
        --out "csv=$file" \
        -e "HOST=$A3HOST" \
        -e "MODE=rate" \
        -e "DURATION=30" \
        -e "SCENARIO=mixed" \
        -e "RATE=$rate" \
        "./tests/Assignment3.js"
    
    echo ""
done


####################################################################
#               Assignment 4  open model tests                     #
####################################################################
### TODO: Remove redundancy

# index test
for rate in 3000 4000 5000; do
    spec="Assignment4-index-r$rate-d30"
    file="../results/raw/$spec.csv"
    read -r -p "Prepare target for test: $spec. Press ENTER to run test"
    
    k6 run \
        --out "csv=$file" \
        -e "HOST=$A4HOST" \
        -e "MODE=rate" \
        -e "DURATION=30" \
        -e "SCENARIO=index" \
        -e "RATE=$rate" \
        "./tests/Assignment4.js"
    
    echo ""
done

## login test
for rate in 50 75 100; do
    spec="Assignment4-login-r$rate-d30" # two requests sent in this scenario
    file="../results/raw/$spec.csv"
    read -r -p "Prepare target for test: $spec. Press ENTER to run test"
    
    k6 run \
        --out "csv=$file" \
        -e "HOST=$A4HOST" \
        -e "MODE=rate" \
        -e "DURATION=30" \
        -e "SCENARIO=login" \
        -e "RATE=$rate" \
        "./tests/Assignment4.js"
    
    echo ""
done

## write test
for rate in 200 350 500; do
    spec="Assignment4-write-r$rate-d30"
    file="../results/raw/$spec.csv"
    read -r -p "Prepare target for test: $spec. Press ENTER to run test"
    
    k6 run \
        --out "csv=$file" \
        -e "HOST=$A4HOST" \
        -e "MODE=rate" \
        -e "DURATION=30" \
        -e "SCENARIO=write" \
        -e "RATE=$rate" \
        "./tests/Assignment4.js"
    
    echo ""
done

## read test
for rate in 100 150 200; do
    spec="Assignment4-read-r$rate-d30"
    file="../results/raw/$spec.csv"
    read -r -p "Prepare target for test: $spec. Press ENTER to run test"
    
    k6 run \
        --out "csv=$file" \
        -e "HOST=$A4HOST" \
        -e "MODE=rate" \
        -e "DURATION=30" \
        -e "SCENARIO=read" \
        -e "RATE=$rate" \
        "./tests/Assignment4.js"
    
    echo ""
done

## mixed test
for rate in 100 150 200; do
    spec="Assignment4-mixed-r$rate-d30"
    file="../results/raw/$spec.csv"
    read -r -p "Prepare target for test: $spec. Press ENTER to run test"
    
    k6 run \
        --out "csv=$file" \
        -e "HOST=$A4HOST" \
        -e "MODE=rate" \
        -e "DURATION=30" \
        -e "SCENARIO=mixed" \
        -e "RATE=$rate" \
        "./tests/Assignment4.js"
    
    echo ""
done
