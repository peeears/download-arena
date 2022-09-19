const Arena = require("are.na");
const fs = require("fs");
const client = require("https");

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    client.get(url, (res) => {
      if (res.statusCode === 200) {
        res
          .pipe(fs.createWriteStream(filepath))
          .on("error", reject)
          .once("close", () => resolve(filepath));
      } else {
        // Consume response data to free up memory
        res.resume();
        reject(
          new Error(`Request Failed With a Status Code: ${res.statusCode}`)
        );
      }
    });
  });
}

const arena = new Arena();

async function getImages() {
  let pageNumber = 1;
  let channelLength = true;
  try {
    do {
      let returnedChannel = await arena
        .channel("books-with-b-w-cover")
        .get({ page: pageNumber, per: 200 })
        .then((chan) => {
          chan.contents.map((item) => {
            if (item.image === null) return;
            let url = item.image.original.url;
            let filepath = `images/${item.title}-${Date.now()}.jpg`;
            downloadImage(url, filepath).then(console.log).catch(console.error);
          });
          return chan.contents.length;
        })
        .catch((err) => console.log(err));
      if (returnedChannel) {
        pageNumber++;
      } else {
        channelLength = false;
      }
    } while (channelLength);
  } catch (error) {
    console.log(error);
  }
}

getImages();
