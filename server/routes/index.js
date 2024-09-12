var express = require('express');
var router = express.Router();
var OpenAI=require("openai")
var openai=new OpenAI()

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

  res.json({
    result:"success"
  })
})


module.exports = router;
