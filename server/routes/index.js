var express = require('express');
var router = express.Router();
var OpenAI=require("openai")
var openai=new OpenAI()

var fs=require("fs")
var path=require("path")
var uuid=require("uuid")
var axios=require("axios")
var staticPath=path.join(__dirname,"../static")
console.log(staticPath)
console.log( uuid.v4() )

var puppeteer=require('puppeteer');



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post("/image/generate",async(req,res)=>{
  console.log(req.body)

  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: req.body.prompt,
    n: 1,
    size: "1024x1024",
  });
  var image_url = response.data[0].url;
  console.log(image_url)
  var imageId=uuid.v4()
  var streamResponse=await axios.get(image_url,{
    responseType: 'stream'
  })
  var filePath=path.join(staticPath,imageId)
  var fileStream=fs.createWriteStream(filePath)
  streamResponse.data.pipe(fileStream)
  streamResponse.data.on("end",()=>{
    res.json({
      result:"success",
      imageUrl:"/api/image/"+imageId
    })
  })

  
})

router.get("/image/:id",async(req,res)=>{
  var id=req.params.id
  var filePath=path.join(staticPath,id)
  console.log(filePath)
  var fileStream=fs.createReadStream(filePath)
  fileStream.pipe(res)
})
router.post("/weather",async(req,res)=>{
  //width: 1920, height: 1080
  var browser=await puppeteer.launch({headless:true,
    args: [
      '--window-size=1920,1080',
    ],
  })
  var page=await browser.newPage()
  page.setViewport({width: 1920, height: 1080});
  await page.goto("https://www.weather.go.kr/w/weather/forecast/short-term.do")
  await page.waitForSelector("body")
  await new Promise((resolve)=>setTimeout(resolve,5000))

  var screenshotPath=path.join(staticPath,uuid.v4()+".png")
  await page.screenshot({path:screenshotPath})  //스크린샷찍기
  await page.close()
  await browser.close()


  var file=fs.readFileSync(screenshotPath)  //파일읽기
  var base64=file.toString("base64")  //base64로 변환
  var prompt=`
    날씨 정보를 알려주는 서비스
    주어진 이미지에서 시간별 예보의 데이터를 분석해서
    시간별로 날씨와 온도를 출력할것
    let's think about step by step
    let's think logically
    json format={
      "hourly_weather":[
        {
          "hour":"number",
          "weather":"string",
          "temperature":"number"
        }
      ]
    }
  `

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: prompt
      },
      {
        role: "user",
        content: [

          {
            type: "image_url",
            image_url: {
              "url": `data:image/png;base64,${base64}`,
            },
          },
        ],
      },
    ],
  });
  var message = response.choices[0].message
  var json = JSON.parse(message.content)
  console.log(json)

  var prompt2=`
    날씨 기상캐스터 서비스이다
    오늘하루의 시간대별 날씨를 분석해서
    기상캐스터처럼 날씨예보를 해주고 오늘의 날씨에 맞는
    적절한 옷차림을 추천해줄것
    예보 및 의상추천은 반드시 한국어로 답변해줘
    json format={
      "weather_prompt:"string",
      "recommand_clothes":"string"  
    }
  `
  const response2 = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      {role:"system",content:prompt2},
      {role:"user",content:JSON.stringify(json)}
    ]
  })
  var message = response2.choices[0].message
  var json = JSON.parse(message.content)
  console.log(json)

  res.json({
    result:"success",
    weather_prompt:json.weather_prompt,
    recommand_clothes:json.recommand_clothes
  })
})


module.exports = router;
