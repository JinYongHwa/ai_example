var puppeteer=require('puppeteer');
var OpenAI=require("openai")
var openai=new OpenAI()

async function main(){
    var browser=await puppeteer.launch({headless:false})
    var page=await browser.newPage()
    await page.goto("https://www.pressian.com/pages/articles/2024091908542299559")
    await page.waitForSelector("body")
    //document.querySelector("body").innerHTML 가져오기
    var bodyHTML=await page.evaluate(()=>document.body.innerHTML)
    

    //script,style 태그 제거하기
    var regex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    var regex2 = /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi;
    bodyHTML=bodyHTML.replace(regex,"")
    bodyHTML=bodyHTML.replace(regex2,"")

     //태그 안의 내용만 추출
    const regex3 = /<[^>]*>/g;
    bodyHTML = bodyHTML.replace(regex3, '');

    //공백, &nbsp; 탭 제거
    const regex4 = /&nbsp;|\t|\n/g;
    bodyHTML = bodyHTML.replace(regex4, '');
    console.log(bodyHTML)

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
            {"role": "system", "content": `뉴스기사를 요약해주는 시스템 사용자가
                    뉴스기사를 입력하면 세줄요약을 하고 적당한 제목도 만들어준다
                    json_format={"title":"string","summary":"string"} `},
            {"role": "user", "content": bodyHTML}
        ]
    });
    var resultContent=completion.choices[0].message
    console.log(resultContent)
    var json=JSON.parse(resultContent.content)
    console.log(json)

}
main()