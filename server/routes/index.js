var express = require('express');
var router = express.Router();
var OpenAI = require("openai")
var openai = new OpenAI()
var puppeteer = require("puppeteer")

var fs = require("fs")
var path = require("path")
var uuid = require("uuid")
var axios = require("axios")
var staticPath = path.join(__dirname, "../static")

var uploadFolder = path.join(__dirname, "../static/upload")
var multer = require("multer")
var upload = multer({ dest: uploadFolder })


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post("/image/generate", async (req, res) => {
  console.log(req.body)

  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: req.body.prompt,
    n: 1,
    size: "1024x1024",
  });
  var image_url = response.data[0].url;
  console.log(image_url)
  var imageId = uuid.v4()
  var streamResponse = await axios.get(image_url, {
    responseType: 'stream'
  })
  var filePath = path.join(staticPath, imageId)
  var fileStream = fs.createWriteStream(filePath)
  streamResponse.data.pipe(fileStream)
  streamResponse.data.on("end", () => {
    res.json({
      result: "success",
      imageUrl: "/api/image/" + imageId
    })
  })


})

router.get("/image/:id", async (req, res) => {
  var id = req.params.id
  var filePath = path.join(staticPath, id)
  console.log(filePath)
  var fileStream = fs.createReadStream(filePath)
  fileStream.pipe(res)
})
router.post("/summary", async (req, res) => {
  var url = req.body.url
  var json = await summary(url)

  res.json(json)
})
router.get("/sound", async (req, res) => {
  var text = req.query.text
  console.log(text)
  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input: text,
  });
  const buffer = Buffer.from(await mp3.arrayBuffer());
  res.end(buffer)
})
router.post("/vision", upload.single("file"), async (req, res) => {
  console.log(req.file)

  var file = fs.readFileSync(req.file.path)
  var base64 = file.toString("base64")

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: "음식 사진을 보고 음식사진의 칼로리를 알려주는 서비스 음식명은 한국어로 출력할것 response json format={calories: 'number', food_name:'string' }"
      },
      {
        role: "user",
        content: [

          {
            type: "image_url",
            image_url: {
              "url": `data:${req.file.mimetype};base64,${base64}`,
            },
          },
        ],
      },
    ],
  });
  var message = response.choices[0].message
  var json = JSON.parse(message.content)
  res.json(json)

})


async function summary(url) {
  var browser = await puppeteer.launch({ headless: false })
  var page = await browser.newPage()
  await page.goto(url)
  await page.waitForSelector("body")
  //document.querySelector("body").innerHTML 가져오기
  var bodyHTML = await page.evaluate(() => document.body.innerHTML)


  //script,style 태그 제거하기
  var regex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
  var regex2 = /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi;
  bodyHTML = bodyHTML.replace(regex, "")
  bodyHTML = bodyHTML.replace(regex2, "")

  //태그 안의 내용만 추출
  const regex3 = /<[^>]*>/g;
  bodyHTML = bodyHTML.replace(regex3, '');

  //공백, &nbsp; 탭 제거
  const regex4 = /&nbsp;|\t|\n/g;
  bodyHTML = bodyHTML.replace(regex4, '');
  console.log(bodyHTML)

  await page.close()
  await browser.close()

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        "role": "system", "content": `뉴스기사를 요약해주는 시스템 사용자가
                  뉴스기사를 입력하면 세줄요약을 하고 적당한 제목도 만들어준다
                  json_format={"title":"string","summary":"string"} `},
      { "role": "user", "content": bodyHTML }
    ]
  });
  var resultContent = completion.choices[0].message
  console.log(resultContent)
  var json = JSON.parse(resultContent.content)
  console.log(json)
  return json
}



module.exports = router;
