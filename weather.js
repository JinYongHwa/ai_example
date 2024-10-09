var puppeteer = require('puppeteer');
var OpenAI = require("openai")
var openai = new OpenAI()
var fs = require("fs")
var path = require("path")
async function main() {
    var browser = await puppeteer.launch({
        headless: false,
        args: [
            '--window-size=1920,1080',
        ],
    })
    var page = await browser.newPage({

    })
    page.setViewport({ width: 1920, height: 1080 })
    await page.goto("https://www.weather.go.kr/w/weather/forecast/short-term.do")
    await page.waitForSelector(".dfs-daily-slider.no-scrollbars")
    await new Promise(resolve => setTimeout(resolve, 1000));

    var screenshotPath = path.join(__dirname, "weather.png")
    //스크린 캡쳐
    await page.screenshot({ path: screenshotPath })
    await page.close()
    await browser.close()
    var file = fs.readFileSync(screenshotPath)
    var base64 = file.toString("base64")

    var prompt = `주어진 일기예보사진을 보고 시간대별 날씨와 기온을 정리할것
    let's think about step by step
    let's think logistically
    답변은 한국어로 작성할것
    response json format={
        "hourly": [
            {
                "hour": "number",
                "weather": "string",
                "temperature": "number",
                
            },
            {
                "hour": "number",
                "weather": "string",
                "temperature": "string",
                
            }
        ]

    }`
    var response = await openai.chat.completions.create({
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
    var prompt = `시간대별 기온과 날씨를 입력받아 일기예보를 작성할것
    그리고 오늘의 의상을 추천해줄것
    let's think about step by step
    let's think logistically
    답변은 한국어로 작성할것
    response json format={
        "weather_prompt":"string",
        "recommand_cloths:"string"
    }`
    response = await openai.chat.completions.create({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages: [
            {
                role: "system",
                content: prompt
            },
            {
                role: "user",
                content: `${JSON.stringify(json)}`,
            },
        ],
    });
    var message = response.choices[0].message
    var json = JSON.parse(message.content)
    console.log(json)
}
main()