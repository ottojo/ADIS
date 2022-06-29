#!/bin/bash
cd $(dirname "$0")

# TODO: Updating a zip is probably easier but I didn't bother to check how this works
cp -R ../Assignment3/jonas ./manuel/impls/Assignment3
cp -R ../Assignment4/manuel ./manuel/impls/Assignment4

cd manuel
zip -r ../benchmark.zip ./*
rm -rf ./impls/*
cd ..

pandoc -s -o README.pdf README.md
zip abgabe.zip README.pdf benchmark.zip
