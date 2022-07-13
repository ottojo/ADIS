#!/bin/bash
cd $(dirname "$0")

# Create build folder
mkdir build 2>/dev/null

# Create benchmarks.zip
cd benchmarks
zip -r ../build/benchmarks.zip ./* -x ./results/raw/*.csv >/dev/null
cd ..

# Create roary-new.zip
cd roary-new
zip -r ../build/roary-new.zip ./* >/dev/null
cd ..

# Create roary-old.zip
cd roary-old
zip -r ../build/roary-old.zip ./* >/dev/null
cd ..

# Compile README.md to PDF
pandoc -s -o ./build/README.pdf README.md

# zip everything into one zip
cd build
zip abgabe.zip README.pdf benchmarks.zip roary-new.zip roary-old.zip >/dev/null
