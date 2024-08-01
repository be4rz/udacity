import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { requiresAuth } from "./middleware/requiresAuthMiddleware.js";
import { filterImageFromURL, deleteLocalFiles, validateImageUrl } from "./util/util.js";
import tokenService from "./service/tokenService.js";

//uncaughtException handler
process.on('uncaughtException', error => {
  console.error(error);
  console.log("Uncaught Exception happened. Continue running the server.");
});

// Init the Express application
const app = express();

// Set the network port
const port = process.env.PORT || 8082;

// Use the body parser middleware for post requests
app.use(bodyParser.json());

// @TODO1 IMPLEMENT A RESTFUL ENDPOINT
// GET /filteredimage?image_url={{URL}}
// endpoint to filter an image from a public url.
// IT SHOULD
//    1
//    1. validate the image_url query
//    2. call filterImageFromURL(image_url) to filter the image
//    3. send the resulting file in the response
//    4. deletes any files on the server on finish of the response
// QUERY PARAMATERS
//    image_url: URL of a publicly accessible image
// RETURNS
//   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

/**************************************************************************** */

app.get("/filteredimage", requiresAuth() ,async (req, res) => {
  //deconstruct image_url
  let { image_url } = req.query;
  console.log("-----------Received image url: " + image_url + "-----------");

  //validate image url
  const isImageUrl = await validateImageUrl(image_url);
  if ( !image_url || !isImageUrl ){
    return res.status(400).send("Bad Request: Invalid image url.")
  }

  //filter the image and send response with image
  console.log("---Begin process image");
  filterImageFromURL(image_url).then((filteredImagePath) => {
    console.log("---Sending image");
    res.sendFile(path.resolve(filteredImagePath), (err) => {
      if (err) {
        console.log("---Error sending image");
        res.status(500).end();
      }
      try{
        const filesPath = [path.resolve(filteredImagePath)];
        deleteLocalFiles(filesPath);
      }catch(error){
        console.log("---Error deleting: "+ filteredImagePath,e);
      }
    });
  }).catch(error => {
    console.log("---Error processing image");
    return res.status(500).send("Internal Server Error: An error occurred while processing the image.")
  });
});

//! END @TODO1

//endpoint to get token for testing purpose
app.get("/token", async (req, res) => {
  const user = { email: "test@email.com"};
  const token = await tokenService.generateTokens(user);
  res.status(200).json(token);
})

// Root Endpoint
// Displays a simple message to the users
app.get("/", async (req, res) => {
  res.send("try GET /filteredimage?image_url={{}}");
});

// Start the Server
app.listen(port, () => {
  console.log(`server running http://localhost:${port}`);
  console.log(`press CTRL+C to stop server`);
});
