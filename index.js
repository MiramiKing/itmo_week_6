import express from 'express';
import bodyParser from 'body-parser'
import crypto from 'crypto';
import http from 'http';
import m from 'mongoose'
import {createReadStream} from 'fs';
import UserModel from './models/user.js'
import puppeteer from 'puppeteer'

import appSrc from './app.js';

const User = UserModel(m)
const app = appSrc(express, bodyParser, createReadStream, crypto, http, User, m, puppeteer);
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`App is listening on port ${PORT}`))