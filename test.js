//import OpenAI from "openai";
const OpenAI=require("openai");

async function main(){
    const openai = new OpenAI({
        
    });
    const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {"role":"system","content":"사주를 봐주는 챗봇 사용자가 생년월일을 입력하면, 연애운,재물운을 설명한다"},
            {"role": "user", "content": "1989년 1월 9일"}
        ]
    });
    console.log(completion.choices[0].message);
}

main();

