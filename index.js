import initApp from './app.js'
import fs from 'fs'
import express from 'express'
import bodyParser from "body-parser"
import crypto from 'crypto'
import http from 'http'

const app = initApp(express, bodyParser, fs, crypto, http)
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`App listening on port ${PORT}`))