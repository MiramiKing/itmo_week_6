import express from 'express';
import bodyParser from 'body-parser'
import crypto from 'crypto';
import http from 'http';
import m from 'mongoose'
import moment from 'moment';
import {createReadStream, writeFileSync} from 'fs';
import UserModel from './models/user.js'
import puppeteer from 'puppeteer'
import https from 'https'
import appSrc from './app.js';
import NodeRSA from "node-rsa";
import multer from 'multer';
import sizeOf from "image-size"
import sharp from "sharp";

const User = UserModel(m)
const app = appSrc(express, bodyParser, createReadStream, writeFileSync, moment, crypto, http, https, User, m, puppeteer, NodeRSA,
    multer, sizeOf,sharp);
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`App is listening on port ${PORT}`))