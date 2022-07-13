#!/bin/bash
cd $(dirname "$0")

####################################################################
#                       closed model results                       #
####################################################################

echo "type,scenario,count,file
new,index,1,../results/raw/new-index-u1-d30.csv
new,index,10,../results/raw/new-index-u10-d30.csv
new,index,25,../results/raw/new-index-u25-d30.csv
new,index,50,../results/raw/new-index-u50-d30.csv
new,login,1,../results/raw/new-login-u1-d30.csv
new,login,10,../results/raw/new-login-u10-d30.csv
new,login,25,../results/raw/new-login-u25-d30.csv
new,login,50,../results/raw/new-login-u50-d30.csv
new,read,1,../results/raw/new-read-u1-d30.csv
new,read,10,../results/raw/new-read-u10-d30.csv
new,read,25,../results/raw/new-read-u25-d30.csv
new,read,50,../results/raw/new-read-u50-d30.csv
new,write,1,../results/raw/new-write-u1-d30.csv
new,write,10,../results/raw/new-write-u10-d30.csv
new,write,25,../results/raw/new-write-u25-d30.csv
new,write,50,../results/raw/new-write-u50-d30.csv
new,mixed,1,../results/raw/new-mixed-u1-d30.csv
new,mixed,10,../results/raw/new-mixed-u10-d30.csv
new,mixed,25,../results/raw/new-mixed-u25-d30.csv
new,mixed,50,../results/raw/new-mixed-u50-d30.csv
old,index,1,../results/raw/old-index-u1-d30.csv
old,index,10,../results/raw/old-index-u10-d30.csv
old,index,25,../results/raw/old-index-u25-d30.csv
old,index,50,../results/raw/old-index-u50-d30.csv
old,login,1,../results/raw/old-login-u1-d30.csv
old,login,10,../results/raw/old-login-u10-d30.csv
old,login,25,../results/raw/old-login-u25-d30.csv
old,login,50,../results/raw/old-login-u50-d30.csv
old,read,1,../results/raw/old-read-u1-d30.csv
old,read,10,../results/raw/old-read-u10-d30.csv
old,read,25,../results/raw/old-read-u25-d30.csv
old,read,50,../results/raw/old-read-u50-d30.csv
old,write,1,../results/raw/old-write-u1-d30.csv
old,write,10,../results/raw/old-write-u10-d30.csv
old,write,25,../results/raw/old-write-u25-d30.csv
old,write,50,../results/raw/old-write-u50-d30.csv
old,mixed,1,../results/raw/old-mixed-u1-d30.csv
old,mixed,10,../results/raw/old-mixed-u10-d30.csv
old,mixed,25,../results/raw/old-mixed-u25-d30.csv
old,mixed,50,../results/raw/old-mixed-u50-d30.csv
" | Rscript --vanilla ./plots/rps.R > "../results/plots/rps.svg" 2>/dev/null

####################################################################
#                    open model index test                         #
####################################################################

echo "type,rate,file
old,3000,../results/raw/old-index-r3000-d30.csv
old,4000,../results/raw/old-index-r4000-d30.csv
old,5000,../results/raw/old-index-r5000-d30.csv
new,3000,../results/raw/new-index-r3000-d30.csv
new,4000,../results/raw/new-index-r4000-d30.csv
new,5000,../results/raw/new-index-r5000-d30.csv
" | Rscript --vanilla ./plots/latency.R "test: index" > "../results/plots/latency-index.svg" 2>/dev/null

####################################################################
#                    open model login test                         #
####################################################################

echo "type,rate,file
old,50,../results/raw/old-login-r50-d30.csv
old,75,../results/raw/old-login-r75-d30.csv
old,100,../results/raw/old-login-r100-d30.csv
new,50,../results/raw/new-login-r50-d30.csv
new,75,../results/raw/new-login-r75-d30.csv
new,100,../results/raw/new-login-r100-d30.csv
" | Rscript --vanilla ./plots/latency.R "test: login" > "../results/plots/latency-login.svg" 2>/dev/null

####################################################################
#                    open model read test                          #
####################################################################

echo "type,rate,file
old,100,../results/raw/old-read-r100-d30.csv
old,150,../results/raw/old-read-r150-d30.csv
old,200,../results/raw/old-read-r200-d30.csv
new,100,../results/raw/new-read-r100-d30.csv
new,150,../results/raw/new-read-r150-d30.csv
new,200,../results/raw/new-read-r200-d30.csv
" | Rscript --vanilla ./plots/latency.R "test: read" > "../results/plots/latency-read.svg" 2>/dev/null

####################################################################
#                    open model write test                         #
####################################################################

echo "type,rate,file
old,200,../results/raw/old-write-r200-d30.csv
old,350,../results/raw/old-write-r350-d30.csv
old,500,../results/raw/old-write-r500-d30.csv
new,200,../results/raw/new-write-r200-d30.csv
new,350,../results/raw/new-write-r350-d30.csv
new,500,../results/raw/new-write-r500-d30.csv
" | Rscript --vanilla ./plots/latency.R "test: write" > "../results/plots/latency-write.svg" 2>/dev/null

####################################################################
#                    open model mixed test                         #
####################################################################

echo "type,rate,file
old,100,../results/raw/old-mixed-r100-d30.csv
old,150,../results/raw/old-mixed-r150-d30.csv
old,200,../results/raw/old-mixed-r200-d30.csv
new,100,../results/raw/new-mixed-r100-d30.csv
new,150,../results/raw/new-mixed-r150-d30.csv
new,200,../results/raw/new-mixed-r200-d30.csv
" | Rscript --vanilla ./plots/latency.R "test: mixed" > "../results/plots/latency-mixed.svg" 2>/dev/null
