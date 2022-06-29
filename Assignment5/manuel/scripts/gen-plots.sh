#!/bin/bash
cd $(dirname "$0")

####################################################################
#                       closed model results                       #
####################################################################

echo "type,scenario,count,file
Assignment4,index,1,../results/raw/Assignment4-index-u1-d30.csv
Assignment4,index,10,../results/raw/Assignment4-index-u10-d30.csv
Assignment4,index,25,../results/raw/Assignment4-index-u25-d30.csv
Assignment4,index,50,../results/raw/Assignment4-index-u50-d30.csv
Assignment4,login,1,../results/raw/Assignment4-login-u1-d30.csv
Assignment4,login,10,../results/raw/Assignment4-login-u10-d30.csv
Assignment4,login,25,../results/raw/Assignment4-login-u25-d30.csv
Assignment4,login,50,../results/raw/Assignment4-login-u50-d30.csv
Assignment4,read,1,../results/raw/Assignment4-read-u1-d30.csv
Assignment4,read,10,../results/raw/Assignment4-read-u10-d30.csv
Assignment4,read,25,../results/raw/Assignment4-read-u25-d30.csv
Assignment4,read,50,../results/raw/Assignment4-read-u50-d30.csv
Assignment4,write,1,../results/raw/Assignment4-write-u1-d30.csv
Assignment4,write,10,../results/raw/Assignment4-write-u10-d30.csv
Assignment4,write,25,../results/raw/Assignment4-write-u25-d30.csv
Assignment4,write,50,../results/raw/Assignment4-write-u50-d30.csv
Assignment4,mixed,1,../results/raw/Assignment4-mixed-u1-d30.csv
Assignment4,mixed,10,../results/raw/Assignment4-mixed-u10-d30.csv
Assignment4,mixed,25,../results/raw/Assignment4-mixed-u25-d30.csv
Assignment4,mixed,50,../results/raw/Assignment4-mixed-u50-d30.csv
Assignment3,index,1,../results/raw/Assignment3-index-u1-d30.csv
Assignment3,index,10,../results/raw/Assignment3-index-u10-d30.csv
Assignment3,index,25,../results/raw/Assignment3-index-u25-d30.csv
Assignment3,index,50,../results/raw/Assignment3-index-u50-d30.csv
Assignment3,login,1,../results/raw/Assignment3-login-u1-d30.csv
Assignment3,login,10,../results/raw/Assignment3-login-u10-d30.csv
Assignment3,login,25,../results/raw/Assignment3-login-u25-d30.csv
Assignment3,login,50,../results/raw/Assignment3-login-u50-d30.csv
Assignment3,read,1,../results/raw/Assignment3-read-u1-d30.csv
Assignment3,read,10,../results/raw/Assignment3-read-u10-d30.csv
Assignment3,read,25,../results/raw/Assignment3-read-u25-d30.csv
Assignment3,read,50,../results/raw/Assignment3-read-u50-d30.csv
Assignment3,write,1,../results/raw/Assignment3-write-u1-d30.csv
Assignment3,write,10,../results/raw/Assignment3-write-u10-d30.csv
Assignment3,write,25,../results/raw/Assignment3-write-u25-d30.csv
Assignment3,write,50,../results/raw/Assignment3-write-u50-d30.csv
Assignment3,mixed,1,../results/raw/Assignment3-mixed-u1-d30.csv
Assignment3,mixed,10,../results/raw/Assignment3-mixed-u10-d30.csv
Assignment3,mixed,25,../results/raw/Assignment3-mixed-u25-d30.csv
Assignment3,mixed,50,../results/raw/Assignment3-mixed-u50-d30.csv
" | Rscript --vanilla ./plots/rps.R > "../results/plots/rps.svg" 2>/dev/null

####################################################################
#                    open model index test                         #
####################################################################

echo "type,rate,file
Assignment3,100,../results/raw/Assignment3-index-r100-d30.csv
Assignment3,250,../results/raw/Assignment3-index-r250-d30.csv
Assignment3,500,../results/raw/Assignment3-index-r500-d30.csv
Assignment4,3000,../results/raw/Assignment4-index-r3000-d30.csv
Assignment4,4000,../results/raw/Assignment4-index-r4000-d30.csv
Assignment4,5000,../results/raw/Assignment4-index-r5000-d30.csv
" | Rscript --vanilla ./plots/latency.R "test: index" > "../results/plots/latency-index.svg" 2>/dev/null

####################################################################
#                    open model login test                         #
####################################################################

echo "type,rate,file
Assignment3,50,../results/raw/Assignment3-login-r50-d30.csv
Assignment3,100,../results/raw/Assignment3-login-r100-d30.csv
Assignment3,200,../results/raw/Assignment3-login-r200-d30.csv
Assignment4,50,../results/raw/Assignment4-login-r50-d30.csv
Assignment4,75,../results/raw/Assignment4-login-r75-d30.csv
Assignment4,100,../results/raw/Assignment4-login-r100-d30.csv
" | Rscript --vanilla ./plots/latency.R "test: login" > "../results/plots/latency-login.svg" 2>/dev/null

####################################################################
#                    open model read test                          #
####################################################################

echo "type,rate,file
Assignment3,1,../results/raw/Assignment3-read-r1-d30.csv
Assignment3,2,../results/raw/Assignment3-read-r2-d30.csv
Assignment3,5,../results/raw/Assignment3-read-r5-d30.csv
Assignment4,100,../results/raw/Assignment4-read-r100-d30.csv
Assignment4,150,../results/raw/Assignment4-read-r150-d30.csv
Assignment4,200,../results/raw/Assignment4-read-r200-d30.csv
" | Rscript --vanilla ./plots/latency.R "test: read" > "../results/plots/latency-read.svg" 2>/dev/null

####################################################################
#                    open model write test                         #
####################################################################

echo "type,rate,file
Assignment3,10,../results/raw/Assignment3-write-r10-d30.csv
Assignment3,50,../results/raw/Assignment3-write-r50-d30.csv
Assignment3,100,../results/raw/Assignment3-write-r100-d30.csv
Assignment4,200,../results/raw/Assignment4-write-r200-d30.csv
Assignment4,350,../results/raw/Assignment4-write-r350-d30.csv
Assignment4,400,../results/raw/Assignment4-write-r400-d30.csv
" | Rscript --vanilla ./plots/latency.R "test: write" > "../results/plots/latency-write.svg" 2>/dev/null

####################################################################
#                    open model mixed test                         #
####################################################################

echo "type,rate,file
Assignment3,1,../results/raw/Assignment3-mixed-r1-d30.csv
Assignment3,2,../results/raw/Assignment3-mixed-r2-d30.csv
Assignment3,5,../results/raw/Assignment3-mixed-r5-d30.csv
Assignment4,100,../results/raw/Assignment4-mixed-r100-d30.csv
Assignment4,150,../results/raw/Assignment4-mixed-r150-d30.csv
Assignment4,200,../results/raw/Assignment4-mixed-r200-d30.csv
" | Rscript --vanilla ./plots/latency.R "test: mixed" > "../results/plots/latency-mixed.svg" 2>/dev/null
