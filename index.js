import express from 'express';
import bodyParser from 'body-parser'
import crypto from 'crypto';
import http from 'http';
import { createReadStream } from 'fs';


import appSrc from './app.js';

const app = appSrc(express, bodyParser, createReadStream, crypto, http);

app.listen(process.env.PORT ?? 4321);