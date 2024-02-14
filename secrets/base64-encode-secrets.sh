#!/bin/bash

cat secrets.env | base64 -w 0 secrets.env > secrets.b64