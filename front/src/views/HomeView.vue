<template>
    <div class="container">
      <v-textarea
      v-model="prompt" 
      placeholder="인공지능이 그릴 그림을 설명해주세요" 
      :auto-grow="true" 
      variant="outlined"></v-textarea>

      <div class="text-center">
        <v-btn color="primary" @click="submit">그리기</v-btn>
      </div>
      <div>
        <img :src="imageUrl" v-if="imageUrl">
      </div>
    </div>
</template>

<script>
import { defineComponent } from 'vue';

// Components
import HelloWorld from '../components/HelloWorld.vue';

export default defineComponent({
  name: 'HomeView',

  components: {
    HelloWorld,
  },
  data(){
    return{
      prompt:"",
      imageUrl:null
    }
  },
  methods:{
    submit(){
      if(this.prompt==""){
        alert("명령어를 작성해주세요")
        return
      }
      this.$axios.post("/api/image/generate",{
        prompt:this.prompt
      })
      .then(response=>{
        this.imageUrl=response.data.imageUrl
      })
    }
  }
});
</script>
