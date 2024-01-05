import express from 'express';
import cors from 'cors';

import dotenv from 'dotenv';
dotenv.config({ debug:true });

// Watson Discovery
import DiscoveryV2 from 'ibm-watson/discovery/v2.js';
import { IamAuthenticator } from 'ibm-watson/auth/index.js';
const discovery = new DiscoveryV2({
   version: '{version}',
   authenticator: new IamAuthenticator({
      apikey: process.env.WD_KEY,
   }),
   version: '2020-08-30',
   serviceUrl: process.env.WD_BASE_URL,
});

// File
import fs from 'fs';
import path from 'path';

// File upload function
import multer from 'multer';
const upload = multer({dest: 'tmp/'});

// WebCrawl
import puppeteer from 'puppeteer';

var server = express();
server
   .use(express.urlencoded({extended: false}))
   .use(express.json())
   .use(express.static('public'))

   // CORS
   .use(cors())

   // Watson Discovery v2
   .post('/api', async (req, res) => {
      let body = req.body;

      // Check Params
      if (!(body.params)) {
         res.status(500).send({"error": "Invalid projectId!"});
         return;
      }

      if (typeof process.env.WD_KEY == 'undefined') {
         console.error('Error: "WD_KEY" is not set.');
         console.error('Please consider adding a .env file with API_KEY.');
         process.exit(1);
      }

      switch (body.api) {
         case "query":
            discovery.query(body.params)
               .then(response => {
                  // console.log(JSON.stringify(response.result, null, 2));
                  res.json(response.result);
               })
               .catch(err => {
                  console.log('error:', err);
                  res.status(500).send({"error": "Failed Watson Discovery query."});
               });
            break;

         case "listProjects":
            discovery.listProjects()
               .then(response => {
                  console.log(JSON.stringify(response.result, null, 2));
                  res.json(response.result);
               })
               .catch(err => {
                  console.log('error:', err);
                  res.status(500).send({"error": "Failed Watson Discovery listProjects."});
               });
            break;

         case "listCollections":
            discovery.listCollections(body.params)
               .then(response => {
                  console.log(JSON.stringify(response.result, null, 2));
                  res.json(response.result);
               })
               .catch(err => {
                  console.log('error:', err);
                  res.status(500).send({"error": "Failed Watson Discovery listCollections."});
               });
            break;

         case "listTrainingQueries":
            discovery.listTrainingQueries(body.params)
               .then(response => {
                  console.log(JSON.stringify(response.result, null, 2));
                  res.json(response.result);
               })
               .catch(err => {
                  console.log('error:', err);
                  res.status(500).send({"error": "Failed Watson Discovery listTrainingQueries."});
               });
            break;

         case "createTrainingQuery":
            discovery.createTrainingQuery(body.params)
               .then(response => {
                  console.log(JSON.stringify(response.result, null, 2));
                  res.json(response.result);
               })
               .catch(err => {
                  console.log('error:', err);
                  res.status(500).send({"error": "Failed Watson Discovery createTrainingQuery."});
               });
            break;

         case "getTrainingQuery":
            discovery.getTrainingQuery(body.params)
               .then(response => {
                  console.log(JSON.stringify(response.result, null, 2));
                  res.json(response.result);
               })
               .catch(err => {
                  console.log('error:', err);
                  res.status(500).send({"error": "Failed Watson Discovery getTrainingQuery."});
               });
            break;

         case "updateTrainingQuery":
            discovery.updateTrainingQuery(body.params)
               .then(response => {
                  console.log(JSON.stringify(response.result, null, 2));
                  res.json(response.result);
               })
               .catch(err => {
                  console.log('error:', err);
                  res.status(500).send({"error": "Failed Watson Discovery updateTrainingQuery."});
               });
            break;

         case "listDocuments":
            discovery.listDocuments(body.params)
               .then(response => {
                  // console.log(JSON.stringify(response.result, null, 2));
                  res.json(response.result);
               })
               .catch(err => {
                  console.log('error:', err);
                  res.status(500).send({"error": "Failed Watson Discovery listDocuments."});
               });
            break;
         case "getDocument":
            discovery.getDocument(body.params)
               .then(response => {
                  // console.log(JSON.stringify(response.result, null, 2));
                  res.json(response.result);
               })
               .catch(err => {
                  console.log('error:', err);
                  res.status(500).send({"error": "Failed Watson Discovery getDocument."});
               });
            break;

         default:
            console.log("Unsupported api!");
            res.status(500).send({"error": "Unsupported api!"});
            break;
      }
   })

   .post('/:api/:pid/:cid', upload.single('tmpfile'), async (req, res) => {
      // Path params
      let api = req.params.api;
      if (!api) {
         console.log('error: no params api');
         res.status(500).send({"error": "Failed Watson Discovery addDocument."});
      }
      let pid = req.params.pid;
      if (!pid) {
         console.log('error: no params projectId');
         res.status(500).send({"error": "Failed Watson Discovery addDocument."});
      }
      let cid = req.params.cid;
      if (!cid) {
         console.log('error: no params collectionId');
         res.status(500).send({"error": "Failed Watson Discovery addDocument."});
      }

      // check Discovery env
      if (typeof process.env.WD_KEY == 'undefined') {
         console.error('Error: "WD_KEY" is not set.');
         console.error('Please consider adding a .env file with WD_KEY.');
         process.exit(1);
      }

      // check upload file
      let file = req.file;
      if (file) {
         console.log("file:" + file.originalname);
      } else {
         console.log('error: no params');
         res.status(500).send({"error": "Failed Watson Discovery addDocument. no params."});
         return;
      }

      switch (api) {
         case "addDocument":
            const addParams = {
               projectId: pid,
               collectionId: cid,
               file: fs.createReadStream(file.path),
               filename: file.originalname,
               fileContentType: file.mimetype,
            };

            discovery.addDocument(addParams)
               .then(response => {
                  // console.log(JSON.stringify(response.result, null, 2));
                  res.json(response.result);

                  // remove tmp file
                  // const forder_path = "public/cap"
                  // const file_path = path.join(forder_path, file);
                  fs.unlinkSync(file.path);
               })
               .catch(err => {
                  console.log('error:', err);
                  res.status(500).send({"error": "Failed Watson Discovery addDocument."});
               });
            break;

         default:
            console.log("Unsupported api!");
            res.status(500).send({"error": "Unsupported api!"});
            break;
      }
   })

   // Web Crawl
   .post("/crawl", async (req, res) => {
      let param = req.body;
      if (!(param?.url)) {
         res.status(500).send({"error": "Invalid params!"});
         return;
      }
      console.log("crawl: ", param.url, param?.selector, param?.isCapture);

      let resWC = await callWebCrawl(param.url, param.selector, param.isCapture);
      console.log("WebCrawl Response: ", resWC);
      res.send(resWC);

   });

   async function callWebCrawl(url, selector, isCapture) {
      return new Promise(async (resolve, reject) => {
         console.log("[callWebCrawl] start: ", url);
         const browser = await puppeteer.launch({
            'headless': 'new'
         });
         const page = await browser.newPage();
         await page.goto(url);
         console.log("[callWebCrawl] Done get page");
         
         let ret_contents = null;
         if (selector) {
            // css selector
            const results = await page.$$(selector);
            ret_contents = [];
            for (let i = 0; i < results.length; i++) {
               ret_contents.push(await (await results[i].getProperty('textContent')).jsonValue())
            }
         } else {
            ret_contents = await page.content();
         }

         let jsondata = {
            "text": ret_contents,
         };

         if (isCapture) {
            const forder_path = "public/cap";
            // remove old capture
            fs.readdir(forder_path, (err, files) => {
               if (!err) {
                  files.forEach((file) => {
                     const file_path = path.join(forder_path, file);
                     if (path.extname(file_path).toLowerCase() === '.png') {
                        fs.unlink(file_path, unlinkErr => {
                           if (unlinkErr) {
                              console.error(`Unlink failed. ${file}.`, unlinkErr);
                           } else {
                              console.log(`Unlink success. ${file}`);
                           }
                        });
                     }
                  });
               }
            });

            // create capture
            let timestamp = new Date().getTime().toString();
            let capfile_name = `${timestamp}.png`;
            const cap_path = `${forder_path}/${capfile_name}`;
            await page.screenshot({path: cap_path});
            console.log("[callWebCrawl] Done capture");

            jsondata.capture_path = `./cap/${capfile_name}`;
         }

         await browser.close();

         resolve(jsondata);
      });
   };


const port = process.env.PORT || 3000;
server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log('Watson Discovery Server running on port: %d', port);
});
