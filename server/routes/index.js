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


module.exports = router;
