<template>
    <v-container>
        <div class="text-center">
            <v-btn @click="askWeather" color="primary">기상예보 보기</v-btn>
        </div>
        <div v-if="weather_prompt">
            <h2>날씨 예보</h2>
            <p>{{weather_prompt}}</p>
        </div>
        <div v-if="recommand_clothes">
            <h2>추천 의상</h2>
            <p>{{recommand_clothes}}</p>
        </div>

    </v-container>
</template>
<script>
export default{
    data(){
        return{
            weather_prompt:null,
            recommand_clothes:null
        }
    }, 

    methods:{
        async askWeather(){
            var response=await this.$axios.post("/api/weather")
            console.log(response.data)
            if(response.data.result=='success'){
                this.weather_prompt=response.data.weather_prompt
                this.recommand_clothes=response.data.recommand_clothes
            }
        }
    }
}
</script>
<style></style>