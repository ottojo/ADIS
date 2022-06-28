#!/bin/bash
cd $(dirname "$0")

## TODO: For now, this suffices. A more automatic solution would be better
echo -e -n "type,rate,file\n"\
"Assignment4,100,../results/raw/Assignment4/lat-mixed-100.csv\n"\
"Assignment4,200,../results/raw/Assignment4/lat-mixed-200.csv\n"\
"Assignment4,500,../results/raw/Assignment4/lat-mixed-500.csv\n"\
"Assignment4,1000,../results/raw/Assignment4/lat-mixed-1000.csv\n"\
"Assignment3,100,../results/raw/Assignment3/lat-mixed-100.csv\n"\
"Assignment3,200,../results/raw/Assignment3/lat-mixed-200.csv\n"\
"Assignment3,500,../results/raw/Assignment3/lat-mixed-500.csv\n"\
"Assignment3,1000,../results/raw/Assignment3/lat-mixed-1000.csv\n"\
| Rscript --vanilla ./plots/latency.R "Mixed Test" > ../results/plots/latency-mixed.svg 2>/dev/null
